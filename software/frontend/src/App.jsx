import { useState, useEffect, useMemo } from 'react';
import './App.css';
import MapComponent from './components/map/Map.jsx';
import api from './api/client.js';

// 公園のデータリスト
const majorParks = [
  { name: '公園を選択...', coords: [35.65, 139.35], zoom: 12 }, // 中心を多摩地域に設定
  { name: '桜ヶ丘公園', coords: [35.6379, 139.4614], zoom: 15 },
  { name: '長沼公園', coords: [35.6383, 139.3683], zoom: 15 },
  { name: '平山城址公園', coords: [35.6476, 139.3802], zoom: 15 },
  { name: '小山田緑地', coords: [35.5964, 139.4186], zoom: 15 },
  { name: '小山内裏公園', coords: [35.6061, 139.3664], zoom: 15 },
  { name: '八王子霊園', coords: [35.6599, 139.2692], zoom: 15 },
];

// デモ用の事前分類データ（多摩地域の公園に合わせて配置）
const seedResults = [
  // 桜ヶ丘公園: T-201 履歴（健康→要注意→危険）
  { tree_id: 'T-201', latitude: 35.6379, longitude: 139.4614, risk_score: 0.30, cause_analysis: '葉色は概ね良好。軽微なストレス兆候あり。', countermeasure: '定期観察・水分管理を徹底。', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString() },
  { tree_id: 'T-201', latitude: 35.6379, longitude: 139.4614, risk_score: 0.62, cause_analysis: '部分的な黄化と葉量の減少が進行。', countermeasure: '土壌改良と養生、支柱での安定化検討。', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
  { tree_id: 'T-201', latitude: 35.6379, longitude: 139.4614, risk_score: 0.84, cause_analysis: '枯れ込みが顕著。落枝リスク増大。', countermeasure: '緊急の樹勢回復措置、場合により伐採検討。', timestamp: new Date().toISOString() },
  // 小山田緑地: T-101（健康）
  { tree_id: 'T-101', latitude: 35.5964, longitude: 139.4186, risk_score: 0.22, cause_analysis: '樹勢は良好で異常なし。', countermeasure: '通常の維持管理（剪定・潅水）。', timestamp: new Date().toISOString() },
  // 長沼公園: T-301（要注意）
  { tree_id: 'T-301', latitude: 35.6383, longitude: 139.3683, risk_score: 0.55, cause_analysis: '乾燥気味で葉の黄化。', countermeasure: 'マルチングと適切な灌水、肥培管理。', timestamp: new Date().toISOString() },
];

function App() {
  const [formData, setFormData] = useState({
    tree_id: 'T-001',
    latitude: 35.65,
    longitude: 139.35,
  });
  const [analysisResults, setAnalysisResults] = useState([]);
  // tree_idをキーにした履歴マップ: { [tree_id]: Array<AnalysisItem> }
  const [historyByTreeId, setHistoryByTreeId] = useState({});
  // 詳細モーダル
  const [selectedTreeId, setSelectedTreeId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 地図の中心とズームの状態
  const [mapCenter, setMapCenter] = useState(majorParks[0].coords);
  const [mapZoom, setMapZoom] = useState(majorParks[0].zoom);

  // 初期データの投入
  useEffect(() => {
    if (analysisResults.length === 0) {
      setAnalysisResults(seedResults);
      const grouped = seedResults.reduce((acc, item) => {
        if (!acc[item.tree_id]) acc[item.tree_id] = [];
        acc[item.tree_id].push(item);
        return acc;
      }, {});
      setHistoryByTreeId(grouped);
    }
  }, [analysisResults.length]);

  // 地図用に最新のみ抽出
  const latestResults = useMemo(() => {
    const items = [];
    Object.entries(historyByTreeId).forEach(([_, list]) => {
      if (list.length > 0) items.push(list[list.length - 1]);
    });
    return items;
  }, [historyByTreeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post(
        '/analysis/analyze',
        {
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }
      );
      const data = response.data || {};
      const item = {
        tree_id: data.tree_id ?? formData.tree_id,
        latitude: typeof data.latitude === 'number' ? data.latitude : parseFloat(formData.latitude),
        longitude: typeof data.longitude === 'number' ? data.longitude : parseFloat(formData.longitude),
        risk_score: data.risk_score ?? 0,
        cause_analysis: data.cause_analysis ?? '',
        countermeasure: data.countermeasure ?? '',
        timestamp: new Date().toISOString(),
      };
      setAnalysisResults((prev) => [...prev, item]);
      // 履歴に追加（tree_idごと）
      setHistoryByTreeId((prev) => {
        const list = prev[item.tree_id] ? [...prev[item.tree_id]] : [];
        list.push(item);
        return { ...prev, [item.tree_id]: list };
      });
    } catch (err) {
      setError('分析に失敗しました。サーバーが起動しているか確認してください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleParkChange = (e) => {
    const selectedPark = majorParks[e.target.value];
    if (selectedPark) {
      setMapCenter(selectedPark.coords);
      setMapZoom(selectedPark.zoom);
      setFormData((prev) => ({
        ...prev,
        latitude: selectedPark.coords[0],
        longitude: selectedPark.coords[1],
      }));
    }
  };

  const openDetails = (treeId) => {
    setSelectedTreeId(treeId);
    setIsModalOpen(true);
  };

  const closeDetails = () => {
    setIsModalOpen(false);
  };
  
  // ラベル生成
  const getRiskLabel = (score) => {
    if (score > 0.7) return '❌ 危険 (Danger / Dead)';
    if (score > 0.4) return '⚠️ 要注意 (Caution / Early Symptoms)';
    return '🌳 健康 (Healthy)';
  };
  // リスクスコアに応じてカードの色を変えるヘルパー関数
  const getRiskColor = (score) => {
    if (score > 0.7) return 'risk-high';
    if (score > 0.4) return 'risk-medium';
    return 'risk-low';
  };

  // デフォルトはクリーンなライトスタイル（CARTO）。衛星に切り替える場合は下のコメントを利用。
  const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
  // 衛星スタイル例:
  // const tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  // const tileAttribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

  return (
    <div className="app-layout">
      <div className="map-pane">
        <MapComponent
          analysisResults={latestResults}
          center={mapCenter}
          zoom={mapZoom}
          onTreeSelect={openDetails}
          containerStyle={{ height: '100vh', width: '100%' }}
          tileUrl={tileUrl}
          tileAttribution={tileAttribution}
        />
      </div>
      <aside className="sidebar">
        <header>
          <h1>Tokyo Tree Doctor</h1>
        </header>

        {/* 公園検索のドロップダウン */}
        <div className="search-park">
          <label htmlFor="park-select">公園を選択して移動:</label>
          <select id="park-select" onChange={handleParkChange} defaultValue={0}>
            {majorParks.map((park, index) => (
              <option key={park.name} value={index}>
                {park.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="analysis-form">
          <div className="form-group">
            <label htmlFor="tree_id">樹木ID</label>
            <input
              type="text"
              id="tree_id"
              name="tree_id"
              value={formData.tree_id}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* 緯度経度の入力はUIから非表示（分類デモ向けに簡素化） */}
          <button type="submit" disabled={loading}>
            {loading ? '分析中...' : '分析実行'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {/* 最新の結果（分類表示） */}
        {analysisResults.length > 0 && (() => {
          const latest = analysisResults[analysisResults.length - 1];
          return (
            <div className={`result-card ${getRiskColor(latest.risk_score)}`}>
              <h2>{getRiskLabel(latest.risk_score)}</h2>
              <div className="result-details">
                <h3>原因分析</h3>
                <p>{latest.cause_analysis}</p>
                <h3>対策提案</h3>
                <p>{latest.countermeasure}</p>
                <button type="button" onClick={() => openDetails(latest.tree_id)} style={{ marginTop: '1rem' }}>履歴</button>
              </div>
            </div>
          );
        })()}

        {/* ツリー一覧（最新状態、分類表示） */}
        {Object.keys(historyByTreeId).length > 0 && (
          <div className="analysis-form">
            <h3>登録された樹木</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Object.entries(historyByTreeId).map(([treeId, list]) => {
                const latest = list[list.length - 1];
                return (
                  <li key={treeId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                    <span>
                      <b>{treeId}</b> — {getRiskLabel(latest.risk_score)}
                    </span>
                    <button type="button" onClick={() => openDetails(treeId)}>履歴</button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </aside>

      {/* 詳細モーダル（分類中心） */}
      {isModalOpen && selectedTreeId && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>履歴: {selectedTreeId}</h3>
              <button type="button" className="modal-close" onClick={closeDetails}>×</button>
            </div>
            <div className="modal-body">
              <ul className="history-list">
                {historyByTreeId[selectedTreeId]?.map((it, idx) => (
                  <li key={idx} className={`history-item ${getRiskColor(it.risk_score)}`}>
                    <div className="history-row">
                      <span className="history-time">{new Date(it.timestamp).toLocaleString()}</span>
                      <span className="history-score">{getRiskLabel(it.risk_score)}</span>
                    </div>
                    <div className="history-details">
                      <div>
                        <b>原因</b>
                        <p>{it.cause_analysis}</p>
                      </div>
                      <div>
                        <b>対策</b>
                        <p>{it.countermeasure}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
