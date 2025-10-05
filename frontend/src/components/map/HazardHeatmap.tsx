import React, { useEffect, useRef, useCallback } from 'react';
import { hazardMapService } from '../../services/hazardMapService';

interface HazardHeatmapProps {
  map: any;
  parkId?: string;
  visible: boolean;
  onHazardPointClick?: (point: any) => void;
}

const LAYER_ID = 'hazard-points-layer';
const CLUSTER_LAYER_ID = 'hazard-clusters-layer';
const CLUSTER_COUNT_LAYER_ID = 'hazard-cluster-count-layer';
const SOURCE_ID = 'hazard-points-source';

const HazardHeatmap: React.FC<HazardHeatmapProps> = ({
  map,
  parkId,
  visible,
  onHazardPointClick
}) => {
  const hasLayerRef = useRef<boolean>(false);
  const clickHandlerRef = useRef<((e: any) => void) | null>(null);
  const mouseEnterHandlerRef = useRef<(() => void) | null>(null);
  const mouseLeaveHandlerRef = useRef<(() => void) | null>(null);

  // クリーンアップ関数（メモ化）
  const cleanup = useCallback(() => {
    if (!map || !map.isStyleLoaded()) {
      console.log('Cleanup: マップが利用できません', { mapExists: !!map, styleLoaded: map?.isStyleLoaded() });
      return;
    }

    try {
      // イベントリスナーを削除
      if (clickHandlerRef.current) {
        map.off('click', LAYER_ID, clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
      if (mouseEnterHandlerRef.current) {
        map.off('mouseenter', LAYER_ID, mouseEnterHandlerRef.current);
        mouseEnterHandlerRef.current = null;
      }
      if (mouseLeaveHandlerRef.current) {
        map.off('mouseleave', LAYER_ID, mouseLeaveHandlerRef.current);
        mouseLeaveHandlerRef.current = null;
      }

      // レイヤーとソースを削除（存在チェック付き）
      try {
        if (map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
          map.removeLayer(CLUSTER_COUNT_LAYER_ID);
        }
        if (map.getLayer(CLUSTER_LAYER_ID)) {
          map.removeLayer(CLUSTER_LAYER_ID);
        }
        if (map.getLayer(LAYER_ID)) {
          map.removeLayer(LAYER_ID);
        }
        if (map.getSource(SOURCE_ID)) {
          map.removeSource(SOURCE_ID);
        }
      } catch (layerError) {
        console.log('レイヤー/ソース削除エラー（無視）:', layerError);
      }
      
      hasLayerRef.current = false;
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }, [map]);

  // リスクスコアから色を取得
  const getRiskColor = (riskScore: number): string => {
    if (riskScore <= 1) return '#10b981';      // 緑（低リスク）
    if (riskScore <= 2) return '#fbbf24';      // 黄（中リスク）
    if (riskScore <= 3) return '#f59e0b';      // オレンジ（中高リスク）
    if (riskScore <= 4) return '#ef4444';      // 赤（高リスク）
    return '#7f1d1d';                          // 濃い赤（非常に高リスク）
  };

  // リスクスコアからサイズを取得
  const getRiskSize = (riskScore: number): number => {
    if (riskScore <= 1) return 4;              // 小さな点
    if (riskScore <= 2) return 6;              // 中程度の円
    if (riskScore <= 3) return 8;              // 大きな円
    if (riskScore <= 4) return 10;             // 非常に大きな円
    return 12;                                 // 最大サイズ
  };

  // ハザードデータの読み込みと描画（メモ化）
  const loadHazardData = useCallback(async () => {
    if (!map || !visible) return;

    try {
      // 一時的にAPI呼び出しを無効化して公園選択の問題を分離
      console.log('HazardHeatmap: API呼び出しをスキップ', { parkId });
      return;
      
      // データを取得（一時的にコメントアウト）
      // const meshData = await hazardMapService.getHazardMeshData(parkId);
      
      // 既存のレイヤーとソースをクリーンアップ
      // cleanup();

      // メッシュデータをポイントデータに変換（一時的にコメントアウト）
      // const pointFeatures = meshData.features.map(feature => {
      //   const { properties, geometry } = feature;
      //   const centerLng = (geometry.coordinates[0][0][0] + geometry.coordinates[0][2][0]) / 2;
      //   const centerLat = (geometry.coordinates[0][0][1] + geometry.coordinates[0][2][1]) / 2;
      //   
      //   return {
      //     type: 'Feature' as const,
      //     geometry: {
      //       type: 'Point' as const,
      //       coordinates: [centerLng, centerLat]
      //   },
      //     properties: {
      //       ...properties,
      //       risk_color: getRiskColor(properties.risk_score),
      //       risk_size: getRiskSize(properties.risk_score),
      //       risk_level: properties.risk_score <= 1 ? 'low' : 
      //                  properties.risk_score <= 2 ? 'medium' : 
      //                  properties.risk_score <= 3 ? 'high' : 'critical'
      //     }
      //   };
      // });

      // const pointGeoJSON: GeoJSON.FeatureCollection = {
      //   type: 'FeatureCollection',
      //   features: pointFeatures
      // };

      // 新しいソースを追加（一時的にコメントアウト）
      // map.addSource(SOURCE_ID, {
      //   type: 'geojson',
      //   data: pointGeoJSON,
      //   cluster: true,
      //   clusterMaxZoom: 14,
      //   clusterRadius: 50
      // });

      // クラスター円レイヤー（一時的にコメントアウト）
      // map.addLayer({
      //   id: CLUSTER_LAYER_ID,
      //   type: 'circle',
      //   source: SOURCE_ID,
      //   filter: ['has', 'point_count'],
      //   paint: {
      //     'circle-color': [
      //       'step',
      //       ['get', 'point_count'],
      //       '#51bbd6',
      //       100,
      //       '#f1f075',
      //       750,
      //       '#f28cb1'
      //     ],
      //     'circle-radius': [
      //       'step',
      //       ['get', 'point_count'],
      //       20,
      //       100,
      //       30,
      //       750,
      //       40
      //     ]
      //   },
      //   layout: {
      //     'visibility': visible ? 'visible' : 'none'
      //   }
      // });

      // クラスター数表示レイヤー（一時的にコメントアウト）
      // map.addLayer({
      //   id: CLUSTER_COUNT_LAYER_ID,
      //   type: 'symbol',
      //   source: SOURCE_ID,
      //   filter: ['has', 'point_count'],
      //   layout: {
      //     'text-field': '{point_count_abbreviated}',
      //     'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      //     'text-size': 12,
      //     'visibility': visible ? 'visible' : 'none'
      //   },
      //   paint: {
      //     'text-color': '#ffffff'
      //   }
      // });

      // 個別ポイントレイヤー（一時的にコメントアウト）
      // map.addLayer({
      //   id: LAYER_ID,
      //   type: 'circle',
      //   source: SOURCE_ID,
      //   filter: ['!', ['has', 'point_count']],
      //   paint: {
      //     'circle-color': ['get', 'risk_color'],
      //     'circle-radius': ['get', 'risk_size'],
      //     'circle-opacity': 0.8,
      //     'circle-stroke-width': 2,
      //     'circle-stroke-color': '#ffffff',
      //     'circle-stroke-opacity': 0.8
      //   },
      //   layout: {
      //     'visibility': visible ? 'visible' : 'none'
      //   }
      // });

      // クリックイベントハンドラー（一時的にコメントアウト）
      // if (onHazardPointClick) {
      //   clickHandlerRef.current = (e) => {
      //     if (e.features.length > 0) {
      //       const feature = e.features[0];
      //       if (feature.sourceLayer === LAYER_ID || feature.layer.id === LAYER_ID) {
      //       onHazardPointClick(feature);
      //     }
      //   }
      // };
      //   map.on('click', LAYER_ID, clickHandlerRef.current);
      // }

      // マウスホバー効果（一時的にコメントアウト）
      // mouseEnterHandlerRef.current = () => {
      //   map.getCanvas().style.cursor = 'pointer';
      // };
      // mouseLeaveHandlerRef.current = () => {
      //   map.getCanvas().style.cursor = '';
      // };

      // map.on('mouseenter', LAYER_ID, mouseEnterHandlerRef.current);
      // map.on('mouseleave', LAYER_ID, mouseLeaveHandlerRef.current);

      // hasLayerRef.current = true;

    } catch (error) {
      console.error('Failed to load hazard data:', error);
      hasLayerRef.current = false;
    }
  }, [map, parkId, visible, cleanup, onHazardPointClick]);

  // メインエフェクト（データ読み込みと描画）
  useEffect(() => {
    if (!map) return;

    const initializeHazardMap = () => {
      if (map.isStyleLoaded() && visible) {
        loadHazardData();
      }
    };

    // マップの準備ができているか確認
    if (map.isStyleLoaded()) {
      initializeHazardMap();
    } else {
      // スタイルが読み込まれるのを待つ
      const handleStyleData = () => {
        if (map.isStyleLoaded()) {
          initializeHazardMap();
          map.off('styledata', handleStyleData);
        }
      };
      map.on('styledata', handleStyleData);

      // クリーンアップでイベントリスナーを削除
      return () => {
        map.off('styledata', handleStyleData);
        cleanup();
      };
    }

    // コンポーネントのアンマウント時のクリーンアップ
    return cleanup;
  }, [map, parkId, visible, loadHazardData, cleanup]);

  // 可視性の制御（最適化版）
  useEffect(() => {
    if (!map || !hasLayerRef.current) return;

    // レイヤーの可視性を更新
    const updateVisibility = () => {
      try {
        const visibility = visible ? 'visible' : 'none';
        
        if (map.getLayer(LAYER_ID)) {
          map.setLayoutProperty(LAYER_ID, 'visibility', visibility);
        }
        if (map.getLayer(CLUSTER_LAYER_ID)) {
          map.setLayoutProperty(CLUSTER_LAYER_ID, 'visibility', visibility);
        }
        if (map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
          map.setLayoutProperty(CLUSTER_COUNT_LAYER_ID, 'visibility', visibility);
        }
      } catch (error) {
        console.error('Failed to update visibility:', error);
      }
    };

    // マップの準備ができている場合のみ実行
    if (map.isStyleLoaded()) {
      updateVisibility();
    } else {
      // スタイルロード後に実行
      const handleStyleLoad = () => {
        updateVisibility();
        map.off('styledata', handleStyleLoad);
      };
      map.once('styledata', handleStyleLoad);
    }
  }, [map, visible]);

  return null;
};

export default HazardHeatmap;