import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const PageShell: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <header className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white shadow-lg">
      <div className="w-full max-w-none px-2 sm:px-3 lg:px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
            <span className="text-lg font-bold">TT</span>
          </div>
          <span className="text-lg font-semibold tracking-wide text-white/95">Tokyo Tree Doctor</span>
        </div>
        <Link to="/" className="px-3 py-1.5 rounded-lg bg-white text-emerald-700 text-sm font-medium hover:bg-gray-50 shadow-sm">ダッシュボードへ戻る</Link>
      </div>
    </header>
    <main className="w-full max-w-none px-2 sm:px-3 lg:px-4 py-4">
      <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </main>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="rounded-xl p-4 border bg-white/70 shadow-sm">
    <div className="text-sm text-slate-600 mb-1">{label}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
);

const CauseDetailsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const riskParam = (searchParams.get('risk') || 'red').toLowerCase();
  const risk: 'red' | 'yellow' = riskParam.startsWith('y') || riskParam === 'medium' || riskParam === 'low' ? 'yellow' : 'red';

  const textByRisk = useMemo(() => ({
    red: {
      title: '原因分析の詳細（高リスク: 赤）',
      insect: '南向き斜面の乾燥地帯で増加。被害進行が速く、即時の防除計画が必要。',
      climate: '高温少雨が顕著。水分ストレスが強く、周辺樹木への波及に注意。',
      soil: '酸性化と栄養不足が顕著。短期の土壌改良と施肥を優先。'
    },
    yellow: {
      title: '原因分析の詳細（注意リスク: 黄）',
      insect: '局所的に発生。モニタリングを継続し、増加傾向があれば早期対応。',
      climate: '季節的な乾燥影響。簡易灌水や被覆でストレス軽減が有効。',
      soil: '軽度の酸性化。堆肥投入や表層改善で中期的な回復を目指す。'
    }
  } as const), []);

  const palette = risk === 'red'
    ? { accent: 'red', border: 'border-red-200', bgSoft: 'bg-red-50/30' }
    : { accent: 'amber', border: 'border-amber-200', bgSoft: 'bg-amber-50/30' };

  const onSwitchRisk = (next: 'red'|'yellow') => {
    const params = new URLSearchParams(searchParams);
    params.set('risk', next);
    setSearchParams(params);
  };

  return (
    <PageShell title="原因分析の詳細">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* リスク切替 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">リスク表示:</span>
          <button
            onClick={() => onSwitchRisk('red')}
            className={`px-3 py-1 rounded-lg text-sm border ${risk==='red' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'}`}
          >赤（高）</button>
          <button
            onClick={() => onSwitchRisk('yellow')}
            className={`px-3 py-1 rounded-lg text-sm border ${risk==='yellow' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'}`}
          >黄（注意）</button>
        </div>
        {/* 概要セクション（重複のため削除） */}

        {/* 統計セクション（リスク別で切替） */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">主要指標</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(risk === 'red' ? [
              { label: '主因: 害虫影響', value: '82%', color: 'text-emerald-700' },
              { label: '気温偏差', value: '+2.8℃', color: 'text-blue-700' },
              { label: '降水量偏差', value: '-20%', color: 'text-cyan-700' },
              { label: '土壌pH', value: '5.0', color: 'text-orange-700' },
            ] : [
              { label: '主因: 害虫影響', value: '62%', color: 'text-emerald-700' },
              { label: '気温偏差', value: '+1.2℃', color: 'text-blue-700' },
              { label: '降水量偏差', value: '-8%', color: 'text-cyan-700' },
              { label: '土壌pH', value: '5.6', color: 'text-orange-700' },
            ]).map((m, idx) => (
              <StatCard key={idx} label={m.label} value={m.value} color={m.color} />
            ))}
          </div>
        </section>

        {/* 詳細分析セクション */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-2">{textByRisk[risk].title}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-5 border ${palette.border} rounded-xl ${palette.bgSoft}`}>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">カシナガキクイムシ</h3>
              <p className="text-slate-700 mb-3 text-sm leading-relaxed">{textByRisk[risk].insect}</p>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                <li>{risk==='red' ? '罹患樹周辺50mは日次監視' : '罹患樹周辺50mを週次監視'}</li>
                <li>{risk==='red' ? '緊急トラップの増設' : 'トラップ設置ポイントの最適化'}</li>
              </ul>
            </div>
            <div className="p-5 border border-blue-200 rounded-xl bg-blue-50/30">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">気候変動要因</h3>
              <p className="text-slate-700 mb-3 text-sm leading-relaxed">{textByRisk[risk].climate}</p>
            </div>
            <div className="p-5 border border-red-200 rounded-xl bg-red-50/30">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">土壌環境要因</h3>
              <p className="text-slate-700 mb-3 text-sm leading-relaxed">{textByRisk[risk].soil}</p>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                <li>{risk==='red' ? '短期のpH改善（石灰資材）' : '段階的なpH改善（堆肥・腐植）'}</li>
                <li>{risk==='red' ? '速効性肥料での補給' : '有機物中心の補給'}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* リスク分析セクションは不要のため削除 */}
      </div>
    </PageShell>
  );
};

export default CauseDetailsPage;
