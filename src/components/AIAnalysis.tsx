import { useState } from 'react';
import { Sparkles, Loader, AlertTriangle, RefreshCw, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://stockcal-api.onrender.com';

interface AIAnalysisProps {
  type: 'event' | 'hot-trend' | 'strategy';
  itemId: string;
  itemData: any;
  onClose: () => void;
}

export function AIAnalysisModal({ type, itemId, itemData, onClose }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze/${type}/${itemId}`);
      
      if (!response.ok) {
        throw new Error('AI 分析服務暫時無法使用');
      }
      
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || '分析失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const regenerateAnalysis = async () => {
    if (!feedback.trim()) {
      alert('請輸入回饋內容');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analyze/${type}/${itemId}/regenerate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback })
        }
      );
      
      if (!response.ok) {
        throw new Error('重新生成失敗');
      }
      
      const data = await response.json();
      setAnalysis(data.analysis);
      setFeedback('');
      setShowFeedback(false);
    } catch (err: any) {
      setError(err.message || '重新生成失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-700 w-full sm:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-blue-400" />
            <h3 className="text-lg font-bold text-white">AI 深度分析</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Item Info */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h4 className="font-bold text-white mb-2">
              {type === 'event' && itemData.title}
              {type === 'hot-trend' && itemData.name}
              {type === 'strategy' && itemData.title}
            </h4>
            <p className="text-sm text-slate-400">
              {type === 'event' && `${itemData.date} | ${itemData.description}`}
              {type === 'hot-trend' && `資金強度: ${itemData.strength}/100 | ${itemData.reason}`}
              {type === 'strategy' && `${itemData.desc} | 風險: ${itemData.risk}`}
            </p>
          </div>

          {/* Analysis Button or Result */}
          {!analysis && !loading && !error && (
            <button
              onClick={fetchAnalysis}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              開始 AI 深度分析
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader size={32} className="text-blue-400 animate-spin" />
              <p className="text-slate-400 text-sm">AI 正在深度分析中...</p>
              <p className="text-slate-500 text-xs">這可能需要 15-20 秒</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-rose-400 font-medium mb-1">分析失敗</p>
                <p className="text-rose-300/70 text-sm">{error}</p>
                <button
                  onClick={fetchAnalysis}
                  className="mt-3 text-sm text-rose-400 hover:text-rose-300 font-medium"
                >
                  重試
                </button>
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {analysis && (
            <div className="space-y-4">
              {/* Event Analysis */}
              {type === 'event' && (
                <>
                  <AnalysisSection title="📊 事件影響">
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">短期影響（1-2週）</h5>
                        <p className="text-sm text-slate-400">{analysis.event_impact?.short_term}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">中期影響（1-3個月）</h5>
                        <p className="text-sm text-slate-400">{analysis.event_impact?.medium_term}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">長期影響（3個月以上）</h5>
                        <p className="text-sm text-slate-400">{analysis.event_impact?.long_term}</p>
                      </div>
                    </div>
                  </AnalysisSection>

                  <AnalysisSection title="📈 市場反應預測">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">預期波動</span>
                        <span className="text-white font-medium">{analysis.market_reaction?.expected_volatility}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">市場情緒</span>
                        <span className="text-white font-medium">{analysis.market_reaction?.sentiment}</span>
                      </div>
                      {analysis.market_reaction?.key_indicators && (
                        <div>
                          <p className="text-sm text-slate-400 mb-2">關鍵指標</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.market_reaction.key_indicators.map((indicator: string, i: number) => (
                              <span key={i} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg">
                                {indicator}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AnalysisSection>

                  <AnalysisSection title="💡 操作策略">
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">事件前</h5>
                        <p className="text-sm text-slate-400">{analysis.trading_strategy?.before_event}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">事件當天</h5>
                        <p className="text-sm text-slate-400">{analysis.trading_strategy?.during_event}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">事件後</h5>
                        <p className="text-sm text-slate-400">{analysis.trading_strategy?.after_event}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-rose-400 mb-1">⚠️ 風險控制</h5>
                        <p className="text-sm text-slate-400">{analysis.trading_strategy?.risk_control}</p>
                      </div>
                    </div>
                  </AnalysisSection>

                  {analysis.key_stocks_to_watch && analysis.key_stocks_to_watch.length > 0 && (
                    <AnalysisSection title="🎯 重點個股">
                      <div className="space-y-3">
                        {analysis.key_stocks_to_watch.map((stock: any, i: number) => (
                          <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-white">{stock.name}</h5>
                              <span className={`text-xs px-2 py-1 rounded-lg ${
                                stock.action === '買入' ? 'bg-emerald-500/20 text-emerald-400' :
                                stock.action === '賣出' ? 'bg-rose-500/20 text-rose-400' :
                                'bg-slate-600/20 text-slate-400'
                              }`}>
                                {stock.action}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{stock.reason}</p>
                            <p className="text-xs text-blue-400">{stock.target_price}</p>
                          </div>
                        ))}
                      </div>
                    </AnalysisSection>
                  )}
                </>
              )}

              {/* Hot Trend Analysis */}
              {type === 'hot-trend' && (
                <>
                  <AnalysisSection title="📊 技術面分析">
                    <p className="text-sm text-slate-400">{analysis.technical_analysis}</p>
                  </AnalysisSection>

                  <AnalysisSection title="💼 基本面分析">
                    <p className="text-sm text-slate-400">{analysis.fundamental_analysis}</p>
                  </AnalysisSection>

                  <AnalysisSection title="⚠️ 風險評估">
                    <p className="text-sm text-slate-400">{analysis.risk_assessment}</p>
                  </AnalysisSection>

                  <AnalysisSection title="💡 操作建議">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">進場點位</span>
                        <span className="text-white">{analysis.trading_suggestion?.entry_point}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">停損設定</span>
                        <span className="text-rose-400">{analysis.trading_suggestion?.stop_loss}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">停利目標</span>
                        <span className="text-emerald-400">{analysis.trading_suggestion?.take_profit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">持有期間</span>
                        <span className="text-white">{analysis.trading_suggestion?.holding_period}</span>
                      </div>
                    </div>
                  </AnalysisSection>

                  {analysis.key_stocks && analysis.key_stocks.length > 0 && (
                    <AnalysisSection title="🎯 重點個股">
                      <div className="space-y-3">
                        {analysis.key_stocks.map((stock: any, i: number) => (
                          <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-white">{stock.name}</h5>
                              <span className={`text-xs px-2 py-1 rounded-lg ${
                                stock.rating === '強力推薦' ? 'bg-emerald-500/20 text-emerald-400' :
                                stock.rating === '推薦' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-600/20 text-slate-400'
                              }`}>
                                {stock.rating}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{stock.reason}</p>
                            {stock.entry_price && (
                              <p className="text-xs text-blue-400">建議進場: {stock.entry_price}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </AnalysisSection>
                  )}
                </>
              )}

              {/* Strategy Analysis */}
              {type === 'strategy' && (
                <>
                  <AnalysisSection title="💡 策略原理">
                    <p className="text-sm text-slate-400">{analysis.strategy_rationale}</p>
                  </AnalysisSection>

                  <AnalysisSection title="📋 執行細節">
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">進場時機</h5>
                        <p className="text-sm text-slate-400">{analysis.execution_details?.entry_timing}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">倉位配置</h5>
                        <p className="text-sm text-slate-400">{analysis.execution_details?.position_sizing}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">出場策略</h5>
                        <p className="text-sm text-slate-400">{analysis.execution_details?.exit_strategy}</p>
                      </div>
                    </div>
                  </AnalysisSection>

                  <AnalysisSection title="⚠️ 風險控管">
                    <div className="space-y-2">
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">最大虧損</h5>
                        <p className="text-sm text-rose-400">{analysis.risk_management?.max_loss}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">對沖方法</h5>
                        <p className="text-sm text-slate-400">{analysis.risk_management?.hedge_method}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-1">警示訊號</h5>
                        <p className="text-sm text-slate-400">{analysis.risk_management?.warning_signs}</p>
                      </div>
                    </div>
                  </AnalysisSection>

                  <AnalysisSection title="📊 歷史表現">
                    <p className="text-sm text-slate-400 mb-2">{analysis.historical_performance}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">成功機率</span>
                      <span className={`text-sm font-medium ${
                        analysis.success_probability === '高' ? 'text-emerald-400' :
                        analysis.success_probability === '中' ? 'text-blue-400' :
                        'text-slate-400'
                      }`}>
                        {analysis.success_probability}
                      </span>
                    </div>
                  </AnalysisSection>
                </>
              )}

              {/* Confidence Level */}
              {analysis.confidence_level && (
                <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">分析信心度</span>
                    <span className={`text-sm font-medium ${
                      analysis.confidence_level === '高' ? 'text-emerald-400' :
                      analysis.confidence_level === '中' ? 'text-blue-400' :
                      'text-slate-400'
                    }`}>
                      {analysis.confidence_level}
                    </span>
                  </div>
                </div>
              )}

              {/* Feedback Section */}
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                {!showFeedback ? (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="w-full text-sm text-slate-400 hover:text-slate-300 flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={16} />
                    發現錯誤？點此回饋
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <AlertTriangle size={16} className="text-orange-400" />
                      <span>請指出分析中的錯誤</span>
                    </div>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="例如：日期有誤、價位不合理、產業分析不正確等..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowFeedback(false);
                          setFeedback('');
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={regenerateAnalysis}
                        disabled={loading || !feedback.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={16} />
                        重新生成
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <p className="text-xs text-orange-400/80">
                  ⚠️ AI 分析僅供參考，不構成投資建議。投資有風險，請謹慎評估。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
      <h4 className="text-sm font-bold text-white mb-3">{title}</h4>
      {children}
    </div>
  );
}
