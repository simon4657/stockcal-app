import { useState } from 'react';
import { Sparkles, Loader, AlertTriangle, RefreshCw, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://stockcal-api.onrender.com';

interface AIAnalysisProps {
  type: 'event' | 'hot-trend' | 'strategy';
  itemId: string;
  itemData: any;
  onClose: () => void;
}

export function AIAnalysisModal({ type, itemId, itemData, onClose }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 從 localStorage 讀取 API key
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        throw new Error('請先在設定頁面輸入 Gemini API Key');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/analyze/${type}/${itemId}`, {
        headers: {
          'X-API-Key': apiKey
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'AI 分析服務暫時無法使用');
      }
      
      const data = await response.json();
      setAnalysis(data.analysis); // Markdown 文本
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
      // 從 localStorage 讀取 API key
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        throw new Error('請先在設定頁面輸入 Gemini API Key');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/analyze/${type}/${itemId}/regenerate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify({ feedback })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '重新生成失敗');
      }
      
      const data = await response.json();
      setAnalysis(data.analysis); // Markdown 文本
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
      <div className="bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-700 w-full sm:max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
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
              <p className="text-slate-400 text-sm">AI 正在深度思考中...</p>
              <p className="text-slate-500 text-xs">使用 Gemini 2.5 Pro 進階思考模型</p>
              <p className="text-slate-500 text-xs">這可能需要 25-35 秒</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
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

          {/* Analysis Result - Markdown 格式 */}
          {analysis && (
            <div className="space-y-4">
              {/* Markdown Content */}
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
                <div className="prose prose-invert prose-slate max-w-none
                  prose-headings:text-white prose-headings:font-bold
                  prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                  prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5 prose-h2:text-blue-400
                  prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4 prose-h3:text-blue-300
                  prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-3
                  prose-strong:text-white prose-strong:font-semibold
                  prose-ul:text-slate-300 prose-ul:my-2
                  prose-ol:text-slate-300 prose-ol:my-2
                  prose-li:my-1
                  prose-blockquote:border-l-blue-500 prose-blockquote:bg-slate-800/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
                  prose-code:text-blue-400 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
                  prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
                  prose-table:border-collapse prose-table:w-full
                  prose-th:bg-slate-800 prose-th:border prose-th:border-slate-700 prose-th:p-2 prose-th:text-left
                  prose-td:border prose-td:border-slate-700 prose-td:p-2
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysis}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <button
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium text-slate-300">
                    📝 發現分析錯誤？提供回饋重新生成
                  </span>
                  <RefreshCw size={16} className="text-slate-400" />
                </button>
                
                {showFeedback && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="例如：日期有誤，台積電法說會通常在1月中旬。目標價1100元太保守，建議上調至1200元。"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                    <button
                      onClick={regenerateAnalysis}
                      disabled={loading || !feedback.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={16} />
                      根據回饋重新生成分析
                    </button>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <p className="text-xs text-amber-400/80">
                  ⚠️ 本分析由 AI 生成，僅供參考，不構成投資建議。投資有風險，請謹慎評估。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
