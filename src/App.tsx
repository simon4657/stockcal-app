import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Building2,
  BarChart,
  Globe,
  X,
  Info,
  Zap,
  Target,
  Menu,
  Bell,
  Search,
  Share2,
  Sparkles,
  Loader,
  RefreshCw,
  Settings,
  LogOut,
  Moon,
  Shield,
  BookOpen,
  AlertTriangle,
  Clock
} from 'lucide-react';

// --- 1. API 配置 ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- 2. 資料定義 ---

type EventType = 'critical' | 'hot' | 'corporate' | 'macro' | 'holiday';
type Market = 'US' | 'TW' | 'Global';
type Trend = 'bull' | 'bear' | 'neutral' | 'volatile';
type Tab = 'calendar' | 'hot' | 'strategy' | 'settings';

interface StockEvent {
  id: string;
  date: string;
  title: string;
  market: Market;
  type: EventType;
  trend: Trend;
  relatedStocks?: string[];
  description: string;
  strategy: string;
}

const monthlyEvents: StockEvent[] = [
  {
    id: '11-24-bbu',
    date: '2025-11-24',
    title: 'BBU 資金狂熱',
    market: 'TW',
    type: 'hot',
    trend: 'bull',
    relatedStocks: ['AES-KY (6781)', '順達 (3211)', '新盛力 (4931)'],
    description: '輝達 GB200 傳出全面採用 BBU (電池備援電力模組)，資金正瘋狂湧入該族群。',
    strategy: '目前處於主升段，沿 5 日線操作。若爆量長黑破線則立即停利。',
  },
  {
    id: '11-25-dell',
    date: '2025-11-25',
    title: 'Dell 財報公布',
    market: 'US',
    type: 'corporate',
    trend: 'bull',
    relatedStocks: ['緯創 (3231)', '廣達 (2382)', '仁寶 (2324)'],
    description: 'Dell 為 AI 伺服器指標。重點觀察 AI Server 訂單積壓狀況與 PC 換機潮指引。',
    strategy: '若 Dell 盤後大漲，隔日開盤直接關注廣達、緯創，追價意願可提高。',
  },
  {
    id: '11-26-pce',
    date: '2025-11-26',
    title: 'PCE 物價指數',
    market: 'US',
    type: 'macro',
    trend: 'neutral',
    description: 'Fed 最重視的通膨指標。若核心 PCE 月增率 <= 0.2%，將確立 12 月降息預期。',
    strategy: '數據公布前降低槓桿。若數據低於預期，科技股評價回升，可佈局權值股。',
  },
  {
    id: '11-27-thanksgiving',
    date: '2025-11-27',
    title: '感恩節休市',
    market: 'US',
    type: 'holiday',
    trend: 'neutral',
    description: '美股全日休市。外資放假，台股成交量預期萎縮。',
    strategy: '內資主導盤勢，大型股休息，留意中小型題材股或生技股表現。',
  },
  {
    id: '11-28-etf',
    date: '2025-11-28',
    title: 'ETF 換股 & 作帳',
    market: 'TW',
    type: 'hot',
    trend: 'bull',
    relatedStocks: ['威盛 (2388)', '華新 (1605)', '00878成分股'],
    description: '00878/00940 成分股調整生效，尾盤將爆大量。同時為集團作帳慣性發動日。',
    strategy: '留意尾盤爆量下殺的績優股(投信被動賣超)，隔日易有反彈行情。',
  },
  {
    id: '12-04-avgo',
    date: '2025-12-04',
    title: 'Broadcom (博通) 財報',
    market: 'US',
    type: 'corporate',
    trend: 'bull',
    relatedStocks: ['上詮 (3363)', '波若威 (3163)', '台積電 (2330)'],
    description: 'CPO (矽光子) 領頭羊。財報若大談光通訊與 ASIC 進度，將激勵相關供應鏈。',
    strategy: '若提及 CPO 出貨超前，矽光子族群將重啟漲勢，適合低接。',
  },
  {
    id: '12-05-equip',
    date: '2025-12-05',
    title: '設備股押寶買盤',
    market: 'TW',
    type: 'hot',
    trend: 'bull',
    relatedStocks: ['弘塑 (3131)', '萬潤 (6187)', '辛耘 (3583)'],
    description: '市場預期台積電 1 月法說將上修資本支出，聰明錢開始提前卡位 CoWoS 設備。',
    strategy: '趁大盤量縮整理時，分批佈局設備股，等待 1 月抬轎行情。',
  },
  {
    id: '12-10-fomc',
    date: '2025-12-10',
    title: 'CPI 公布 & FOMC',
    market: 'US',
    type: 'critical',
    trend: 'bear',
    description: '年度超級轉折日！通膨數據與 2026 點陣圖將決定美股是否修正。',
    strategy: '極高風險日！避免在此日前後追高熱門股，保留現金等待大盤方向。',
  },
  {
    id: '12-15-group',
    date: '2025-12-15',
    title: '集團/投信作帳衝刺',
    market: 'TW',
    type: 'hot',
    trend: 'volatile',
    relatedStocks: ['神達 (3706)', '鴻準 (2354)', '奇鋐 (3017)'],
    description: '年底內資作帳最高峰，投信高持股之中型股波動加劇。',
    strategy: '跟隨投信買超連續性，慎防結帳賣壓，適合短進短出。',
  },
  {
    id: '12-18-micron',
    date: '2025-12-18',
    title: 'Micron (美光) 財報',
    market: 'US',
    type: 'corporate',
    trend: 'bull',
    relatedStocks: ['群聯 (8299)', '威剛 (3260)', '南亞科 (2408)'],
    description: 'HBM 排擠效應導致傳統 DRAM 供給吃緊，報價看漲。',
    strategy: '若美光財報指引佳，隔日開盤直接搶進記憶體族群。',
  },
  {
    id: '01-06-ces',
    date: '2026-01-06',
    title: 'CES 2026 消費電子展',
    market: 'Global',
    type: 'corporate',
    trend: 'bull',
    relatedStocks: ['華碩 (2357)', '微星 (2377)', '所羅門 (2359)'],
    description: '聚焦 AI PC、機器人與 RTX 50 顯卡發表。',
    strategy: '關注板卡廠與機器人概念股，通常展覽期間有題材行情。',
  },
  {
    id: '01-15-tsmc',
    date: '2026-01-15',
    title: '台積電 Q4 法說會',
    market: 'TW',
    type: 'critical',
    trend: 'bull',
    relatedStocks: ['弘塑', '家登', '辛耘', '萬潤'],
    description: '全球半導體風向球。聚焦 2026 資本支出、2nm 進度與毛利率。',
    strategy: '若資本支出 > 380億美元，設備股將噴出。法說前押寶，法說當日視指引操作。',
  },
  {
    id: '01-22-tesla',
    date: '2026-01-22',
    title: 'Tesla 財報',
    market: 'US',
    type: 'corporate',
    trend: 'volatile',
    relatedStocks: ['亞光 (3019)', '和大 (1536)', '貿聯-KY (3665)'],
    description: '關注 Robotaxi 進展與毛利率回升狀況。',
    strategy: '若指引佳，資金將回流基期極低的車用電子族群。',
  },
  {
    id: '01-27-mediatek',
    date: '2026-01-27',
    title: '聯發科法說 & IP股',
    market: 'TW',
    type: 'hot',
    trend: 'bull',
    relatedStocks: ['世芯-KY (3661)', '創意 (3443)'],
    description: '聚焦 ASIC 業務與天璣 9400 銷售。',
    strategy: '高價 IP 股通常在法說季前後會有法人回補動作。',
  },
  {
    id: '01-28-fomc-jan',
    date: '2026-01-28',
    title: 'FOMC 利率決議',
    market: 'US',
    type: 'macro',
    trend: 'neutral',
    description: '2026 年首次會議，市場通常觀望。',
    strategy: '觀察鮑爾對新年度經濟的看法。',
  },
  {
    id: '01-29-apple',
    date: '2026-01-29',
    title: 'Apple 財報',
    market: 'US',
    type: 'corporate',
    trend: 'bear',
    relatedStocks: ['大立光 (3008)', '鴻海 (2317)'],
    description: 'iPhone 銷售狀況與大中華區競爭壓力。',
    strategy: '若指引保守，蘋概股恐承壓，資金可能撤出轉向 AI 股。',
  }
];

