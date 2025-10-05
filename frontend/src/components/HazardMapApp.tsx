import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trees, Share2, Download, User, Mail } from 'lucide-react';
import MapboxMap from './map/MapboxMap';
import { PARK_DATA, DRONE_SURVEY_DATA } from '../constants/mapbox';

interface Park {
  id: string;
  name: string;
  description: string;
  coordinates: number[];
}

// 先に宣言（関数宣言はホイスティングされる）
function StatsCard({ currentData, selectedParkName }: { currentData: any; selectedParkName: string | null }) {
  const totalFromBreakdown = (currentData?.damageStats?.healthy ?? 0) + (currentData?.damageStats?.warning ?? 0) + (currentData?.damageStats?.danger ?? 0);
  const total = currentData?.damageStats?.total ?? totalFromBreakdown;
  const healthyPercent = currentData?.damageStats?.healthyPercent ?? (total > 0 ? Math.round(((currentData?.damageStats?.healthy ?? 0) / total) * 1000) / 10 : 0);
  const warningPercent = currentData?.damageStats?.warningPercent ?? (total > 0 ? Math.round(((currentData?.damageStats?.warning ?? 0) / total) * 1000) / 10 : 0);
  const dangerPercent = currentData?.damageStats?.dangerPercent ?? (total > 0 ? Math.round(((currentData?.damageStats?.danger ?? 0) / total) * 1000) / 10 : 0);

  // アニメーション進捗（0→1）
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const startAt = performance.now();
    const durationMs = 900;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const t = Math.min(1, (now - startAt) / durationMs);
      setProgress(easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setProgress(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [healthyPercent, warningPercent, dangerPercent]);

  const size = 120; // px
  const stroke = 20; // px (thicker ring)
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const healthyLen = (healthyPercent / 100) * circumference * progress;
  const warningLen = (warningPercent / 100) * circumference * progress;
  const dangerLen = (dangerPercent / 100) * circumference * progress;

  // 始点を12時方向に（-90deg回転）し、順にhealthy→warning→dangerで描画
  const baseOffset = circumference * 0.25; // 12時始点
  const healthyOffset = baseOffset;
  const warningOffset = baseOffset - healthyLen;
  const dangerOffset = baseOffset - healthyLen - warningLen;

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(2,6,23,0.08)] border border-white/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">リスク評価統計{selectedParkName ? `（${selectedParkName}）` : ''}</h2>
        <span className="text-xs text-slate-600">総数: {total}</span>
      </div>

      <div className="flex items-center gap-5">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
          <defs>
            <linearGradient id="gHealthy" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gWarning" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="gDanger" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#eef2ff" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="url(#gHealthy)" strokeWidth={stroke} strokeDasharray={`${healthyLen} ${circumference - healthyLen}`} strokeDashoffset={healthyOffset} strokeLinecap="round" />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="url(#gWarning)" strokeWidth={stroke} strokeDasharray={`${warningLen} ${circumference - warningLen}`} strokeDashoffset={warningOffset} strokeLinecap="round" />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="url(#gDanger)" strokeWidth={stroke} strokeDasharray={`${dangerLen} ${circumference - dangerLen}`} strokeDashoffset={dangerOffset} strokeLinecap="round" />
          {/* center label removed intentionally */}
        </svg>

        <div className="flex-1 grid grid-cols-3 gap-4 text-center text-base text-slate-800" style={{ opacity: progress }}>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="inline-block rounded-full" style={{ width: 12, height: 12, background: 'linear-gradient(135deg,#34d399,#10b981)' }} />
              <span className="text-sm font-medium text-slate-600">健康</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">{healthyPercent}%</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="inline-block rounded-full" style={{ width: 12, height: 12, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }} />
              <span className="text-sm font-medium text-slate-600">要注意</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">{warningPercent}%</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="inline-block rounded-full" style={{ width: 12, height: 12, background: 'linear-gradient(135deg,#f87171,#ef4444)' }} />
              <span className="text-sm font-medium text-slate-600">危険</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">{dangerPercent}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisSection({ currentData, currentRisk }: { currentData: any; currentRisk: 'red'|'yellow' }) {
  const percent = Math.max(0, Math.min(100, Number(currentData?.causeAnalysis?.mainCausePercent ?? 0)));
  
  // サマリー情報を生成
  const getSummaryInfo = () => {
    if (!currentData) return null;
    
    const { damageStats, causeAnalysis, proposals } = currentData;
    const riskLevel = damageStats?.dangerPercent > 30 ? '高リスク' : damageStats?.dangerPercent > 15 ? '中リスク' : '低リスク';
    
    return {
      riskLevel,
      mainCause: causeAnalysis?.mainCause || 'カシナガキクイムシ被害',
      climateImpact: causeAnalysis?.climateImpact || '+2.0℃',
      rainfallDecrease: causeAnalysis?.rainfallDecrease || '-10%',
      emergencyCount: proposals?.emergency || 0,
      preventionRange: proposals?.preventionRange || '300m',
      priority: proposals?.priority || '中',
      description: causeAnalysis?.description || '樹木の健康状態に影響を与える要因が複合的に作用しています。'
    };
  };

  const summaryInfo = getSummaryInfo();

  return (
    <div className="space-y-3">
      {/* 調査済み（次は専門家派遣） */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(2,6,23,0.08)] border border-white/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-medium border border-emerald-100">調査済み</span>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">原因分析・対策</h2>
          </div>
          <div className="flex items-center gap-1">
            <Link to={{ pathname: '/cause', search: `?risk=${currentRisk}` }} className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors">原因</Link>
            <Link to={{ pathname: '/damage', search: `?risk=${currentRisk}` }} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">対策</Link>
          </div>
        </div>
        
        {/* サマリー情報 */}
        {summaryInfo && (
          <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-medium border border-blue-100">サマリー</span>
              <span className="text-xs font-medium text-slate-700">{summaryInfo.riskLevel}エリア</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-600">主要因:</span>
                <span className="font-medium text-slate-800 ml-1">{summaryInfo.mainCause}</span>
              </div>
              <div>
                <span className="text-slate-600">気候影響:</span>
                <span className="font-medium text-slate-800 ml-1">{summaryInfo.climateImpact}</span>
              </div>
              <div>
                <span className="text-slate-600">降雨減少:</span>
                <span className="font-medium text-slate-800 ml-1">{summaryInfo.rainfallDecrease}</span>
              </div>
              <div>
                <span className="text-slate-600">緊急対応:</span>
                <span className="font-medium text-slate-800 ml-1">{summaryInfo.emergencyCount}本</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-600 leading-relaxed">
              {summaryInfo.description}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">主要因</span>
            <span className="text-xs font-medium text-slate-800">{currentData?.causeAnalysis?.mainCause || 'カシナガキクイムシ被害'}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">影響度</span>
            <span className="font-medium text-slate-800">{percent}%</span>
          </div>
        </div>
      </div>

      {/* 未調査（次はドローン派遣） */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(2,6,23,0.08)] border border-white/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-medium border border-slate-200">未調査</span>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">原因分析・対策</h2>
          </div>
        </div>

        {/* 未調査エリアのサマリー */}
        <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-medium border border-amber-100">推奨アクション</span>
            <span className="text-xs font-medium text-slate-700">ドローン調査</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-600">調査範囲:</span>
              <span className="font-medium text-slate-800 ml-1">{summaryInfo?.preventionRange || '300m'}</span>
            </div>
            <div>
              <span className="text-slate-600">優先度:</span>
              <span className="font-medium text-slate-800 ml-1">{summaryInfo?.priority || '中'}</span>
            </div>
            <div>
              <span className="text-slate-600">推定時間:</span>
              <span className="font-medium text-slate-800 ml-1">2-3時間</span>
            </div>
            <div>
              <span className="text-slate-600">精度:</span>
              <span className="font-medium text-slate-800 ml-1">95%</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-600 leading-relaxed">
            高解像度カメラと赤外線センサーによる詳細な樹木健康診断を実施し、リスク要因を特定します。
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">推奨</span>
            <span className="text-xs font-medium text-slate-800">ドローン調査の実施</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="bg-slate-400 h-1.5 rounded-full transition-all duration-500" style={{ width: '60%' }} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">進捗</span>
            <span className="font-medium text-slate-800">60%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const HazardMapApp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentRisk = (searchParams.get('risk') || 'red').toLowerCase().startsWith('y') ? 'yellow' : 'red';
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // In-page modals
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const handleParkSelect = (park: Park) => {
    setSelectedPark(park);
  };

  // 地図上のリスク評価プロットから統計を計算
  const calculateStatsFromMapData = (parkId: string) => {
    const surveyData = DRONE_SURVEY_DATA[parkId];
    if (!surveyData) return null;

    let totalTrees = 0;
    let healthyTrees = 0;
    let warningTrees = 0;
    let dangerTrees = 0;

    console.log(`[DEBUG] Calculating stats for park: ${parkId}`);
    console.log(`[DEBUG] Survey data:`, surveyData);

    surveyData.forEach((point: any) => {
      const treeCount = point.treeCount;
      totalTrees += treeCount;

      console.log(`[DEBUG] Point ${point.id}: riskLevel=${point.riskLevel}, treeCount=${treeCount}`);

      // リスクレベルに基づいて分類（修正版）
      if (point.riskLevel === 'high' || point.riskLevel === 'critical') {
        dangerTrees += treeCount; // 危険（赤）
        console.log(`[DEBUG] Added to danger: ${treeCount}`);
      } else if (point.riskLevel === 'medium') {
        warningTrees += treeCount; // 要注意（黄）
        console.log(`[DEBUG] Added to warning: ${treeCount}`);
      } else if (point.riskLevel === 'low') {
        healthyTrees += treeCount; // 健康（緑）- 低リスクのみ
        console.log(`[DEBUG] Added to healthy: ${treeCount}`);
      } else {
        // 未分類の場合は要注意に分類
        warningTrees += treeCount;
        console.log(`[DEBUG] Added to warning (unknown): ${treeCount}`);
      }
    });

    console.log(`[DEBUG] Final counts - Total: ${totalTrees}, Healthy: ${healthyTrees}, Warning: ${warningTrees}, Danger: ${dangerTrees}`);

    if (totalTrees === 0) return null;

    const result = {
      total: totalTrees,
      healthy: healthyTrees,
      warning: warningTrees,
      danger: dangerTrees,
      healthyPercent: Math.round((healthyTrees / totalTrees) * 100 * 10) / 10,
      warningPercent: Math.round((warningTrees / totalTrees) * 100 * 10) / 10,
      dangerPercent: Math.round((dangerTrees / totalTrees) * 100 * 10) / 10
    };

    console.log(`[DEBUG] Final result:`, result);
    return result;
  };

  const getParkData = () => {
    if (!selectedPark) return null;
    
    console.log(`[DEBUG] Getting park data for: ${selectedPark.id}`);
    
    // 地図データから統計を計算
    const mapStats = calculateStatsFromMapData(selectedPark.id);
    console.log(`[DEBUG] Map stats result:`, mapStats);
    
    if (mapStats) {
      console.log(`[DEBUG] Using map stats data`);
      return {
        damageStats: mapStats,
        causeAnalysis: {
          mainCause: 'カシナガキクイムシ被害',
          mainCausePercent: mapStats.dangerPercent > 50 ? 78 : 45,
          climateImpact: '+2.3℃',
          rainfallDecrease: '-15%',
          description: 'ナラ枯れの主要因としてカシナガキクイムシによる被害が全体の78%を占めています。'
        },
        proposals: {
          emergency: Math.round(mapStats.danger * 0.3),
          preventionRange: '500m',
          improvements: Math.round(mapStats.warning * 0.2),
          priority: mapStats.dangerPercent > 30 ? '高' : '中',
          description: `高リスク${Math.round(mapStats.danger * 0.3)}本の即座な防除処理を実施。`
        }
      };
    }

    // 地図データがない場合は既存のデータを使用
    console.log(`[DEBUG] Using PARK_DATA fallback`);
    const data = PARK_DATA[selectedPark.id as keyof typeof PARK_DATA];
    console.log(`[DEBUG] PARK_DATA for ${selectedPark.id}:`, data);
    
    if (!data) return null;
    const { total, healthy, warning, danger } = data.damageStats;
    const calculatedData = {
      ...data,
      damageStats: {
        ...data.damageStats,
        healthyPercent: total > 0 ? Math.round((healthy / total) * 100 * 10) / 10 : 0,
        warningPercent: total > 0 ? Math.round((warning / total) * 100 * 10) / 10 : 0,
        dangerPercent: total > 0 ? Math.round((danger / total) * 100 * 10) / 10 : 0
      }
    };
    console.log(`[DEBUG] Calculated data:`, calculatedData);
    return calculatedData;
  };

  const parkData = getParkData();

  const defaultData = {
    damageStats: {
      total: 1863,
      healthy: 523, // 低リスクのみを健康として定義
      warning: 979, // 中リスクと未分類を含む
      danger: 361,
      healthyPercent: Math.round((523 / 1863) * 100 * 10) / 10,
      warningPercent: Math.round((979 / 1863) * 100 * 10) / 10,
      dangerPercent: Math.round((361 / 1863) * 100 * 10) / 10
    },
    causeAnalysis: {
      mainCause: 'カシナガキクイムシ被害',
      mainCausePercent: 78,
      climateImpact: '+2.3℃',
      rainfallDecrease: '-15%',
      description: 'ナラ枯れの主要因としてカシナガキクイムシによる被害が全体の78%を占めています。'
    },
    proposals: {
      emergency: 131,
      preventionRange: '500m',
      improvements: 24,
      priority: '高',
      description: '高リスク131本の即座な防除処理を実施。'
    }
  };

  const currentData = parkData || defaultData;

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(125%_125%_at_50%_0%,#f0f9ff_0%,#eef2ff_35%,#e2e8f0_100%)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <Header onOpenShare={() => setIsShareOpen(true)} onOpenExport={() => setIsExportOpen(true)} onOpenUser={() => setIsUserOpen(true)} />
      <div className="h-12" />
      <main className="w-full max-w-none px-2 sm:px-3 lg:px-4 py-1" style={{ height: 'calc(100dvh - 3rem)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)] gap-3 lg:gap-4 h-full min-h-0">
          <div className="w-full h-full min-h-0 min-w-0 overflow-hidden">
            <div className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(2,6,23,0.08)] overflow-hidden h-full">
              <div className="relative bg-gray-100 flex items-center justify-center h-full" style={{ width: '100%', minHeight: 'unset', display: 'block' }}>
                <MapboxMap
                  className="w-full h-full absolute inset-0"
                  onParkSelect={handleParkSelect}
                  selectedParkId={selectedPark?.id || null}
                  showHeatmap={showHeatmap}
                  onRiskSelect={(risk) => {
                    const search = new URLSearchParams(window.location.search);
                    search.set('risk', risk);
                    const newUrl = `${window.location.pathname}?${search.toString()}`;
                    window.history.replaceState(null, '', newUrl);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-3 lg:gap-4 h-full min-h-0 min-w-0 overflow-hidden">
            <div className="shrink-0 min-w-0">
              <StatsCard currentData={currentData} selectedParkName={selectedPark?.name || null} />
            </div>
            <div className="flex-1 min-h-0 min-w-0 overflow-auto">
              <AnalysisSection currentData={currentData} currentRisk={currentRisk as 'red'|'yellow'} />
            </div>
          </div>
        </div>
      </main>

      {isShareOpen && <ShareModal onClose={() => setIsShareOpen(false)} />}
      {isExportOpen && <ExportModal onClose={() => setIsExportOpen(false)} />}
      {isUserOpen && <UserModal onClose={() => setIsUserOpen(false)} />}
    </div>
  );
};

// ヘッダーコンポーネント（モーダル起動ボタン付き）
const Header = React.memo(({ onOpenShare, onOpenExport, onOpenUser }: { onOpenShare: () => void; onOpenExport: () => void; onOpenUser: () => void; }) => (
  <header className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
    <div className="mx-2 sm:mx-3 lg:mx-4 mt-2">
      <div className="rounded-xl border border-white/60 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_rgba(16,185,129,0.35)] text-white">
        <div className="w-full max-w-none px-2 sm:px-3 lg:px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30" initial={{ y: 50, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
              <Trees className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </motion.div>
            <motion.span className="text-lg sm:text-xl font-semibold tracking-wide text-white/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
              Tokyo Tree Doctor
            </motion.span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onOpenShare} className="flex items-center gap-2 bg-white/95 text-emerald-700 px-3 py-2 rounded-lg text-xs sm:text-sm shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"><Share2 className="w-4 h-4" />共有</button>
            <button onClick={onOpenExport} className="flex items-center gap-2 bg-white/95 text-emerald-700 px-3 py-2 rounded-lg text-xs sm:text-sm shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"><Download className="w-4 h-4" />エクスポート</button>
            <button onClick={onOpenUser} className="flex items-center gap-2 bg-white/95 text-emerald-700 px-3 py-2 rounded-lg text-xs sm:text-sm shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"><User className="w-4 h-4" />ユーザー</button>
          </div>
        </div>
      </div>
    </div>
  </header>
));

// 汎用モーダル
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-3 rounded-2xl bg-white/95 backdrop-blur shadow-[0_12px_40px_rgba(2,6,23,0.25)] border border-white/60">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 transition-colors">×</button>
        </div>
        <div className="p-4">{children}</div>
        <div className="px-4 py-3 border-t border-slate-200/70 flex justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm bg-slate-900 text-white hover:bg-slate-800">閉じる</button>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = React.useMemo(() => {
    const url = new URL(window.location.href);
    return url.toString();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const webShare = async () => {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: 'Tokyo Tree Doctor', text: 'リスク評価マップを共有', url: shareUrl });
      } catch {}
    } else {
      copy();
    }
  };

  return (
    <Modal title="共有" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-sm text-slate-700">このビューを共有します。URLをコピーするか、端末の共有機能を使えます。</div>
        <div className="flex items-center gap-2">
          <input readOnly value={shareUrl} className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800" />
          <button onClick={copy} className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700">{copied ? 'コピー済' : 'コピー'}</button>
        </div>
        <div className="flex justify-end">
          <button onClick={webShare} className="px-3 py-2 rounded-lg text-sm bg-slate-100 text-slate-800 hover:bg-slate-200">共有シートを開く</button>
        </div>
      </div>
    </Modal>
  );
}

function ExportModal({ onClose }: { onClose: () => void }) {
  const download = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCsv = () => {
    const rows = [
      ['id', 'health', 'risk'],
      ['t-001', 'healthy', 'low'],
      ['t-002', 'warning', 'mid'],
      ['t-003', 'danger', 'high']
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    download('export.csv', csv, 'text/csv;charset=utf-8;');
  };

  const handleJson = () => {
    const data = { exportedAt: new Date().toISOString(), items: [{ id: 't-001', risk: 'low' }] };
    download('export.json', JSON.stringify(data, null, 2), 'application/json');
  };

  return (
    <Modal title="エクスポート" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-sm text-slate-700">データをダウンロードします。形式を選択してください。</div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleCsv} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 hover:bg-slate-50 text-left">CSV で保存</button>
          <button onClick={handleJson} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 hover:bg-slate-50 text-left">JSON で保存</button>
        </div>
        <div className="text-[11px] text-slate-500">注: 表示中のリスクビューに基づくサンプル出力です。</div>
      </div>
    </Modal>
  );
}

function UserModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = React.useState<string>(() => localStorage.getItem('user_name') || 'Demo User');
  const [email, setEmail] = React.useState<string>(() => localStorage.getItem('user_email') || 'demo@example.com');

  const initials = React.useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] || 'U') + (parts[1]?.[0] || '');
  }, [name]);

  const handleSave = () => {
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_email', email);
    onClose();
  };

  const handleReset = () => {
    setName('Demo User');
    setEmail('demo@example.com');
  };

  return (
    <Modal title="ユーザー設定" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-semibold shadow-soft select-none">
              {initials.toUpperCase()}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">プロフィール</div>
              <div className="text-[11px] text-slate-500">表示名とメールはローカルに保存されます</div>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-[11px] border border-slate-200">Viewer</span>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-xs text-slate-600">表示名</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 山田 太郎" className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none" />
            </div>
            <p className="text-[11px] text-slate-500">共有時のクレジット表記に使用されます</p>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs text-slate-600">メール</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="例: example@mail.com" className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none" />
            </div>
            <p className="text-[11px] text-slate-500">通知やエクスポート時の連絡先（今は保存のみ）</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={handleReset} className="px-3 py-2 rounded-lg text-sm bg-slate-100 text-slate-800 hover:bg-slate-200">リセット</button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 text-slate-800 hover:bg-slate-50">キャンセル</button>
            <button onClick={handleSave} className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700">保存</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default HazardMapApp;