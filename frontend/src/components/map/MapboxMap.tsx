import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_VIEW_STATE, DEFAULT_MAP_STYLE, TOKYO_PARKS, DRONE_SURVEY_DATA } from '../../constants/mapbox';
import HazardHeatmap from './HazardHeatmap';
import DroneSurveyMarkers from './DroneSurveyMarkers';

interface Park {
  id: string;
  name: string;
  coordinates: number[];
  description: string;
}

interface MapboxMapProps {
  className?: string;
  onParkSelect?: (park: Park) => void;
  selectedParkId?: string | null;
  showHeatmap?: boolean;
  onDispatchDrone?: (coordinates: [number, number]) => void;
  onRiskSelect?: (risk: 'red' | 'yellow') => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  className, 
  onParkSelect, 
  selectedParkId,
  showHeatmap = false,
  onDispatchDrone,
  onRiskSelect
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedPark, setSelectedPark] = useState<string | null>(selectedParkId || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHazardPoint, setSelectedHazardPoint] = useState<any>(null);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const previousParkRef = useRef<string | null>(null);

  useEffect(() => { setSelectedPark(selectedParkId || null); }, [selectedParkId]);

  const filteredParks = useMemo(() => {
    if (!searchQuery.trim()) return TOKYO_PARKS;
    const q = searchQuery.toLowerCase();
    return TOKYO_PARKS.filter((p: Park) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [searchQuery]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    let center: [number, number] = [DEFAULT_VIEW_STATE.longitude, DEFAULT_VIEW_STATE.latitude];
    let zoom = DEFAULT_VIEW_STATE.zoom;
    if (selectedParkId) {
      const initialPark = TOKYO_PARKS.find((p: Park) => p.id === selectedParkId);
      if (initialPark && initialPark.coordinates.length === 2) {
        center = initialPark.coordinates as [number, number];
        zoom = 16;
      }
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: DEFAULT_MAP_STYLE,
      center,
      zoom,
      language: 'ja',
      preserveDrawingBuffer: true,
    });
    map.current = m;

    // 既定のインタラクション（スクロールズームのみ許可）
    try {
      (m.scrollZoom as any).enable({ around: 'center' });
      m.doubleClickZoom.disable();
      m.dragPan.enable();
      m.dragRotate.enable();
      m.keyboard.disable();
      m.boxZoom.disable();
      m.touchZoomRotate.disable();
    } catch {}

    const nav = new mapboxgl.NavigationControl({ showCompass: true, showZoom: false, visualizePitch: true });
    m.addControl(nav, 'top-right');

    m.on('load', () => {
      setIsMapReady(true);
      try {
        // Mapboxのデフォルト処理を信頼し、カスタムwheelハンドラは付けない
        m.scrollZoom.setWheelZoomRate(1/120);
        m.scrollZoom.setZoomRate(1/100);
      } catch {}
    });

    m.on('error', (e) => console.error('マップエラー:', e));

    return () => { m.remove(); map.current = null; setIsMapReady(false); };
  }, []);

  useEffect(() => {
    if (!map.current || !selectedPark || !isMapReady) return;
    if (previousParkRef.current === selectedPark) return;
    const target = TOKYO_PARKS.find((p: Park) => p.id === selectedPark);
    if (!target || target.coordinates.length !== 2) return;
    const [lng, lat] = target.coordinates;
    map.current.flyTo({ center: [lng, lat], zoom: 16, duration: 1200, essential: true });
    previousParkRef.current = selectedPark;
  }, [selectedPark, isMapReady]);

  const handleParkSelect = useCallback((park: Park) => { setSelectedPark(park.id); onParkSelect?.(park); setSearchQuery(''); }, [onParkSelect]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div ref={mapContainer} className="w-full h-full" />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 z-20 hover:bg-white transition-colors"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {map.current && selectedPark && isMapReady && DRONE_SURVEY_DATA[selectedPark] && (
        <DroneSurveyMarkers
          map={map.current}
          surveyData={DRONE_SURVEY_DATA[selectedPark]}
          visible={true}
          onMarkerClick={(point) => { /* no-op */ }}
        />
      )}

      {selectedPark && DRONE_SURVEY_DATA[selectedPark] && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-20">
          <div className="text-sm font-semibold text-gray-800 mb-2">リスク評価</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">危</div>
              <span className="text-xs text-gray-700">危険 (赤)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">注</div>
              <span className="text-xs text-gray-700">要注意 (黄)</span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`absolute top-0 left-0 h-full bg-white/20 backdrop-blur-md shadow-xl transition-transform duration-300 z-10 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="w-48 sm:w-56 md:w-64 h-full p-4 overflow-y-auto">
          <div className="flex items-center justify-end mb-4">
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3"><h4 className="text-sm font-semibold text-gray-800">公園検索</h4></div>
            <div className="mb-4"><input type="text" placeholder="公園名で検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" /></div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredParks.map((park: Park) => (
                <button key={park.id} onClick={() => handleParkSelect(park)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${selectedPark === park.id ? 'bg-emerald-100 text-emerald-800 font-medium shadow-sm border border-emerald-200' : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-sm border border-transparent'}`}>
                  <div className="font-medium">{park.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{park.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isHazardModalOpen && selectedHazardPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ハザードポイント詳細</h3>
            <p className="text-sm text-gray-700 mb-4"><strong>種類:</strong> {selectedHazardPoint.type}</p>
            <p className="text-sm text-gray-700 mb-4"><strong>座標:</strong> {selectedHazardPoint.coordinates.join(', ')}</p>
            <p className="text-sm text-gray-700 mb-4"><strong>説明:</strong> {selectedHazardPoint.description}</p>
            <p className="text-sm text-gray-700 mb-4"><strong>危険度:</strong> {selectedHazardPoint.hazardLevel}</p>
            <p className="text-sm text-gray-700 mb-4"><strong>報告日時:</strong> {new Date(selectedHazardPoint.timestamp).toLocaleString()}</p>
            <div className="flex justify-end mt-4"><button onClick={() => { setIsHazardModalOpen(false); setSelectedHazardPoint(null); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">閉じる</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;