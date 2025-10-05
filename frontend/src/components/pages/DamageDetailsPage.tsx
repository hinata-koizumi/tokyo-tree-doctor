import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

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

const DamageDetailsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const riskParam = (searchParams.get('risk') || 'red').toLowerCase();
  const risk: 'red' | 'yellow' = riskParam.startsWith('y') || riskParam === 'medium' || riskParam === 'low' ? 'yellow' : 'red';

  const textByRisk = useMemo(() => ({
    red: {
      summaryShort: '高リスク樹木の即時防除と専門診断を優先。短期の土壌改良を並行実施。',
      emergency: ['高リスク樹木の特定と隔離', '専門業者による詳細診断', '防除剤の散布と処理'],
      longterm: '土壌改良と環境改善を段階的に実施し、再発防止体制を構築。',
      costNote: '緊急対策を含むため、初期費用が増加する可能性があります。'
    },
    yellow: {
      summaryShort: '監視強化と軽微な改善を中心に、中期的な対策で進行抑制。',
      emergency: ['要監視エリアの明確化', '簡易診断の定期化', '必要時のみ局所防除'],
      longterm: '堆肥投入や灌水の最適化でストレス軽減。モニタリングを継続。',
      costNote: '段階実施により、コストを平準化できます。'
    }
  } as const), []);

  const onSwitchRisk = (next: 'red'|'yellow') => {
    const params = new URLSearchParams(searchParams);
    params.set('risk', next);
    setSearchParams(params);
  };
  const [messages, setMessages] = useState<Array<{
    id: number;
    type: 'ai' | 'user';
    content: string;
    timestamp: Date;
  }>>([
    {
      id: 1,
      type: 'ai',
      content: 'こんにちは。東京の樹木診断AIアシスタントです。\n\n現在の分析では、カシナガキクイムシによる被害が78%を占め、131本で緊急対応が必要です。\n\n以下のような質問にお答えできます:\n- カシナガキクイムシの具体的な対策方法\n- 土壌改良や環境改善の手法\n- 緊急時の対応手順\n- 長期的な樹木保護計画\n- 予算やスケジュールの相談\n\n気になる点を入力してください。',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // ダミーAI応答（実際のAPIは後で実装）
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai' as const,
        content: `ご質問ありがとうございます。\n\n${inputMessage}について、以下のような対策をお勧めします：\n\n1. 緊急対応（1-2週間以内）\n• 高リスク樹木の特定と隔離\n• 専門業者による診断\n\n2. 中期対策（1-3ヶ月）\n• 土壌改良と灌水設備の整備\n• 防除剤の散布\n\n3. 長期対策（3ヶ月-1年）\n• 環境改善と予防システムの構築\n• 定期的なモニタリング体制の確立\n\n詳細なコストやスケジュールについては、具体的なエリアや樹種をお教えいただければ、より詳細な提案が可能です。`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // コスト試算データ
  const costData = {
    total: 2845000,
    breakdown: [
      { item: '緊急防除処理', cost: 1310000, description: '131本 × 10,000円' },
      { item: '土壌改良工事', cost: 850000, description: '500㎡ × 1,700円' },
      { item: '灌水設備設置', cost: 320000, description: '4基 × 80,000円' },
      { item: '防除剤・資材', cost: 180000, description: '薬剤・肥料等' },
      { item: '専門業者費用', cost: 185000, description: '診断・監理費' },
      { item: 'その他経費', cost: 50000, description: '交通費・雑費' }
    ]
  };

  const handleCostEstimate = () => {
    setShowCostModal(true);
  };

  return (
    <PageShell title="対策提案とAI相談">
      <div className="space-y-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: 対策提案 */}
          <div>
            {/* 提案サマリー */}
            <div className="rounded-2xl p-6 mb-6 border bg-white/70">
              <h3 className="text-lg font-bold text-slate-800 mb-4">サマリー</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/60 rounded-lg border">
                  <h4 className="font-semibold text-slate-800 mb-1">短期的な治療</h4>
                  <p className="text-slate-700 text-sm">{textByRisk[risk].summaryShort}</p>
                </div>
                <div className="p-4 bg-white/60 rounded-lg border">
                  <h4 className="font-semibold text-slate-800 mb-1">長期的な治療</h4>
                  <p className="text-slate-700 text-sm">{textByRisk[risk].longterm}</p>
                </div>
              </div>
            </div>



            {/* 詳細提案 */}
            <div className="space-y-4">
              <div className="rounded-2xl p-5 border bg-white/70">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">緊急対応計画</h3>
                <p className="text-slate-700 mb-3">リスクに応じた即時対応と診断計画。</p>
                <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                  {textByRisk[risk].emergency.map((t, i) => (<li key={i}>{t}</li>))}
                </ul>
              </div>
              <div className="rounded-2xl p-5 border bg-white/70">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">長期的対策</h3>
                <p className="text-slate-700 mb-3">土壌改良と環境改善による根本的な対策を段階的に実施。</p>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCostEstimate}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium"
                  >
                    コスト試算
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右側: AI相談 */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">AI相談</h2>
            
            {/* AI相談チャット */}
            <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-xl">
              {/* メッセージ表示エリア */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-800 px-4 py-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="樹木の被害や対策について質問してください..."
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                    rows={2}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    送信
                  </button>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* コスト試算モーダル */}
      {showCostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">コスト試算</h2>
                <button
                  onClick={() => setShowCostModal(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-emerald-700 mb-2">
                    ¥{costData.total.toLocaleString()}
                  </div>
                  <div className="text-slate-600">総工事費（税込）</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 mb-3">内訳詳細</h3>
                {costData.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{item.item}</div>
                      <div className="text-sm text-slate-600">{item.description}</div>
                    </div>
                    <div className="text-lg font-bold text-slate-800">
                      ¥{item.cost.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-2">注意事項</h4>
                <ul className="list-disc pl-5 text-sm text-emerald-700 space-y-1">
                  <li>この見積もりは概算であり、実際の費用は現場調査後に確定します</li>
                  <li>工期は約3-6ヶ月を想定しています</li>
                  <li>緊急対応は別途追加費用が発生する場合があります</li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200">
              <button
                onClick={() => setShowCostModal(false)}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default DamageDetailsPage;