const dailyHotTrends = [
  {
    id: 'hot-1',
    name: 'BBU 電池模組',
    strength: 95,
    trend: 'up',
    stocks: ['AES-KY (6781)', '順達 (3211)', '新盛力 (4931)'],
    reason: '輝達 GB200 更改設計，BBU 成標配，資金集中度 No.1。'
  },
  {
    id: 'hot-2',
    name: 'CoWoS 設備股',
    strength: 85,
    trend: 'up',
    stocks: ['弘塑 (3131)', '萬潤 (6187)', '辛耘 (3583)'],
    reason: '台積電 1 月法說會前押寶買盤進場，預期資本支出上修。'
  },
  {
    id: 'hot-3',
    name: '集團作帳 (鴻海)',
    strength: 75,
    trend: 'neutral',
    stocks: ['鴻準 (2354)', '正達 (3149)', '建漢 (3062)'],
    reason: '年底將至，鴻海集團與相關子弟兵輪動點火。'
  },
  {
    id: 'hot-4',
    name: '比特幣概念',
    strength: 60,
    trend: 'volatile',
    stocks: ['華擎 (3515)', '撼訊 (6150)'],
    reason: 'BTC 價格波動大，板卡廠短線題材連動。'
  }
];

const dailyStrategies = [
  {
    id: 'st-1',
    title: '感恩節前量縮觀望',
    type: 'neutral',
    desc: '美股週四休市，外資買盤縮手。建議減少進出頻率，等待下週方向。',
    risk: '低',
    target: '大盤指數'
  },
  {
    id: 'st-2',
    title: 'BBU 族群操作',
    type: 'bull',
    desc: '目前為全市場最強勢族群。策略：沿 5 日線操作，不破線續抱，切勿預設高點，但嚴禁追高乖離過大者。',
    risk: '高',
    target: '中小型股'
  },
  {
    id: 'st-3',
    title: '避開高融資股',
    type: 'bear',
    desc: '櫃買指數 (OTC) 相對弱勢，需避開融資使用率過高且股價破季線的個股，防範多殺多。',
    risk: '中',
    target: '弱勢股'
  }
];

