import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const SharePage: React.FC = () => {
  const location = useLocation();
  const url = useMemo(() => new URL(location.pathname + location.search, window.location.origin), [location]);
  const [copied, setCopied] = useState(false);
  const [includeRisk, setIncludeRisk] = useState(true);
  const [risk, setRisk] = useState(() => new URLSearchParams(location.search).get('risk') || 'red');

  const buildShareUrl = (): string => {
    const u = new URL(url.toString());
    if (includeRisk) u.searchParams.set('risk', risk);
    else u.searchParams.delete('risk');
    return u.toString();
  };

  const onCopy = async () => {
    const shareUrl = buildShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  const onWebShare = async () => {
    const shareUrl = buildShareUrl();
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: 'Tokyo Tree Doctor', text: 'ハザードマップ共有リンク', url: shareUrl });
      } catch (_) {}
    } else {
      await onCopy();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-slate-800">共有</h1>
          <p className="text-sm text-slate-600 mt-1">共有リンクの作成とオプション設定。</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 space-y-5">
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-slate-700">オプション</h2>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <label className="text-sm text-slate-700">リスクパラメータ</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input aria-label="リスク付与" type="checkbox" className="accent-emerald-600" checked={includeRisk} onChange={(e) => setIncludeRisk(e.target.checked)} />
                    付与
                  </label>
                  <select
                    aria-label="リスク値"
                    value={risk}
                    onChange={(e) => setRisk(e.target.value)}
                    className="px-2 py-1 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="red">red</option>
                    <option value="yellow">yellow</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-200" />

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-slate-700">リンク</h2>
              <div className="flex gap-2 items-center">
                <input aria-label="共有URL" className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm bg-slate-50" readOnly value={buildShareUrl()} />
                <button onClick={onCopy} className="px-3 py-2 rounded-lg text-sm bg-slate-800 text-white hover:bg-slate-900">
                  {copied ? 'コピー済み' : 'コピー'}
                </button>
                <button onClick={onWebShare} className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700">
                  共有
                </button>
              </div>
              <p className="text-xs text-slate-500">SPAルーティング対応。非対応環境ではトップへフォールバックします。</p>
            </section>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Link to="/" className="text-emerald-700 hover:underline text-sm">戻る</Link>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
