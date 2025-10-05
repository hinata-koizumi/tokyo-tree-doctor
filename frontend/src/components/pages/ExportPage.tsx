import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ExportPage: React.FC = () => {
  const location = useLocation();
  const [status, setStatus] = useState<string>('');
  const stats = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    const risk = (qs.get('risk') || 'red').toLowerCase();
    return { risk, total: 1863, healthy: 936, warning: 566, danger: 361 };
  }, [location.search]);

  const downloadCSV = () => {
    setStatus('CSV を生成中...');
    const rows = [ ['risk', 'total', 'healthy', 'warning', 'danger'], [stats.risk, stats.total, stats.healthy, stats.warning, stats.danger] ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `hazard-stats-${stats.risk}.csv`; a.click(); URL.revokeObjectURL(url);
    setStatus('CSV ダウンロード完了'); setTimeout(() => setStatus(''), 1500);
  };

  const downloadPNG = () => {
    setStatus('PNG を生成中...');
    const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 450;
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.fillStyle = '#f8fafc'; ctx.fillRect(0,0,800,450); ctx.fillStyle = '#0ea5e9'; ctx.font = '20px system-ui, sans-serif'; ctx.fillText('Tokyo Tree Doctor', 20, 40); ctx.fillStyle = '#334155'; ctx.fillText(`RISK: ${stats.risk}`, 20, 80); }
    canvas.toBlob((blob) => { if (!blob) return; const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `hazard-view-${stats.risk}.png`; a.click(); URL.revokeObjectURL(url); setStatus('PNG ダウンロード完了'); setTimeout(() => setStatus(''), 1500); });
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-slate-800">エクスポート</h1>
          <p className="text-sm text-slate-600 mt-1">データのダウンロードと画像保存。</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 space-y-5">
            <section className="space-y-2">
              <h2 className="text-sm font-medium text-slate-700">対象データ</h2>
              <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div>risk: <span className="font-mono">{stats.risk}</span></div>
                <div>total: <span className="font-mono">{stats.total}</span></div>
                <div>healthy: <span className="font-mono">{stats.healthy}</span></div>
                <div>warning: <span className="font-mono">{stats.warning}</span></div>
                <div>danger: <span className="font-mono">{stats.danger}</span></div>
              </div>
            </section>
            <div className="h-px bg-slate-200" />
            <section className="flex flex-wrap gap-3">
              <button onClick={downloadCSV} className="px-3 py-2 rounded-lg text-sm bg-slate-800 text-white hover:bg-slate-900">CSVダウンロード</button>
              <button onClick={downloadPNG} className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700">PNG保存</button>
            </section>
            {status && <div className="text-sm text-slate-700">{status}</div>}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <Link to="/" className="text-emerald-700 hover:underline text-sm">戻る</Link>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
