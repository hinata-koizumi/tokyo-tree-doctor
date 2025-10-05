import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const LS_KEY = 'ttd:user';

type Prefs = { displayName: string; email: string; darkMode: boolean };
const defaultPrefs: Prefs = { displayName: 'Demo User', email: 'demo@example.com', darkMode: false };

const UserPage: React.FC = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSignedIn(!!parsed.token);
        setToken(parsed.token || null);
        setPrefs(parsed.prefs || defaultPrefs);
      }
    } catch (_) {}
  }, []);

  const persist = (next: Partial<{ token: string | null; prefs: Prefs }>) => {
    const data = { token: next.token ?? token, prefs: next.prefs ?? prefs };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  };

  const doSignIn = () => { const mock = 'mock-token-' + Math.random().toString(36).slice(2); setToken(mock); setSignedIn(true); persist({ token: mock }); };
  const doSignOut = () => { setToken(null); setSignedIn(false); persist({ token: null }); };
  const updatePrefs = (next: Partial<Prefs>) => { const merged = { ...prefs, ...next }; setPrefs(merged); persist({ prefs: merged }); };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-slate-800">ユーザー</h1>
          <p className="text-sm text-slate-600 mt-1">アカウントと表示設定。</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 space-y-5">
            {!signedIn ? (
              <section className="space-y-3">
                <p className="text-sm text-slate-700">サインインしてエクスポート設定や共有既定値を保存できます。</p>
                <button onClick={doSignIn} className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700">サインイン</button>
              </section>
            ) : (
              <>
                <section className="space-y-3">
                  <h2 className="text-sm font-medium text-slate-700">プロフィール</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{prefs.displayName}</div>
                      <div className="text-xs text-slate-500">{prefs.email}</div>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-slate-200" />

                <section className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">表示名</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={prefs.displayName} onChange={(e) => updatePrefs({ displayName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">メール</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={prefs.email} onChange={(e) => updatePrefs({ email: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input type="checkbox" className="accent-emerald-600" checked={prefs.darkMode} onChange={(e) => updatePrefs({ darkMode: e.target.checked })} />
                    ダークモード（プレースホルダー）
                  </label>
                </section>

                <div className="h-px bg-slate-200" />

                <section className="flex gap-3">
                  <button onClick={doSignOut} className="px-3 py-2 rounded-lg text-sm bg-slate-200 text-slate-800 hover:bg-slate-300">サインアウト</button>
                  <button onClick={() => persist({})} className="px-3 py-2 rounded-lg text-sm bg-slate-800 text-white hover:bg-slate-900">保存</button>
                </section>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <Link to="/" className="text-emerald-700 hover:underline text-sm">戻る</Link>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
