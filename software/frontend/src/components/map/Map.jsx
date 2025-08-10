// src/components/map/Map.jsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// デフォルトのマーカーアイコンの設定 (Leafletのデフォルトアイコンのパス解決のため)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconRetinaUrl: icon,
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// 地図の中心とズームを動的に変更し、サイズを再計算するコンポーネント
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // レイアウト変化後にサイズを再計算
    setTimeout(() => map.invalidateSize(), 0);
  }, [center, zoom, map]);
  useEffect(() => {
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [map]);
  return null;
}

function getMarkerColor(score) {
  if (score > 0.7) return '#e76f51'; // red
  if (score > 0.4) return '#e9c46a'; // orange
  return '#2a9d8f'; // green
}

function createColoredDivIcon(color) {
  const size = 18;
  const border = 2;
  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: ${border}px solid white;
      border-radius: ${size}px;
      box-shadow: 0 0 6px rgba(0,0,0,0.3);
    "></div>
  `;
  return L.divIcon({
    html,
    className: 'risk-div-icon',
    iconSize: [size + border * 2, size + border * 2],
    iconAnchor: [size / 2 + border, size + border],
    popupAnchor: [0, -(size + border)],
  });
}

function getClassificationLabel(score) {
  if (score > 0.7) return '❌ 危険 (Danger / Dead)';
  if (score > 0.4) return '⚠️ 要注意 (Caution / Early Symptoms)';
  return '🌳 健康 (Healthy)';
}

// 東京〜多摩エリアのバウンディングボックス（西側を拡張して八王子周辺を含める）
const tokyoBounds = L.latLngBounds([35.50, 139.20], [35.82, 139.92]);

function MapComponent({ analysisResults, center, zoom, onTreeSelect, containerStyle, tileUrl, tileAttribution }) {
  const mapCenter = center ?? [35.6812, 139.7671];
  const mapZoom = typeof zoom === 'number' ? zoom : 13;

  const url = tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = tileAttribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      minZoom={11}
      maxZoom={19}
      maxBounds={tokyoBounds}
      maxBoundsViscosity={1.0}
      worldCopyJump={false}
      style={containerStyle ?? { height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <ChangeView center={mapCenter} zoom={mapZoom} />
      <TileLayer
        attribution={attribution}
        url={url}
        noWrap={true}
      />
      {analysisResults &&
        analysisResults.map((result) => {
          const color = getMarkerColor(result.risk_score);
          const icon = createColoredDivIcon(color);
          return (
            <Marker
              key={`${result.tree_id}-${result.latitude}-${result.longitude}`}
              position={[result.latitude, result.longitude]}
              icon={icon}
              eventHandlers={
                onTreeSelect
                  ? {
                      click: () => onTreeSelect(result.tree_id),
                    }
                  : undefined
              }
            >
              <Popup>
                <b>{getClassificationLabel(result.risk_score)}</b>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}

export default MapComponent;
export { ChangeView };


