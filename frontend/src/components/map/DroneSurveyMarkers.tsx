import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { DroneSurveyPoint } from '../../constants/mapbox';

interface DroneSurveyMarkersProps {
  map: mapboxgl.Map | null;
  surveyData: DroneSurveyPoint[];
  visible: boolean;
  onMarkerClick?: (point: DroneSurveyPoint) => void;
}

const DroneSurveyMarkers: React.FC<DroneSurveyMarkersProps> = ({
  map,
  surveyData,
  visible,
  onMarkerClick
}) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const sourcesRef = useRef<string[]>([]);
  const layersRef = useRef<string[]>([]);
  const eventHandlersRef = useRef<Map<string, (e: any) => void>>(new Map());

  // 調査範囲の色を取得（メモ化）- リスクレベルに応じた色を統一
  const getRangeColor = useCallback((status: string, riskLevel: string) => {
    // リスクレベルに応じた色を統一（調査状況に関係なく）
    const colors: Record<string, string> = {
      'low': '#10b981',        // 緑（低リスク）
      'medium': '#fbbf24',     // 黄色（中リスク）
      'high': '#ef4444',       // 赤（高リスク）
      'critical': '#dc2626'    // 濃い赤（緊急リスク）
    };
    return colors[riskLevel] || '#fbbf24'; // デフォルトは黄色
  }, []);

  // 調査範囲のサイズを取得（メモ化）- より多様なサイズ
  const getRangeSize = useCallback((riskLevel: string, treeCount: number, id: string) => {
    // 公園ごとに異なるベースサイズを設定
    const parkBaseSizes: Record<string, number> = {
      'sakuragaoka': 30,
      'naganuma': 25,
      'hirayama': 20, // 平山城址公園をより小さく
      'koyamada': 20,
      'koyanaidai': 28
    };
    
    // 公園IDからベースサイズを取得
    const parkId = id.split('-')[0];
    let baseSize = parkBaseSizes[parkId] || 30;
    
    // リスクレベルに応じた調整（より細かい調整）
    const riskAdjustments: Record<string, number> = {
      'critical': 120,
      'high': 90,
      'medium': 60,
      'low': 30
    };
    baseSize += riskAdjustments[riskLevel] || 0;
    
    // 樹木数に応じた範囲調整（より細かい調整）
    if (treeCount > 50) baseSize += 100;
    else if (treeCount > 40) baseSize += 80;
    else if (treeCount > 30) baseSize += 60;
    else if (treeCount > 20) baseSize += 40;
    else if (treeCount > 10) baseSize += 20;
    else baseSize += 10;
    
    // 公園の敷地内に収まるよう最大サイズを制限
    const maxSizes: Record<string, number> = {
      'sakuragaoka': 150,
      'naganuma': 120,
      'hirayama': 100, // 平山城址公園の最大サイズを小さく
      'koyamada': 100,
      'koyanaidai': 140
    };
    
    return Math.min(baseSize, maxSizes[parkId] || 150);
  }, []);

  // 多様な形状の調査範囲を生成
  const generateShapeCoordinates = useCallback((center: [number, number], size: number, shapeType: string, id: string) => {
    const coordinates: [number, number][] = [];
    const earthRadius = 6371000;
    const lat1Rad = center[1] * Math.PI / 180;
    const lon1Rad = center[0] * Math.PI / 180;
    
    // 公園ごとに異なる形状を決定（すべて不規則な形状に変更）
    const parkId = id.split('-')[0];
    const shapeTypes: Record<string, string> = {
      'sakuragaoka': 'irregular',
      'naganuma': 'irregular',
      'hirayama': 'irregular',
      'koyamada': 'irregular',
      'koyanaidai': 'irregular',
      'hachioji': 'irregular'
    };
    
    const finalShapeType = shapeType || shapeTypes[parkId] || 'irregular';
    
    switch (finalShapeType) {
      case 'ellipse':
        // 楕円形（縦長）
        return generateEllipseCoordinates(center, size * 0.8, size * 1.2);
        
      case 'polygon':
        // 六角形
        return generatePolygonCoordinates(center, size, 6);
        
      case 'rectangle':
        // 長方形
        return generateRectangleCoordinates(center, size * 0.7, size * 1.3);
        
      case 'star':
        // 星形
        return generateStarCoordinates(center, size);
        
      case 'irregular':
        // 不規則な形状
        return generateIrregularCoordinates(center, size, id);
        
      default:
        // 円形（デフォルト）
        return generateCircleCoordinates(center, size);
    }
  }, []);

  // 円形の座標生成
  const generateCircleCoordinates = useCallback((center: [number, number], radiusMeters: number, points: number = 32) => {
    const coordinates: [number, number][] = [];
    const earthRadius = 6371000;
    const lat1Rad = center[1] * Math.PI / 180;
    const lon1Rad = center[0] * Math.PI / 180;
    const angularDistance = radiusMeters / earthRadius;
    
    const sinLat1 = Math.sin(lat1Rad);
    const cosLat1 = Math.cos(lat1Rad);
    const cosAngularDistance = Math.cos(angularDistance);
    const sinAngularDistance = Math.sin(angularDistance);
    const angleStep = (2 * Math.PI) / points;

    for (let i = 0; i < points; i++) {
      const angle = angleStep * i;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      
      const lat2 = Math.asin(
        sinLat1 * cosAngularDistance +
        cosLat1 * sinAngularDistance * cosAngle
      );
      const lon2 = lon1Rad + Math.atan2(
        sinAngle * sinAngularDistance * cosLat1,
        cosAngularDistance - sinLat1 * Math.sin(lat2)
      );

      coordinates.push([
        lon2 * 180 / Math.PI,
        lat2 * 180 / Math.PI
      ]);
    }

    coordinates.push(coordinates[0]);
    return coordinates;
  }, []);

  // 楕円形の座標生成
  const generateEllipseCoordinates = useCallback((center: [number, number], width: number, height: number, points: number = 32) => {
    const coordinates: [number, number][] = [];
    const earthRadius = 6371000;
    const lat1Rad = center[1] * Math.PI / 180;
    const lon1Rad = center[0] * Math.PI / 180;
    
    const angleStep = (2 * Math.PI) / points;

    for (let i = 0; i < points; i++) {
      const angle = angleStep * i;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      
      // 楕円のパラメータ
      const a = width / earthRadius;
      const b = height / earthRadius;
      
      const lat2 = lat1Rad + a * cosAngle;
      const lon2 = lon1Rad + b * sinAngle;

      coordinates.push([
        lon2 * 180 / Math.PI,
        lat2 * 180 / Math.PI
      ]);
    }

    coordinates.push(coordinates[0]);
    return coordinates;
  }, []);

  // 多角形の座標生成
  const generatePolygonCoordinates = useCallback((center: [number, number], radius: number, sides: number) => {
    const coordinates: [number, number][] = [];
    const earthRadius = 6371000;
    const lat1Rad = center[1] * Math.PI / 180;
    const lon1Rad = center[0] * Math.PI / 180;
    const angularDistance = radius / earthRadius;
    
    const angleStep = (2 * Math.PI) / sides;

    for (let i = 0; i < sides; i++) {
      const angle = angleStep * i;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      
      const lat2 = Math.asin(
        Math.sin(lat1Rad) * Math.cos(angularDistance) +
        Math.cos(lat1Rad) * Math.sin(angularDistance) * cosAngle
      );
      const lon2 = lon1Rad + Math.atan2(
        sinAngle * Math.sin(angularDistance) * Math.cos(lat1Rad),
        Math.cos(angularDistance) - Math.sin(lat1Rad) * Math.sin(lat2)
      );

      coordinates.push([
        lon2 * 180 / Math.PI,
        lat2 * 180 / Math.PI
      ]);
    }

    coordinates.push(coordinates[0]);
    return coordinates;
  }, []);

  // 長方形の座標生成
  const generateRectangleCoordinates = useCallback((center: [number, number], width: number, height: number) => {
    const earthRadius = 6371000;
    const lat1Rad = center[1] * Math.PI / 180;
    const lon1Rad = center[0] * Math.PI / 180;
    
    const latOffset = (height / 2) / earthRadius * (180 / Math.PI);
    const lonOffset = (width / 2) / earthRadius * (180 / Math.PI) / Math.cos(lat1Rad);
    
    const coordinates: [number, number][] = [
      [center[0] - lonOffset, center[1] - latOffset],
      [center[0] + lonOffset, center[1] - latOffset],
      [center[0] + lonOffset, center[1] + latOffset],
      [center[0] - lonOffset, center[1] + latOffset],
      [center[0] - lonOffset, center[1] - latOffset]
    ];
    
    return coordinates;
  }, []);

  // 星形の座標生成
  const generateStarCoordinates = useCallback((center: [number, number], size: number) => {
    const coordinates: [number, number][] = [];
    const earthRadius = 6371000;
    const lat1Rad = center[1] * Math.PI / 180;
    const lon1Rad = center[0] * Math.PI / 180;
    const angularDistance = size / earthRadius;
    
    const points = 10; // 5つの突起
    const angleStep = (2 * Math.PI) / points;

    for (let i = 0; i < points; i++) {
      const angle = angleStep * i;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      
      // 星の突起と凹みを交互に
      const radius = i % 2 === 0 ? angularDistance : angularDistance * 0.5;
      
      const lat2 = Math.asin(
        Math.sin(lat1Rad) * Math.cos(radius) +
        Math.cos(lat1Rad) * Math.sin(radius) * cosAngle
      );
      const lon2 = lon1Rad + Math.atan2(
        sinAngle * Math.sin(radius) * Math.cos(lat1Rad),
        Math.cos(radius) - Math.sin(lat1Rad) * Math.sin(lat2)
      );

      coordinates.push([
        lon2 * 180 / Math.PI,
        lat2 * 180 / Math.PI
      ]);
    }

    coordinates.push(coordinates[0]);
    return coordinates;
  }, []);

  // 不規則な形状の座標生成（公園ごとに異なる変動パターン）
  const generateIrregularCoordinates = useCallback((center: [number, number], size: number, id: string) => {
    const coordinates: [number, number][] = [];
    const earthRadius = 6371000;
    const lat1Rad = center[1] * Math.PI / 180;
    const lon1Rad = center[0] * Math.PI / 180;
    
    // 公園ごとに異なるポイント数と変動パターンを設定
    const parkId = id.split('-')[0];
    const parkConfigs: Record<string, { points: number, minVariation: number, maxVariation: number }> = {
      'sakuragaoka': { points: 10, minVariation: 0.6, maxVariation: 1.4 }, // より複雑
      'naganuma': { points: 8, minVariation: 0.7, maxVariation: 1.3 }, // 標準
      'hirayama': { points: 12, minVariation: 0.5, maxVariation: 1.5 }, // より複雑
      'koyamada': { points: 6, minVariation: 0.8, maxVariation: 1.2 }, // シンプル
      'koyanaidai': { points: 9, minVariation: 0.65, maxVariation: 1.35 } // 中程度
    };
    
    const config = parkConfigs[parkId] || { points: 8, minVariation: 0.7, maxVariation: 1.3 };
    const angleStep = (2 * Math.PI) / config.points;

    for (let i = 0; i < config.points; i++) {
      const angle = angleStep * i;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      
      // 公園ごとに異なる変動パターン
      const variation = config.minVariation + Math.random() * (config.maxVariation - config.minVariation);
      const radius = (size * variation) / earthRadius;
      
      const lat2 = Math.asin(
        Math.sin(lat1Rad) * Math.cos(radius) +
        Math.cos(lat1Rad) * Math.sin(radius) * cosAngle
      );
      const lon2 = lon1Rad + Math.atan2(
        sinAngle * Math.sin(radius) * Math.cos(lat1Rad),
        Math.cos(radius) - Math.sin(lat1Rad) * Math.sin(lat2)
      );

      coordinates.push([
        lon2 * 180 / Math.PI,
        lat2 * 180 / Math.PI
      ]);
    }

    coordinates.push(coordinates[0]);
    return coordinates;
  }, []);

  // ポップアップコンテンツ生成を最適化
  const generatePopupContent = useCallback((properties: any) => {
    // 調査状況を統一
    const getStatusText = (status: string) => {
      if (status === 'completed') {
        return '調査済み';
      } else {
        return '未調査';
      }
    };

    // リスクレベルを色に基づいて表示
    const getRiskText = (riskLevel: string) => {
      if (riskLevel === 'high' || riskLevel === 'critical') {
        return '危険';
      } else if (riskLevel === 'medium') {
        return '要注意';
      } else if (riskLevel === 'low') {
        return '健康';
      } else {
        return '要注意';
      }
    };

    // 公園名を取得
    const parkId = properties.id.split('-')[0];
    const parkNames: Record<string, string> = {
      'sakuragaoka': '桜ヶ丘公園',
      'naganuma': '長沼公園',
      'hirayama': '平山城址公園',
      'koyamada': '小山田緑地',
      'koyanaidai': '小山内裏公園'
    };
    const parkName = parkNames[parkId] || '公園';

    // タイトルを統一
    const titleText = `${parkName}リスク評価`;
    
    // リスクレベルに応じて色を決定
    const titleColor = (properties.riskLevel === 'high' || properties.riskLevel === 'critical') ? '#ef4444' : '#fbbf24';

    const isCompleted = properties.status === 'completed';
    
    return `
      <div class="p-3 max-w-xs">
        <h3 class="font-bold text-sm mb-2" style="color: ${titleColor};">${titleText}</h3>
        <div class="space-y-1 text-xs text-gray-600">
          <p><strong>調査状況:</strong> ${getStatusText(properties.status)}</p>
          <p><strong>調査日:</strong> ${new Date(properties.surveyDate).toLocaleDateString('ja-JP')}</p>
          <p><strong>面積:</strong> ${Math.round(properties.treeCount * 15)}㎡</p>
          <p><strong>リスクレベル:</strong> ${getRiskText(properties.riskLevel)}</p>
          ${!isCompleted ? `
            <div class="mt-3 pt-2 border-t border-gray-200">
              <button 
                onclick="alert('ドローン派遣を依頼しました。\\n\\n派遣予定日: ${new Date(properties.surveyDate).toLocaleDateString('ja-JP')}\\n調査エリア: ${Math.round(properties.treeCount * 15)}㎡\\n\\n担当者から連絡いたします。')"
                style="background-color: #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 500; border: none; cursor: pointer; width: 100%;"
                onmouseover="this.style.backgroundColor='#2563eb'"
                onmouseout="this.style.backgroundColor='#3b82f6'"
              >
                ドローン派遣を依頼
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }, []);

  // 調査範囲をクリーンアップ
  const cleanupRanges = useCallback(() => {
    if (!map || map._removed || !map.isStyleLoaded()) {
      return;
    }

    try {
      // イベントハンドラーを削除
      eventHandlersRef.current.forEach((handler, eventKey) => {
        const [event, layerId] = eventKey.split(':');
        try {
          map.off(event as any, layerId, handler);
        } catch (error) {
          // エラーは無視
        }
      });
      eventHandlersRef.current.clear();

      // レイヤーを削除
      layersRef.current.forEach(layerId => {
        try {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        } catch (error) {
          // エラーは無視
        }
      });

      // ソースを削除
      sourcesRef.current.forEach(sourceId => {
        try {
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        } catch (error) {
          // エラーは無視
        }
      });

      layersRef.current = [];
      sourcesRef.current = [];
    } catch (error) {
      console.error('DroneSurveyMarkers cleanup failed:', error);
    }
  }, [map]);

  // 調査範囲を追加
  const addSurveyRanges = useCallback(() => {
    if (!map || !visible) return;

    cleanupRanges();

    // 健康（低リスク）以外のデータのみをフィルタリング
    const filteredData = surveyData.filter(point => point.riskLevel !== 'low');

    // バッチ処理で効率化
    const features = filteredData.map((point, index) => {
                      const rangeSize = getRangeSize(point.riskLevel, point.treeCount, point.id);
        const shapeCoordinates = generateShapeCoordinates(point.coordinates, rangeSize, '', point.id);
      
      const sourceId = `survey-range-${index}`;
      const fillLayerId = `survey-range-fill-${index}`;
      const borderLayerId = `survey-range-border-${index}`;
      const color = getRangeColor(point.status, point.riskLevel);

      // GeoJSONデータを作成
      const geoJsonData = {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [shapeCoordinates]
        },
        properties: {
          id: point.id,
          status: point.status,
          riskLevel: point.riskLevel,
          treeCount: point.treeCount,
          description: point.description,
          surveyDate: point.surveyDate
        }
      };

      // ソースを追加
      map.addSource(sourceId, {
        type: 'geojson',
        data: geoJsonData
      });

      // 塗りつぶしレイヤーを追加
      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.3
        }
      });

      // 境界線レイヤーを追加
      map.addLayer({
        id: borderLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': color,
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      sourcesRef.current.push(sourceId);
      layersRef.current.push(fillLayerId, borderLayerId);

      // クリックイベントハンドラーを作成して保存
      const clickHandler = (e: mapboxgl.MapMouseEvent) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const popupContent = generatePopupContent(feature.properties);

          new mapboxgl.Popup()
            .setLngLat(point.coordinates)
            .setHTML(popupContent)
            .addTo(map);

          onMarkerClick?.(point);
        }
      };

      // マウスエンターハンドラー
      const mouseEnterHandler = () => {
        map.getCanvas().style.cursor = 'pointer';
      };

      // マウスリーブハンドラー
      const mouseLeaveHandler = () => {
        map.getCanvas().style.cursor = '';
      };

      // イベントハンドラーを登録して参照を保存
      map.on('click', fillLayerId, clickHandler);
      map.on('mouseenter', fillLayerId, mouseEnterHandler);
      map.on('mouseleave', fillLayerId, mouseLeaveHandler);

      eventHandlersRef.current.set(`click:${fillLayerId}`, clickHandler);
      eventHandlersRef.current.set(`mouseenter:${fillLayerId}`, mouseEnterHandler);
      eventHandlersRef.current.set(`mouseleave:${fillLayerId}`, mouseLeaveHandler);

      return { sourceId, fillLayerId, borderLayerId, color };
    });
  }, [map, visible, surveyData, getRangeColor, getRangeSize, generateCircleCoordinates, generatePopupContent, cleanupRanges, onMarkerClick]);

  useEffect(() => {
    if (!map || !visible) {
      return;
    }

    const handleStyleLoad = () => {
      addSurveyRanges();
    };

    if (map.isStyleLoaded()) {
      addSurveyRanges();
    } else {
      map.once('style.load', handleStyleLoad);
      
      return () => {
        map.off('style.load', handleStyleLoad);
        cleanupRanges();
      };
    }

    return () => {
      cleanupRanges();
    };
  }, [map, visible, addSurveyRanges, cleanupRanges]);

  return null;
};

export default DroneSurveyMarkers;