const TypeBadge = ({ type }: { type: EventType }) => {
  const styles = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
    hot: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    corporate: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    macro: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    holiday: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  };
  const labels = {
    critical: '核彈級',
    hot: '資金熱點',
    corporate: '公司大事',
    macro: '經濟數據',
    holiday: '休市',
  };
  const icons = {
    critical: <Activity size={12} />,
    hot: <Flame size={12} />,
    corporate: <Building2 size={12} />,
    macro: <BarChart size={12} />,
    holiday: <Globe size={12} />,
  };

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium ${styles[type]}`}>
      {icons[type]}
      <span>{labels[type]}</span>
    </div>
  );
};

const MarketBadge = ({ market }: { market: Market }) => (
  <span className="text-[10px] px-1.5 py-1 rounded bg-slate-700 text-slate-300 font-medium">
    {market === 'US' ? '🇺🇸 美股' : market === 'TW' ? '🇹🇼 台股' : '🌐 全球'}
  </span>
);

const TrendIcon = ({ trend }: { trend: Trend }) => {
    if (trend === 'bull') return <div className="flex items-center gap-1 text-rose-400 text-xs font-bold"><TrendingUp size={14} /> 偏多</div>;
    if (trend === 'bear') return <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold"><TrendingDown size={14} /> 偏空</div>;
    if (trend === 'volatile') return <div className="flex items-center gap-1 text-amber-400 text-xs font-bold"><Zap size={14} /> 震盪</div>;
    return <div className="flex items-center gap-1 text-slate-400 text-xs font-bold"><Activity size={14} /> 觀望</div>;
};

const useGeminiStrategy = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const fetchStrategy = async (event: StockEvent) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    const apiKey = localStorage.getItem('gemini_api_key') || '';
    
    if (!apiKey) {
      setError('請先在設定頁面中輸入 Gemini API Key');
      setLoading(false);
      return;
    }
    const prompt = `
      分析股市事件：${event.title}
      市場：${event.market}
      趨勢預判：${event.trend}
      描述：${event.description}
      相關個股：${event.relatedStocks?.join(', ') || '無'}

      請扮演一位資深的台股與美股分析師，針對此事件提供一份簡短但深度的「戰略報告」。
      請包含以下三點（請用繁體中文，列點說明）：
      1. 【深度解讀】：為什麼這個事件對當前市場至關重要？
      2. 【歷史借鏡】：過去類似事件發生時，市場通常如何反應？
      3. 【實戰建議】：給散戶的具體操作建議（例如：觀察哪個價位、是否該避險、或是積極進場）。
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setAnalysis(text);
      else throw new Error('No analysis generated');
    } catch (err) {
      setError('AI 分析連線逾時，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return { fetchStrategy, loading, error, analysis, setAnalysis };
};

const CalendarView = ({
  currentDate,
  prevMonth,
  nextMonth,
  days,
  selectedDayEvents,
  year,
  month,
  selectedDate,
  setSelectedEvent
}: any) => (
  <div className="flex-1 overflow-y-auto pb-20 no-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between px-6 py-4">
      <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 active:scale-95 transition-all">
        <ChevronLeft size={20} />
      </button>
      <h2 className="text-xl font-bold text-white tracking-wide">
        {year} <span className="text-slate-500 font-light">|</span> {String(month + 1).padStart(2, '0')}月
      </h2>
      <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 active:scale-95 transition-all">
        <ChevronRight size={20} />
      </button>
    </div>

    <div className="grid grid-cols-7 text-center px-4 mb-2">
      {['日','一','二','三','四','五','六'].map(d => (
        <span key={d} className="text-[11px] font-bold text-slate-500">{d}</span>
      ))}
    </div>

    <div className="grid grid-cols-7 px-4 gap-y-1 mb-6">
      {days}
    </div>

    <div className="bg-slate-900/50 rounded-t-[32px] min-h-[400px] border-t border-slate-800 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-lg">
            {selectedDate ? `${selectedDate.split('-')[1]}月${selectedDate.split('-')[2]}日 重點` : '本日無重大事件'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">共 {selectedDayEvents.length} 筆資金情報</p>
        </div>
        {selectedDayEvents.length > 0 && (
          <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
            Market Active
          </div>
        )}
      </div>

      <div className="space-y-4">
        {selectedDayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-30">
              <Globe size={48} className="mb-3" />
              <p className="text-sm">本日市場平靜</p>
            </div>
        ) : (
          selectedDayEvents.map((event: StockEvent) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="bg-slate-800 rounded-2xl p-4 border border-slate-700/50 active:scale-98 transition-transform cursor-pointer relative overflow-hidden group"
            >
              <div className={`absolute top-0 left-0 w-1 h-full
                ${event.type === 'critical' ? 'bg-rose-500' :
                  event.type === 'hot' ? 'bg-orange-500' : 'bg-blue-500'}`}
              />

              <div className="flex justify-between items-start mb-3 pl-3">
                <div>
                  <h4 className="text-base font-bold text-slate-100 mb-1 group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </h4>
                  <div className="flex gap-2">
                    <MarketBadge market={event.market} />
                    <TrendIcon trend={event.trend} />
                  </div>
                </div>
                <TypeBadge type={event.type} />
              </div>

              <div className="pl-3 flex justify-between items-end">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-[8px] text-slate-400">
                        $
                      </div>
                    ))}
                </div>
                <div className="text-xs text-slate-500 flex items-center">
                  詳細情報 <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const HotView = ({ hotTrends }: { hotTrends: any[] }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Flame className="text-orange-500" /> 資金熱點排行
        </h2>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1 border border-slate-700">
          <Clock size={10} /> Daily Update
        </span>
      </div>

      <div className="space-y-4">
        {hotTrends.map((sector, idx) => (
          <div key={sector.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden hover:border-orange-500/30 transition-colors cursor-pointer group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black text-slate-500 group-hover:text-orange-500 transition-colors">
              {idx + 1}
            </div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{sector.name}</h3>
                <span className="text-[10px] text-slate-500">{sector.reason}</span>
              </div>
              {sector.trend === 'up' ? <TrendingUp size={18} className="text-rose-500"/> :
               sector.trend === 'down' ? <TrendingDown size={18} className="text-emerald-500"/> :
               <Activity size={18} className="text-amber-500"/>}
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full mb-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-blue-500'}`}
                style={{ width: `${sector.strength}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {sector.stocks.map((stock, i) => (
                <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                  {stock}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StrategyView = ({ strategies }: { strategies: any[] }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="text-emerald-500" /> 操盤戰術板
        </h2>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1 border border-slate-700">
          <Clock size={10} /> Daily Update
        </span>
      </div>

      <div className="grid gap-4">
        {strategies.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-colors relative overflow-hidden group">
            <div className="flex justify-between mb-3 relative z-10">
              <span className={`text-xs font-bold px-2 py-1 rounded ${s.type === 'bull' ? 'bg-rose-900/30 text-rose-400' : s.type === 'bear' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {s.type === 'bull' ? '偏多操作' : s.type === 'bear' ? '保守避險' : '區間觀望'}
              </span>
              <span className={`text-xs font-bold flex items-center gap-1 ${s.risk === '高' ? 'text-rose-400' : s.risk === '中' ? 'text-amber-400' : 'text-emerald-400'}`}>
                <AlertTriangle size={10} /> 風險: {s.risk}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2 relative z-10 group-hover:text-blue-400 transition-colors">{s.title}</h3>
            <p className="text-sm text-slate-400 leading-6 relative z-10">{s.desc}</p>
            <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center relative z-10">
               <span className="text-[10px] text-slate-500">關注: {s.target}</span>
               <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400" />
            </div>

            <div className="absolute -bottom-4 -right-4 text-slate-800/30 transform rotate-12 group-hover:scale-110 transition-transform">
               <Target size={80} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsView = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [showModal, setShowModal] = useState<{title: string, content: string} | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');

  const handleToggle = (setting: string) => {
    if (setting === 'notifications') {
      setNotificationsEnabled(!notificationsEnabled);
    } else if (setting === 'darkMode') {
      setDarkModeEnabled(!darkModeEnabled);
    }
  };

  const openModal = (title: string, content: string) => {
    setShowModal({ title, content });
  };

  const saveApiKey = () => {
    if (geminiApiKey.trim()) {
      localStorage.setItem('gemini_api_key', geminiApiKey.trim());
      alert('✅ API Key 已儲存！現在可以使用 AI 分析功能了。');
    } else {
      alert('⚠️ 請輸入有效的 API Key');
    }
  };

  const handleLogout = () => {
    if (window.confirm('確定要登出目前帳號嗎？')) {
      alert('已安全登出');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Settings className="text-slate-400" /> 設定
      </h2>

      <div className="bg-slate-900 rounded-2xl p-4 mb-6 flex items-center gap-4 border border-slate-800">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          U
        </div>
        <div>
          <h3 className="text-white font-bold">User 001</h3>
          <p className="text-xs text-slate-500">Pro 會員 (到期日: 2026/12/31)</p>
        </div>
      </div>

      {/* Gemini API Key Setting */}
      <div className="bg-slate-900 rounded-2xl p-4 mb-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-purple-400" />
          <h3 className="text-white font-bold text-sm">Gemini AI 設定</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">輸入您的 Gemini API Key 以啟用 AI 深度分析功能</p>
        <input
          type="password"
          placeholder="請輸入 Gemini API Key"
          value={geminiApiKey}
          onChange={(e) => setGeminiApiKey(e.target.value)}
          className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg text-sm border border-slate-700 focus:border-purple-500 focus:outline-none mb-2"
        />
        <button
          onClick={saveApiKey}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          儲存 API Key
        </button>
        <p className="text-[10px] text-slate-500 mt-2">
          💡 如何取得 API Key: 前往 <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">ai.google.dev</a> 申請
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handleToggle('notifications')}
          className="w-full bg-slate-900 p-4 rounded-xl flex items-center justify-between active:bg-slate-800 border border-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-300">
            <Bell size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">推播通知</div>
              <div className="text-[10px] text-slate-500">重大事件即時提醒</div>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}>
            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${notificationsEnabled ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

        <button
          onClick={() => handleToggle('darkMode')}
          className="w-full bg-slate-900 p-4 rounded-xl flex items-center justify-between active:bg-slate-800 border border-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-300">
            <Moon size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">深色模式</div>
              <div className="text-[10px] text-slate-500">{darkModeEnabled ? '已開啟' : '已關閉'}</div>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${darkModeEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}>
            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${darkModeEnabled ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

        <button
          onClick={() => openModal('隱私權設定', '您的數據僅儲存於本地端，StockCal 不會收集您的個人操作紀錄。詳細條款請參閱官網。')}
          className="w-full bg-slate-900 p-4 rounded-xl flex items-center justify-between active:bg-slate-800 border border-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-300">
            <Shield size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">隱私權設定</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-600" />
        </button>

        <button
          onClick={() => openModal('使用教學', '1. 點擊日曆查看當日大事。\\n2. 點擊「熱點」查看資金流向。\\n3. 點擊事件可使用 AI 分析功能。')}
          className="w-full bg-slate-900 p-4 rounded-xl flex items-center justify-between active:bg-slate-800 border border-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-300">
            <BookOpen size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">使用教學</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-600" />
        </button>

        <button
          onClick={() => openModal('關於 StockCal', '版本: v6.2.0\\n開發團隊: StockCal Team\\n聯絡我們: support@stockcal.app')}
          className="w-full bg-slate-900 p-4 rounded-xl flex items-center justify-between active:bg-slate-800 border border-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-300">
            <Info size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">關於 StockCal</div>
              <div className="text-[10px] text-slate-500">v6.2.0</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-600" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-rose-900/20 text-rose-500 p-4 rounded-xl flex items-center justify-center gap-2 font-medium active:bg-rose-900/30 border border-rose-900/30 transition-colors"
        >
          <LogOut size={18} /> 登出帳號
        </button>
      </div>

      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">{showModal.title}</h3>
            <p className="text-slate-400 text-sm whitespace-pre-line mb-6 leading-relaxed">
              {showModal.content}
            </p>
            <button
              onClick={() => setShowModal(null)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function StockCalAndroid() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 20));
  const [selectedDate, setSelectedDate] = useState<string>('2025-11-24');
  const [selectedEvent, setSelectedEvent] = useState<StockEvent | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // API 資料 state
  const [apiEvents, setApiEvents] = useState<StockEvent[]>([]);
  const [apiHotTrends, setApiHotTrends] = useState<any[]>([]);
  const [apiStrategies, setApiStrategies] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  
  // 從 API 獲取資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, trendsRes, strategiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/events`),
          fetch(`${API_BASE_URL}/api/hot-trends`),
          fetch(`${API_BASE_URL}/api/strategies`)
        ]);
        
        if (eventsRes.ok) {
          const events = await eventsRes.json();
          setApiEvents(events);
        }
        
        if (trendsRes.ok) {
          const trends = await trendsRes.json();
          setApiHotTrends(trends);
        }
        
        if (strategiesRes.ok) {
          const strategies = await strategiesRes.json();
          setApiStrategies(strategies);
        }
      } catch (error) {
        console.error('Failed to fetch API data:', error);
        // 如果 API 失敗，使用預設資料
      } finally {
        setApiLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const { fetchStrategy, loading: aiLoading, error: aiError, analysis: aiAnalysis, setAnalysis: setAiAnalysis } = useGeminiStrategy();

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 800);
  }, []);
  
  // 使用 API 資料或預設資料
  const events = apiEvents.length > 0 ? apiEvents : monthlyEvents;
  const hotTrends = apiHotTrends.length > 0 ? apiHotTrends : dailyHotTrends;
  const strategies = apiStrategies.length > 0 ? apiStrategies : dailyStrategies;

  useEffect(() => {
    if (selectedEvent) {
      setAiAnalysis(null);
    }
  }, [selectedEvent, setAiAnalysis]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(''); };
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(''); };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`empty-${i}`} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = monthlyEvents.filter(e => e.date === dateStr);
    const isSelected = selectedDate === dateStr;

    let dotColor = '';
    if (dayEvents.some(e => e.type === 'critical')) dotColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
    else if (dayEvents.some(e => e.type === 'hot')) dotColor = 'bg-orange-500';
    else if (dayEvents.length > 0) dotColor = 'bg-blue-500';

    days.push(
      <div
        key={d}
        onClick={() => setSelectedDate(dateStr)}
        className={`
          h-14 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all relative
          ${isSelected ? 'bg-blue-600 text-white shadow-lg scale-105 z-10' : 'text-slate-400 hover:bg-slate-800'}
        `}
      >
        <span className={`text-sm font-medium ${isSelected ? 'font-bold' : ''}`}>{d}</span>
        {dotColor && (
          <div className={`w-1.5 h-1.5 rounded-full mt-1 ${dotColor}`} />
        )}
      </div>
    );
  }

  const selectedDayEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-widest text-slate-500">STOCKCAL 6.2</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden selection:bg-blue-500/30">

      <div className="pt-4 pb-2 px-4 bg-slate-950 flex items-center justify-between z-20 sticky top-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 relative overflow-hidden">
             <CalendarIcon size={20} className="text-white relative z-10" />
             <div className="absolute inset-0 bg-blue-400/30 blur-md"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              StockCal <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1"><Sparkles size={8} /> AI</span>
            </h1>
            <p className="text-[10px] text-blue-400 font-medium">股市戰情室 V6.2</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400"><Search size={20}/></button>
          <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400 relative">
            <Bell size={20}/>
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'calendar' && (
          <CalendarView
            currentDate={currentDate}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            days={days}
            selectedDayEvents={selectedDayEvents}
            year={year}
            month={month}
            selectedDate={selectedDate}
            setSelectedEvent={setSelectedEvent}
          />
        )}
        {activeTab === 'hot' && <HotView hotTrends={hotTrends} />}
        {activeTab === 'strategy' && <StrategyView strategies={strategies} />}
        {activeTab === 'settings' && <SettingsView />}
      </div>

      <div className="h-16 bg-slate-900 border-t border-slate-800 grid grid-cols-4 items-center absolute bottom-0 w-full z-30 shadow-2xl shadow-black">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'calendar' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <CalendarIcon size={22} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">日曆</span>
        </button>
        <button
          onClick={() => setActiveTab('hot')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'hot' ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Flame size={22} strokeWidth={activeTab === 'hot' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">熱點</span>
        </button>
        <button
          onClick={() => setActiveTab('strategy')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'strategy' ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Target size={22} strokeWidth={activeTab === 'strategy' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">策略</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-purple-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Menu size={22} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">設定</span>
        </button>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300" onClick={() => setSelectedEvent(null)}>
          <div
            className="w-full bg-slate-900 rounded-t-[32px] p-6 border-t border-slate-700 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-8 opacity-50" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedEvent.title}</h2>
                <div className="flex gap-2">
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    {selectedEvent.date}
                  </span>
                  <TypeBadge type={selectedEvent.type} />
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold text-sm uppercase tracking-wider">
                  <Info size={16} />
                  資金流向情報
                </div>
                <p className="text-slate-300 text-sm leading-7 text-justify">
                  {selectedEvent.description}
                </p>
              </div>

              {selectedEvent.relatedStocks && (
                <div>
                   <div className="flex items-center gap-2 mb-3 text-orange-400 font-bold text-sm uppercase tracking-wider">
                    <Zap size={16} />
                    連動關注標的
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.relatedStocks.map((stock, idx) => (
                      <span key={idx} className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl text-sm font-medium border border-slate-700 flex items-center gap-2">
                        {stock}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl border border-slate-700">
                 <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                    <Target size={16} />
                    基礎操作策略
                  </div>
                <p className="text-slate-200 text-sm leading-7 font-medium">
                  {selectedEvent.strategy}
                </p>
              </div>

              <div className="border-t border-slate-700/50 pt-6 mt-2">
                 <div className="flex items-center gap-2 mb-4 text-purple-400 font-bold text-sm uppercase tracking-wider">
                    <Sparkles size={16} />
                    Gemini AI 深度戰略
                 </div>

                 {aiAnalysis ? (
                   <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-5 rounded-2xl border border-purple-500/30 animate-in fade-in duration-500">
                      <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed whitespace-pre-line">
                         {aiAnalysis}
                      </div>
                      <button
                        onClick={() => fetchStrategy(selectedEvent)}
                        className="mt-4 text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300"
                      >
                        <RefreshCw size={12} /> 重新生成
                      </button>
                   </div>
                 ) : (
                   <div className="bg-slate-800/30 p-6 rounded-2xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-center">
                      <p className="text-slate-400 text-sm mb-4">
                        想知道更詳細的歷史回測與進場點建議？<br/>讓 Gemini 為您進行深度分析。
                      </p>
                      {aiLoading ? (
                        <div className="flex items-center gap-2 text-purple-400 bg-purple-500/10 px-6 py-3 rounded-xl">
                           <Loader size={18} className="animate-spin" />
                           <span className="font-bold text-sm">AI 分析師思考中...</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => fetchStrategy(selectedEvent)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all active:scale-95"
                        >
                          <Sparkles size={18} /> 生成 AI 戰略報告
                        </button>
                      )}
                      {aiError && (
                        <p className="text-rose-400 text-xs mt-3 flex items-center gap-1">
                          <Info size={12} /> {aiError}
                        </p>
                      )}
                   </div>
                 )}
              </div>
              <div className="h-6" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}