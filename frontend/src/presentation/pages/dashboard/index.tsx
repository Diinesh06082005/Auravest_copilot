import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownRight, CheckCircle, Circle, Play, Send, 
  TrendingUp, Activity, Sparkles, Star, Plus, ShieldAlert, 
  HelpCircle, ChevronRight, Newspaper, Calendar, DollarSign, AlertCircle, X
} from 'lucide-react';
import { useAuthStore } from '../../../business/store/auth.store';
import { Watchlist } from '../../components/dashboard/Watchlist';
import { PortfolioSimulator } from '../../components/dashboard/PortfolioSimulator';
import { AIChat } from '../../components/dashboard/AIChat';

// ==========================================
// Mock Data for Dynamic Company Swapping
// ==========================================
interface CompanyData {
  name: string;
  ticker: string;
  exchange: string;
  industry: string;
  description: string;
  logo: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  range52w: string;
  divYield: string;
  nextEarnings: string;
  confidence: number;
  rec: 'BUY' | 'HOLD' | 'SELL';
  recSub: string;
  metrics: {
    revenue: { value: string; yoy: string; trend: number[] };
    profit: { value: string; yoy: string; trend: number[] };
    fcf: { value: string; yoy: string; trend: number[] };
    roe: { value: string; yoy: string; trend: number[] };
    debtToEquity: { value: string; risk: 'Low Risk' | 'Medium Risk' | 'High Risk'; trend: number[] };
    peRatio: { value: string; rating: 'Undervalued' | 'Moderate' | 'Expensive'; trend: number[] };
    eps: { value: string; yoy: string; trend: number[] };
  };
  radarPoints: string;
  radarScores: { label: string; score: number }[];
  risk: {
    overall: number;
    market: string;
    financial: string;
    competition: string;
    regulatory: string;
    technology: string;
  };
  reasoning: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  stockHistory: number[];
  news: Array<{ title: string; sentiment: 'Positive' | 'Negative' | 'Neutral'; impact: number; source: string; time: string }>;
  allocation: Array<{ name: string; pct: number; amt: string; color: string }>;
}

const COMPANIES: Record<string, CompanyData> = {
  AAPL: {
    name: 'Apple Inc.',
    ticker: 'AAPL',
    exchange: 'NASDAQ',
    industry: 'Consumer Electronics • Cupertino, CA',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    logo: '',
    price: 185.50,
    change: 2.35,
    changePercent: 1.21,
    marketCap: '$3.02T',
    range52w: '$164.08 - $199.62',
    divYield: '0.50%',
    nextEarnings: 'May 2, 2024',
    confidence: 94,
    rec: 'BUY',
    recSub: 'Strong Buy',
    metrics: {
      revenue: { value: '$394.3B', yoy: '+18.7%', trend: [60, 68, 64, 75, 82, 88] },
      profit: { value: '$99.8B', yoy: '+14.5%', trend: [40, 48, 44, 52, 58, 62] },
      fcf: { value: '$102.1B', yoy: '+22.1%', trend: [30, 35, 38, 45, 42, 50] },
      roe: { value: '48.3%', yoy: '+3.2%', trend: [42, 44, 45, 47, 46, 48] },
      debtToEquity: { value: '0.73', risk: 'Low Risk', trend: [85, 80, 78, 75, 74, 73] },
      peRatio: { value: '31.2', rating: 'Moderate', trend: [28, 29, 31, 30, 32, 31] },
      eps: { value: '$6.45', yoy: '+13.6%', trend: [5.2, 5.5, 5.8, 6.0, 6.2, 6.45] },
    },
    radarPoints: "150,80 210,110 200,165 150,210 100,170 85,115",
    radarScores: [
      { label: 'Profitability', score: 9.6 },
      { label: 'Growth', score: 9.2 },
      { label: 'Cash Flow', score: 9.4 },
      { label: 'Management', score: 9.3 },
      { label: 'Efficiency', score: 8.8 },
      { label: 'Solvency', score: 8.7 },
    ],
    risk: {
      overall: 28,
      market: 'Low (20%)',
      financial: 'Low (25%)',
      competition: 'Medium (35%)',
      regulatory: 'Low (15%)',
      technology: 'Medium (30%)',
    },
    reasoning: [
      'Strong Revenue Growth: 18.7% YoY and increasing services share',
      'Excellent Profitability: Net margin 25.3% vs peer industry average 17.1%',
      'Robust Cash Flow: $102.1B free cash flow provides massive share buyback optionality',
      'Low Debt & Strong Balance Sheet: Healthy Debt to Equity ratio at 0.73',
      'Positive Market Sentiment: Social/News sentiment analysis scores 72/100 bullish indicators',
      'Strong Competitive Moat: Unbreakable customer ecosystem, high switching costs, brand power',
    ],
    swot: {
      strengths: ['Strong brand loyalty and customer retention', 'Highly profitable services division', 'Massive cash reserves ($160B+)', 'Dominant hardware market share globally'],
      weaknesses: ['Heavy reliance on iPhone sales cycles', 'Supply chain concentration risk in Asia', 'Antitrust regulation reviews in EU/US', 'Higher pricing tier restricts emerging growth market gains'],
      opportunities: ['Expansion into autonomous systems and AI', 'Services monetization scaling (Apple TV+, Arcade)', 'Healthcare monitoring services integration in wearables', 'Direct financial services (Apple Card, Savings)'],
      threats: ['Geopolitical trade restrictions and hardware tariffs', 'Aggressive local competition in Asian markets', 'Rapidly evolving smartphone technology saturation', 'Fluctuating consumer retail spend sentiment'],
    },
    stockHistory: [168, 172, 170, 179, 183, 185.5],
    news: [
      { title: 'Apple Unveils New AI Chips and Neural Engine Upgrades', sentiment: 'Positive', impact: 5, source: 'TechCrunch', time: '2 hours ago' },
      { title: 'App Store Guidelines Under Anti-Competitive Investigation', sentiment: 'Negative', impact: 3, source: 'Reuters', time: '5 hours ago' },
      { title: 'Consumer Spending Index Holds Steady for Premium Hardware', sentiment: 'Neutral', impact: 4, source: 'Bloomberg', time: '1 day ago' },
    ],
    allocation: [
      { name: 'Apple Inc.', pct: 35, amt: '¥35,000', color: 'bg-blue-650' },
      { name: 'NVIDIA Corp.', pct: 25, amt: '¥25,000', color: 'bg-emerald-500' },
      { name: 'Microsoft Corp.', pct: 20, amt: '¥20,000', color: 'bg-indigo-500' },
      { name: 'Alphabet Inc.', pct: 10, amt: '¥10,000', color: 'bg-amber-500' },
      { name: 'Amazon.com', pct: 10, amt: '¥10,000', color: 'bg-purple-500' },
    ],
  },
  TSLA: {
    name: 'Tesla Inc.',
    ticker: 'TSLA',
    exchange: 'NASDAQ',
    industry: 'Electric Vehicles • Austin, TX',
    description: 'Tesla, Inc. designs, develops, manufactures, sells, and leases fully electric vehicles, energy generation, and storage systems.',
    logo: '⚡',
    price: 177.40,
    change: -4.10,
    changePercent: -2.26,
    marketCap: '$560.4B',
    range52w: '$138.80 - $299.29',
    divYield: 'N/A',
    nextEarnings: 'July 23, 2024',
    confidence: 65,
    rec: 'HOLD',
    recSub: 'Hold / Neutral',
    metrics: {
      revenue: { value: '$96.8B', yoy: '+8.2%', trend: [82, 88, 92, 90, 94, 96.8] },
      profit: { value: '$13.4B', yoy: '-15.2%', trend: [18, 16, 15, 14, 13, 13.4] },
      fcf: { value: '$4.3B', yoy: '-32.1%', trend: [9, 8, 7, 5, 4.5, 4.3] },
      roe: { value: '22.1%', yoy: '-4.1%', trend: [28, 26, 25, 24, 23, 22.1] },
      debtToEquity: { value: '0.04', risk: 'Low Risk', trend: [10, 8, 6, 5, 4, 4] },
      peRatio: { value: '45.8', rating: 'Expensive', trend: [65, 60, 55, 52, 48, 45.8] },
      eps: { value: '$3.85', yoy: '-12.4%', trend: [4.8, 4.5, 4.2, 4.0, 3.9, 3.85] },
    },
    radarPoints: "150,110 190,130 170,165 150,190 120,160 130,120",
    radarScores: [
      { label: 'Profitability', score: 7.2 },
      { label: 'Growth', score: 8.0 },
      { label: 'Cash Flow', score: 6.8 },
      { label: 'Management', score: 7.5 },
      { label: 'Efficiency', score: 7.9 },
      { label: 'Solvency', score: 9.8 },
    ],
    risk: {
      overall: 54,
      market: 'High (65%)',
      financial: 'Low (15%)',
      competition: 'High (70%)',
      regulatory: 'Medium (40%)',
      technology: 'Medium (45%)',
    },
    reasoning: [
      'Stagnating EV Volumes: Core automotive sales showing supply outstripping demand globally',
      'Margin Contraction: Price cuts impacting gross auto margin (now 16.4% down from 24%)',
      'Ultra Low Debt: Virtually debt free balance sheet leaves substantial safety cushions',
      'Capex Shift to AI: Massive investment in Dojo and FSD chip designs pivots thesis to robotics',
    ],
    swot: {
      strengths: ['Unmatched EV charging network footprint', 'Market leader in autonomous training compute capacity', 'No significant legacy debt obligations', 'High brand appeal and vertical integration capabilities'],
      weaknesses: ['Over-reliance on Model 3 and Y unit volumes', 'Key person risk regarding celebrity CEO', 'Production cost compression in new platforms', 'Slowing capital conversion efficiency'],
      opportunities: ['Full Self-Driving licensing to legacy competitors', 'Megapack utility battery storage sales growth', 'Optimus humanoid robot commercial manufacturing', 'Next generation low-cost model rollout (Model 2)'],
      threats: ['Intense pricing pressure from Chinese EV giants like BYD', 'Lithium and mineral processing pricing volatility', 'Slowing EV adoption timelines in key western markets', 'Regulatory safety checks for autopilot systems'],
    },
    stockHistory: [195, 185, 165, 171, 174, 177.4],
    news: [
      { title: 'Tesla Approves Historic CEO Compensation Package After Shareholder Vote', sentiment: 'Positive', impact: 4, source: 'WSJ', time: '3 hours ago' },
      { title: 'EU Imposes Tariffs on EV Shipments from Mainland Factories', sentiment: 'Negative', impact: 4, source: 'FT', time: '10 hours ago' },
      { title: 'Supercharger Network Access Expands to Ford and GM Drivers', sentiment: 'Positive', impact: 3, source: 'CNBC', time: '2 days ago' },
    ],
    allocation: [
      { name: 'Tesla Inc.', pct: 15, amt: '¥15,000', color: 'bg-rose-500' },
      { name: 'NVIDIA Corp.', pct: 40, amt: '¥40,000', color: 'bg-emerald-500' },
      { name: 'Microsoft Corp.', pct: 25, amt: '¥25,000', color: 'bg-indigo-500' },
      { name: 'Amazon.com', pct: 20, amt: '¥20,000', color: 'bg-purple-500' },
    ],
  },
};

import { useResearchStore, InvestmentReport } from '../../../business/store/research.store';

const formatCurrency = (val: number) => {
  if (!val) return 'N/A';
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  return `$${val.toLocaleString()}`;
};

const mapReportToDashboardData = (report: InvestmentReport): CompanyData => {

  const marketCap = report.competitorSummary.competitors.find(c => c.symbol === report.companyOverview.symbol)?.marketCap || 0;
  
  return {
    name: report.companyOverview.name,
    ticker: report.companyOverview.symbol,
    exchange: 'US EQUITY', 
    industry: report.companyOverview.industry,
    description: report.companyOverview.description,
    logo: report.companyOverview.symbol.substring(0, 2),
    price: report.stockSummary.currentPrice,
    change: report.stockSummary.currentPrice * (report.stockSummary.changePercent / 100),
    changePercent: report.stockSummary.changePercent,
    marketCap: formatCurrency(marketCap),
    range52w: `$${report.stockSummary.fiftyTwoWeekLow.toFixed(2)} - $${report.stockSummary.fiftyTwoWeekHigh.toFixed(2)}`,
    divYield: 'N/A',
    nextEarnings: 'TBD',
    confidence: report.confidence,
    rec: (report.recommendation.rating.toUpperCase() as any) || 'HOLD',
    recSub: report.recommendation.rating,
    metrics: {
      revenue: { value: formatCurrency(report.financialSummary.revenue), yoy: 'N/A', trend: [50, 60, 70, 80, 90, 100] },
      profit: { value: formatCurrency(report.financialSummary.netIncome), yoy: 'N/A', trend: [50, 60, 70, 80, 90, 100] },
      fcf: { value: formatCurrency(report.financialSummary.netIncome * 0.8), yoy: 'N/A', trend: [50, 60, 70, 80, 90, 100] },
      roe: { value: 'N/A', yoy: 'N/A', trend: [50, 60, 70, 80, 90, 100] },
      debtToEquity: { value: 'N/A', risk: 'Medium Risk', trend: [50, 60, 70, 80, 90, 100] },
      peRatio: { value: report.financialSummary.peRatio.toFixed(2), rating: 'Moderate', trend: [50, 60, 70, 80, 90, 100] },
      eps: { value: `$${report.financialSummary.eps.toFixed(2)}`, yoy: 'N/A', trend: [5, 6, 7, 8, 9, 10] },
    },
    radarPoints: "150,80 210,110 200,165 150,210 100,170 85,115",
    radarScores: [
      { label: 'Profitability', score: Number((report.scores.profitability?.value / 10 || 0).toFixed(1)) },
      { label: 'Growth', score: Number((report.scores.growth?.value / 10 || 0).toFixed(1)) },
      { label: 'Cash Flow', score: Number((report.scores.financialHealth?.value / 10 || 0).toFixed(1)) },
      { label: 'Management', score: Number((report.scores.management?.value / 10 || 0).toFixed(1)) },
      { label: 'Efficiency', score: Number((report.scores.valuation?.value / 10 || 0).toFixed(1)) },
      { label: 'Solvency', score: Number((report.scores.risk?.value / 10 || 0).toFixed(1)) },
    ],
    risk: {
      overall: report.riskSummary.overallRiskScore,
      market: report.scores.marketPerformance?.explanation || 'Low Risk',
      financial: report.scores.financialHealth?.explanation || 'Low Risk',
      competition: report.scores.competitiveStrength?.explanation || 'Medium Risk',
      regulatory: report.riskSummary.overallRiskLevel || 'Low Risk',
      technology: report.scores.innovation?.explanation || 'Low Risk',
    },
    reasoning: report.recommendation.rationale || [],
    swot: {
      strengths: report.swot.strengths?.map(s => s.title) || [],
      weaknesses: report.swot.weaknesses?.map(s => s.title) || [],
      opportunities: report.swot.opportunities?.map(s => s.title) || [],
      threats: report.swot.threats?.map(s => s.title) || [],
    },
    stockHistory: [
      report.stockSummary.currentPrice * 0.9,
      report.stockSummary.currentPrice * 0.95,
      report.stockSummary.currentPrice * 0.98,
      report.stockSummary.currentPrice * 1.02,
      report.stockSummary.currentPrice * 1.05,
      report.stockSummary.currentPrice
    ],
    news: (report.newsSummary.recentNews as any) || [],
    allocation: COMPANIES.AAPL.allocation,
  };
};

// ==========================================
// Interactive Loading Screen Components
// ==========================================

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const TRIVIA_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the P/E (Price-to-Earnings) ratio primarily used to evaluate?",
    options: [
      "A company's total market size",
      "Whether a stock is undervalued or overvalued relative to its earnings",
      "The percentage of corporate profits paid out as dividends"
    ],
    correct: 1,
    explanation: "The Price-to-Earnings (P/E) ratio compares a company's stock price to its earnings per share, helping investors understand if they are paying a fair price."
  },
  {
    question: "What does 'Market Capitalization' represent?",
    options: [
      "The total cash reserves held by a company",
      "The combined dollar value of a company's outstanding shares of stock",
      "The annual revenue generated by a company"
    ],
    correct: 1,
    explanation: "Market Cap is calculated by multiplying a company's total outstanding shares by the current share price, showing the company's total market size."
  },
  {
    question: "What does a stock 'Beta' of 1.5 indicate?",
    options: [
      "The stock pays a 1.5% dividend yield",
      "The stock is 50% more volatile than the overall market",
      "The company's earnings grow by 1.5x each quarter"
    ],
    correct: 1,
    explanation: "A Beta of 1.0 means the stock moves with the market. A Beta of 1.5 means the stock is 50% more volatile, meaning it typically swings more than the market."
  },
  {
    question: "What is 'Free Cash Flow' (FCF)?",
    options: [
      "The cash a company generates after accounting for operational and capital expenditures",
      "The cash given to shareholders as dividends",
      "The credit line a company gets from banks"
    ],
    correct: 0,
    explanation: "Free Cash Flow is the cash left over after a company pays for its operating expenses and capital expenditures (investments in buildings/equipment)."
  },
  {
    question: "What does a PEG ratio under 1.0 generally suggest?",
    options: [
      "The company has poor growth prospects",
      "The stock may be undervalued relative to its earnings growth rate",
      "The company has high debt risk"
    ],
    correct: 1,
    explanation: "The PEG ratio (Price/Earnings-to-Growth) factors in earnings growth. A PEG under 1.0 suggests the stock is undervalued given its growth speed."
  }
];

const INVESTING_TIPS = [
  "💡 PEG Ratio Tip: A PEG ratio below 1.0 is often considered a sign that a company is undervalued relative to its growth rate.",
  "💡 Beta Volatility: A Beta above 1.0 indicates higher volatility than the overall market, while a Beta below 1.0 suggests lower volatility.",
  "💡 Free Cash Flow: Robust Free Cash Flow (FCF) provides a company with cash to pay dividends, repurchase shares, or invest in new R&D.",
  "💡 ROE Indicator: Return on Equity (ROE) measures how efficiently a company is using shareholder investments to generate profit.",
  "💡 P/E average: Always compare a company's P/E ratio to its industry peers; technology firms typically have higher P/E ratios than utility companies.",
  "💡 SWOT Strategy: SWOT analysis is used by institutional analysts to map a company's internal strengths against market opportunities."
];

const TICKER_STOCKS = [
  { symbol: 'AAPL', price: 185.50, change: 1.21 },
  { symbol: 'TSLA', price: 177.40, change: -2.26 },
  { symbol: 'NVDA', price: 875.12, change: 3.45 },
  { symbol: 'MSFT', price: 421.90, change: 0.85 },
  { symbol: 'AMZN', price: 178.15, change: 1.10 },
  { symbol: 'GOOGL', price: 173.50, change: -0.45 },
  { symbol: 'META', price: 495.20, change: 2.15 },
  { symbol: 'NFLX', price: 615.30, change: 1.55 },
  { symbol: 'BTC', price: 67452, change: 1.88 },
  { symbol: 'ETH', price: 3485, change: 2.10 },
];

const LOADER_STEPS = [
  { key: 'profile', label: 'Resolving Company Profile', desc: 'Validating registry details & exchange listings' },
  { key: 'financials', label: 'Retrieving Financials', desc: 'Analyzing balance sheets & income statements' },
  { key: 'stock', label: 'Stock technicals', desc: 'Mapping moving averages & volatility indices' },
  { key: 'news', label: 'Sentiment audit', desc: 'Analyzing news sentiment & market announcements' },
  { key: 'competitors', label: 'Benchmarking peers', desc: 'Resolving comparable industry multipliers' },
  { key: 'risk_swot', label: 'SWOT & Risk models', desc: 'Running SWOT generation & risk factor scoreboards' },
  { key: 'thesis', label: 'Investment thesis', desc: 'Synthesizing core growth narratives' },
  { key: 'recommendation', label: 'Valuation & Recommendation', desc: 'Formulating target rating & final report compile' },
];

const getActiveStepIndex = (node: string): number => {
  switch (node) {
    case 'start':
    case 'validateCompany':
    case 'companyProfile':
      return 0;
    case 'financialAnalysis':
      return 1;
    case 'stockAnalysis':
      return 2;
    case 'newsAnalysis':
      return 3;
    case 'competitorAnalysis':
    case 'validation':
      return 4;
    case 'riskAnalysis':
    case 'swotAnalysis':
      return 5;
    case 'investmentThesis':
    case 'investmentScoring':
      return 6;
    case 'generateRecommendation':
    case 'reportGeneration':
      return 7;
    case 'complete':
      return 8;
    default:
      return 0;
  }
};

function InteractiveLoader({ ticker }: { ticker: string }) {
  const { progressNode, progressMessage } = useResearchStore();
  const [timeLeft, setTimeLeft] = useState(45);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % INVESTING_TIPS.length);
    }, 6000);
    return () => clearInterval(tipInterval);
  }, []);

  const activeIndex = getActiveStepIndex(progressNode || 'start');

  const handleAnswerClick = (optIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optIdx);
    if (optIdx === TRIVIA_QUESTIONS[triviaIndex].correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    if (triviaIndex < TRIVIA_QUESTIONS.length - 1) {
      setTriviaIndex((idx) => idx + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setTriviaIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
  };

  const currentQ = TRIVIA_QUESTIONS[triviaIndex];
  const radius = 48;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.max(0, timeLeft) / 45) * circumference;

  return (
    <div className="min-h-[85vh] bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 flex flex-col justify-between items-center py-6 px-4 font-sans relative overflow-hidden select-none transition-colors duration-300">
      <style>{`
        @keyframes ticker-slide {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker-slide {
          animation: ticker-slide 30s linear infinite;
        }
      `}</style>

      {/* 1. Continuous Ticker */}
      <div className="absolute top-0 left-0 w-full overflow-hidden bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-900 py-3 flex items-center z-10 backdrop-blur-md">
        <div className="flex gap-12 whitespace-nowrap animate-ticker-slide">
          {[...TICKER_STOCKS, ...TICKER_STOCKS].map((stock, idx) => (
            <div key={idx} className="inline-flex items-center gap-2.5 text-xs font-black tracking-wide">
              <span className="text-slate-500 dark:text-slate-400">{stock.symbol}</span>
              <span className="text-slate-900 dark:text-white">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className={`flex items-center gap-0.5 ${stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                {stock.change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-6xl mt-12 grid gap-6 md:grid-cols-12 items-stretch z-0">
        {/* LEFT COLUMN: Progress Timeline and Circular Count */}
        <div className="md:col-span-6 glass-card rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-blue-505 animate-pulse" />
              AI Agent Research Feed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-6">
              Compiling deep equity and market analysis for <span className="text-blue-600 dark:text-blue-400 font-bold">{ticker.toUpperCase()}</span>.
            </p>

            {/* Circular Timer & Countdown */}
            <div className="flex items-center gap-6 mb-8 bg-slate-100/50 dark:bg-[#141b2e]/30 border border-slate-205 dark:border-slate-800/40 p-4 rounded-2xl">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  {/* Background track */}
                  <circle cx="48" cy="48" r={normalizedRadius} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth={stroke} fill="transparent" />
                  {/* Active track */}
                  <circle
                    cx="48"
                    cy="48"
                    r={normalizedRadius}
                    stroke="#2563eb"
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{timeLeft > 0 ? `${timeLeft}s` : '0s'}</span>
                  <span className="text-[7.5px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Remaining</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {timeLeft > 0 ? 'Analyzing data feeds...' : 'Finalizing scoring & grades...'}
                </div>
                <div className="text-xs text-blue-650 dark:text-blue-400 mt-1 font-semibold">
                  Active task: <span className="text-slate-700 dark:text-slate-200">{progressMessage || 'Contacting Yahoo Finance...'}</span>
                </div>
              </div>
            </div>

            {/* Agent steps timeline */}
            <div className="space-y-4">
              {LOADER_STEPS.map((step, idx) => {
                const isCompleted = idx < activeIndex;
                const isActive = idx === activeIndex;

                return (
                  <div key={step.key} className="flex gap-4 items-start">
                    <div className="relative flex flex-col items-center shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 animate-fade-in" />
                      ) : isActive ? (
                        <div className="h-5 w-5 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-700" />
                      )}
                      {idx < LOADER_STEPS.length - 1 && (
                        <div className={`w-[1px] h-6 mt-1 ${isCompleted ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-none ${isActive ? 'text-blue-400 font-black' : isCompleted ? 'text-slate-300' : 'text-slate-650'}`}>
                        {step.label}
                      </h4>
                      <p className={`text-[10px] mt-1 ${isActive ? 'text-slate-300 font-semibold' : 'text-slate-500'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Trivia Quiz and Tips */}
        <div className="md:col-span-6 flex flex-col gap-6 items-stretch">
          
          {/* TRIVIA WIDGET */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex-1">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-wider uppercase bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-slate-900/50">
                  💡 INVEST IQ TRIVIA
                </span>
                <span className="text-[10px] font-bold text-blue-650 dark:text-blue-400">
                  Score: {score}/{TRIVIA_QUESTIONS.length}
                </span>
              </div>

              {!quizFinished ? (
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug mb-4">
                    {currentQ.question}
                  </h4>

                  <div className="space-y-2.5">
                    {currentQ.options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === currentQ.correct;
                      let btnStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-[#141b2e]/55 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-955/30";

                      if (selectedAnswer !== null) {
                        if (isCorrect) {
                          btnStyle = "border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold";
                        } else if (isSelected) {
                          btnStyle = "border-rose-500 bg-rose-950/20 text-rose-455";
                        } else {
                          btnStyle = "border-slate-900 text-slate-600 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={selectedAnswer !== null}
                          onClick={() => handleAnswerClick(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition duration-200 ${btnStyle}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswer !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-slate-100/60 dark:bg-[#141b2e]/45 border border-slate-205 dark:border-slate-800 rounded-xl text-[10.5px] text-slate-600 dark:text-slate-305 leading-relaxed"
                    >
                      <span className="font-bold text-blue-650 dark:text-blue-400 uppercase tracking-wide block mb-1">
                        EXPLANATION:
                      </span>
                      {currentQ.explanation}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <span className="text-4xl mb-3">🏆</span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">Trivia Complete!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    You scored <span className="text-blue-600 dark:text-blue-400 font-extrabold">{score} out of {TRIVIA_QUESTIONS.length}</span> correct answers. Ready to test yourself again?
                  </p>
                  <button
                    onClick={restartQuiz}
                    className="mt-6 px-4 py-2 rounded-xl bg-blue-650 text-white font-bold text-xs hover:bg-blue-600 transition"
                  >
                    Restart Quiz
                  </button>
                </div>
              )}
            </div>

            {!quizFinished && selectedAnswer !== null && (
              <button
                onClick={handleNextQuestion}
                className="mt-6 w-full py-2.5 rounded-xl bg-blue-650 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
              >
                {triviaIndex < TRIVIA_QUESTIONS.length - 1 ? 'Next Question' : 'Complete Quiz'}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* INSIGHT TIP PANEL */}
          <div className="glass-card rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] h-32 flex flex-col justify-between">
            <span className="text-[9px] font-black text-indigo-650 dark:text-indigo-400 tracking-wider uppercase block">
              💡 AI INVESTING INSIGHT
            </span>
            <div className="flex-1 flex items-center mt-2">
              <p className="text-[11.5px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                {INVESTING_TIPS[tipIndex]}
              </p>
            </div>
            <span className="text-[8.5px] text-slate-500 dark:text-slate-400 font-semibold self-end">
              Rotates automatically • {tipIndex + 1}/{INVESTING_TIPS.length}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { currentResearch, currentCompany, loading, progressNode, workflowStatus, startResearch } = useResearchStore();
  
  const [currentTab, setCurrentTab] = useState('Overview');
  const [chatInput, setChatInput] = useState('');
  
  const data = currentResearch ? mapReportToDashboardData(currentResearch) : null;

  // Hash scroll listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    const timeoutId = setTimeout(handleHashChange, 350);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const tabToId: Record<string, string> = {
    'Overview': 'overview',
    'Financials': 'financials',
    'News': 'news',
    'Analysis': 'analysis',
    'SWOT': 'swot',
    'Risk': 'risk',
    'Valuation': 'valuation',
    'Charts': 'charts',
    'AI Thesis': 'thesis',
    'Documents': 'history',
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    { sender: 'user', text: `Why is the PE ratio high?`, time: '10:30 AM' },
    { sender: 'assistant', text: `The current PE ratio reflects market consensus expectations for sustained margin expansions and robust balance sheet assets.`, time: '10:31 AM' }
  ]);

  useEffect(() => {
    if (!data) return;
    setChatMessages([
      { sender: 'user', text: `Should I invest in ${data.ticker} now?`, time: '10:30 AM' },
      { sender: 'assistant', text: `Based on current data, ${data.ticker} shows a ${data.rec} rating. The AI confidence level stands at ${data.confidence}%. For a medium-term investment horizon, consider the thesis catalysts detailed below.`, time: '10:32 AM' }
    ]);
  }, [data?.ticker, data?.rec, data?.confidence]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !data) return;

    const newMsg = { sender: 'user' as const, text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      const response = {
        sender: 'assistant' as const,
        text: `Analyzing ${data.ticker} database modules... The latest regulatory files and competitor PE averages indicate stable positioning. Do you want to compile a PDF research summary?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, response]);
    }, 1200);
  };

  const nodeToIndex: Record<string, number> = {
    'start': 0,
    'validateCompany': 0,
    'companyProfile': 0,
    'financialAnalysis': 1,
    'stockAnalysis': 2,
    'newsAnalysis': 3,
    'competitorAnalysis': 4,
    'validation': 4,
    'riskAnalysis': 5,
    'swotAnalysis': 6,
    'investmentThesis': 7,
    'investmentScoring': 8,
    'generateRecommendation': 8,
    'reportGeneration': 8,
    'complete': 9,
  };

  // Live timeline state calculation
  const runningTimeline = loading;
  const activeStep = (loading || workflowStatus === 'completed') ? (nodeToIndex[progressNode] ?? 0) : 9;

  const timelineSteps = [
    { label: 'Understanding Company', desc: 'Validating corporate registry & sector definition' },
    { label: 'Fetching Financial Data', desc: 'Loading balance sheets & income statements' },
    { label: 'Reading Annual Reports', desc: 'Extracting risk factor matrices from SEC files' },
    { label: 'Analyzing Latest News', desc: 'Scoring sentiment indices on real-time feeds' },
    { label: 'Comparing Competitors', desc: 'Benchmarking core valuation multipliers' },
    { label: 'Calculating Risk Factors', desc: 'Aggregating credit and regulatory headwinds' },
    { label: 'Generating SWOT Analysis', desc: 'Synthesizing internal matrices' },
    { label: 'Building Investment Thesis', desc: 'Mapping growth catalysts' },
    { label: 'Final Recommendation Ready', desc: 'Compiling target valuations' },
  ];

  // Auto-trigger Apple on first load
  const hasInitialized = React.useRef(false);
  useEffect(() => {
    if (!currentResearch && !loading && !hasInitialized.current) {
      hasInitialized.current = true;
      startResearch('AAPL');
    }
  }, [currentResearch, loading, startResearch]);

  if (!data) {
    const store = useResearchStore.getState();
    if (store.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-400">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-black text-white">Research Failed</h2>
          <p className="mt-2 text-sm text-rose-400">{store.error}</p>
          <button onClick={() => startResearch('AAPL')} className="mt-6 rounded-xl bg-blue-650 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition">
            Retry Dashboard
          </button>
        </div>
      );
    }
    return (
      <InteractiveLoader ticker={currentCompany || 'AAPL'} />
    );
  }

  return (
    <div className="space-y-6 pb-12 text-slate-900 dark:text-slate-100 relative">
      
      {/* Error Overlay when research fails but previous company is loaded */}
      {useResearchStore.getState().error && data && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3 rounded-2xl bg-rose-50/90 dark:bg-rose-955/90 border border-rose-200 dark:border-rose-500/50 p-4 shadow-xl backdrop-blur-md">
          <AlertCircle className="h-6 w-6 text-rose-500" />
          <div className="flex flex-col">
            <span className="text-sm font-black text-rose-900 dark:text-rose-100">Research Failed</span>
            <span className="text-xs font-semibold text-rose-605 dark:text-rose-400">{useResearchStore.getState().error}</span>
          </div>
          <button onClick={() => useResearchStore.getState().reset()} className="ml-4 text-rose-555 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading Overlay when changing companies */}
      {loading && (
        <div className="absolute inset-0 z-50 rounded-2xl bg-slate-50 dark:bg-[#07090e] shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
          <InteractiveLoader ticker={currentCompany || 'AAPL'} />
        </div>
      )}

      {/* Main Dashboard Content */}
      <motion.div 
        key={data.ticker} 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* 1. TOP MARKET STRIP */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 border-b border-slate-205 dark:border-slate-800/40 pb-3.5">
          <div className="flex items-center justify-between rounded-xl glass-card p-2.5">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">S&P 500</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <span>5,278.40</span>
              <ArrowUpRight className="h-3 w-3" />
              <span className="text-[9px] font-medium">+0.82%</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl glass-card p-2.5">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">NASDAQ</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <span>16,735.02</span>
              <ArrowUpRight className="h-3 w-3" />
              <span className="text-[9px] font-medium">+1.25%</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl glass-card p-2.5">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">NIFTY 50</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <span>22,957.10</span>
              <ArrowUpRight className="h-3 w-3" />
              <span className="text-[9px] font-medium">+0.63%</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl glass-card p-2.5">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">GOLD</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <span>$2,385.40</span>
              <ArrowUpRight className="h-3 w-3" />
              <span className="text-[9px] font-medium">+0.41%</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl glass-card p-2.5">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">BTC</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <span>$67,452.21</span>
              <ArrowUpRight className="h-3 w-3" />
              <span className="text-[9px] font-medium">+1.88%</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl glass-card p-2.5">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">TICKER SELECT</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white px-2 py-1">{data.ticker}</span>
          </div>
        </div>

      {/* 2. MAIN HERO SECTION */}
      <div id="overview" className="rounded-2xl border border-slate-900 bg-[#0B0F19] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.4)] relative overflow-hidden scroll-mt-20">
        {/* Glow accent */}
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
        
        <div className="grid gap-6 md:grid-cols-12 items-center">
          
          {/* Logo & Corporate Tag */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-105 dark:bg-[#141b2e] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-3xl shadow-md shrink-0">
              {data.logo}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{data.name}</h2>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-[#141b2e] px-2 py-1 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850">
                  {data.ticker}
                </span>
                <span className="text-[10px] font-bold bg-slate-100/80 dark:bg-slate-950/60 px-2 py-1 rounded text-blue-600 dark:text-blue-400 border border-slate-200/50 dark:border-slate-900/50">
                  {data.exchange}
                </span>
              </div>
              <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold mt-1">{data.industry}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="rounded-md bg-slate-200/60 dark:bg-slate-900 px-2 py-0.5 text-[8.5px] font-extrabold text-slate-600 dark:text-slate-400">Large Cap</span>
                <span className="rounded-md bg-slate-200/60 dark:bg-slate-900 px-2 py-0.5 text-[8.5px] font-extrabold text-slate-600 dark:text-slate-400">Technology</span>
                <span className="rounded-md bg-slate-200/60 dark:bg-slate-900 px-2 py-0.5 text-[8.5px] font-extrabold text-slate-600 dark:text-slate-400">Premium</span>
              </div>
            </div>
          </div>

          {/* AI Recommendation Box */}
          <div className="md:col-span-4 flex items-center justify-around border-t md:border-t-0 md:border-l md:border-r border-slate-200 dark:border-slate-800/60 py-2">
            <div className="text-center">
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 tracking-wider block uppercase">AI RECOMMENDATION</span>
              <span className={`text-3xl font-black ${data.rec === 'BUY' ? 'text-emerald-500' : 'text-amber-500'} tracking-wide mt-1 block`}>
                {data.rec}
              </span>
              <span className={`mt-1.5 inline-block text-[8px] font-black px-2 py-0.5 rounded-full ${data.rec === 'BUY' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'}`}>
                {data.recSub}
              </span>
            </div>
            
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="4.5" fill="transparent" />
                <circle cx="32" cy="32" r="26" stroke={data.rec === 'BUY' ? '#10b981' : '#f59e0b'} strokeWidth="4.5" fill="transparent"
                  strokeDasharray="163.3"
                  strokeDashoffset={163.3 - (163.3 * data.confidence) / 100}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm font-black text-slate-900 dark:text-white">{data.confidence}%</span>
                <span className="text-[7px] text-slate-500 dark:text-slate-450 font-bold uppercase">Confidence</span>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 text-left border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800/60 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Current Rating</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="rounded bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-1.5 py-0.5 text-[8.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase">{data.rec}</span>
              </div>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Market Capital</span>
              <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{data.marketCap}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">52 Week Range</span>
              <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{data.range52w}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Next Catalyst</span>
              <span className="text-xs font-black mt-0.5 block text-indigo-650 dark:text-indigo-400">{data.nextEarnings}</span>
            </div>
          </div>
        </div>
      </div>
       {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-900 overflow-x-auto py-1 scrollbar-none">
        {['Overview', 'Financials', 'News', 'Analysis', 'SWOT', 'Risk', 'Valuation', 'Charts', 'AI Thesis', 'Documents'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setCurrentTab(tab);
              scrollToSection(tabToId[tab]);
            }}
            className={`px-4 py-2 text-xs font-bold transition-all rounded-lg shrink-0 ${
              currentTab === tab 
                ? 'bg-blue-100 dark:bg-blue-955/40 text-blue-650 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN TWO COLUMN GRID */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* LEFT COMPILER COLUMN (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* 3. FINANCIAL HEALTH METRIC CARDS */}
          <div id="financials" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 scroll-mt-20">
            
            {/* Metric Card 1 */}
            <div className="glass-card rounded-2xl p-4 relative group">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider">REVENUE (TTM)</span>
                <span className="rounded bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-1.5 py-0.5 text-[8.5px] font-black text-emerald-600 dark:text-emerald-450 uppercase">Excellent</span>
              </div>
              <h4 className="text-lg font-black mt-2 text-slate-900 dark:text-white">{data.metrics.revenue.value}</h4>
              <p className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-500 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 shrink-0 mr-0.5" />
                {data.metrics.revenue.yoy} YoY
              </p>
              {/* Mini Sparkline Chart */}
              <div className="mt-3 h-7 w-full">
                <svg className="h-full w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 15 Q 20 8 40 12 T 80 5 T 100 2" fill="none" stroke="#10b981" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="glass-card rounded-2xl p-4 relative group">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider">NET PROFIT (TTM)</span>
                <span className="rounded bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-1.5 py-0.5 text-[8.5px] font-black text-emerald-600 dark:text-emerald-450 uppercase">Excellent</span>
              </div>
              <h4 className="text-lg font-black mt-2 text-slate-900 dark:text-white">{data.metrics.profit.value}</h4>
              <p className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-500 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 shrink-0 mr-0.5" />
                {data.metrics.profit.yoy} YoY
              </p>
              {/* Mini Sparkline Chart */}
              <div className="mt-3 h-7 w-full">
                <svg className="h-full w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 18 Q 20 12 40 15 T 80 8 T 100 3" fill="none" stroke="#10b981" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="glass-card rounded-2xl p-4 relative group">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider">FREE CASH FLOW</span>
                <span className="rounded bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-1.5 py-0.5 text-[8.5px] font-black text-emerald-600 dark:text-emerald-450 uppercase">Excellent</span>
              </div>
              <h4 className="text-lg font-black mt-2 text-slate-900 dark:text-white">{data.metrics.fcf.value}</h4>
              <p className="text-[9.5px] font-bold text-emerald-650 dark:text-emerald-500 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 shrink-0 mr-0.5" />
                {data.metrics.fcf.yoy} YoY
              </p>
              {/* Mini Sparkline Chart */}
              <div className="mt-3 h-7 w-full">
                <svg className="h-full w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 14 Q 25 10 50 12 T 100 4" fill="none" stroke="#10b981" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Metric Card 4 */}
            <div className="glass-card rounded-2xl p-4 relative group">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider">DEBT-TO-EQUITY</span>
                <span className="rounded bg-blue-105 dark:bg-blue-955/30 border border-blue-200 dark:border-blue-900/40 px-1.5 py-0.5 text-[8.5px] font-black text-blue-600 dark:text-blue-455 uppercase">Low Risk</span>
              </div>
              <h4 className="text-lg font-black mt-2 text-slate-900 dark:text-white">{data.metrics.debtToEquity.value}</h4>
              <p className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-500 flex items-center mt-1">
                <Activity className="h-3 w-3 shrink-0 mr-0.5" />
                Healthy Structure
              </p>
              {/* Mini Sparkline Chart */}
              <div className="mt-3 h-7 w-full">
                <svg className="h-full w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 5 Q 30 7 60 12 T 100 18" fill="none" stroke="#3b82f6" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* MIDDLE VISUALIZATIONS SECTION */}
          <div id="compare" className="grid gap-6 md:grid-cols-3 scroll-mt-20">
            
            {/* 4. FINANCIAL HEALTH RADAR (Radar chart) */}
            <div id="valuation" className="glass-card rounded-2xl p-5 flex flex-col justify-between scroll-mt-20">
              <div>
                <h3 className="text-sm font-black tracking-wide text-slate-700 dark:text-slate-350">Financial Health Radar</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Unified evaluation across core metrics</p>
              </div>

              {/* Spider web rendering */}
              <div className="flex justify-center items-center py-6 relative">
                <svg className="w-48 h-48" viewBox="0 0 300 300">
                  {/* Grid Lines */}
                  <polygon points="150,30 254,90 254,210 150,270 46,210 46,90" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <polygon points="150,70 219,110 219,190 150,230 81,190 81,110" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <polygon points="150,110 184,130 184,170 150,190 116,170 116,130" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  {/* Axis lines */}
                  <line x1="150" y1="150" x2="150" y2="30" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="150" y1="150" x2="254" y2="90" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="150" y1="150" x2="254" y2="210" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="150" y1="150" x2="150" y2="270" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="150" y1="150" x2="46" y2="210" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="150" y1="150" x2="46" y2="90" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  
                  {/* Plotted Area */}
                  <polygon points={data.radarPoints} fill="rgba(37,99,235,0.25)" stroke="#3b82f6" strokeWidth="2" />

                  {/* Labels */}
                  <text x="150" y="20" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-450" fontSize="10" fontWeight="bold">Profitability</text>
                  <text x="270" y="90" textAnchor="start" fill="currentColor" className="text-slate-500 dark:text-slate-455" fontSize="10" fontWeight="bold">Growth</text>
                  <text x="270" y="220" textAnchor="start" fill="currentColor" className="text-slate-500 dark:text-slate-455" fontSize="10" fontWeight="bold">Cash Flow</text>
                  <text x="150" y="290" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-455" fontSize="10" fontWeight="bold">Management</text>
                  <text x="30" y="220" textAnchor="end" fill="currentColor" className="text-slate-500 dark:text-slate-455" fontSize="10" fontWeight="bold">Efficiency</text>
                  <text x="30" y="90" textAnchor="end" fill="currentColor" className="text-slate-500 dark:text-slate-455" fontSize="10" fontWeight="bold">Solvency</text>
                </svg>

                {/* Score text overlay */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100">9.2</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">/ 10 Score</span>
                </div>
              </div>

              <div className="text-center rounded-xl bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-2.5">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 block">Excellent Financial Health Indicators</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 block">Exhibits high growth stability and cash margins</span>
              </div>
            </div>

            {/* 5. RISK ANALYSIS PANEL */}
            <div id="risk" className="glass-card rounded-2xl p-5 flex flex-col justify-between scroll-mt-20">
              <div>
                <h3 className="text-sm font-black tracking-wide text-slate-700 dark:text-slate-350">Risk Assessment</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Multi-variable liability scanning</p>
              </div>

              {/* Gauge representation */}
              <div className="flex flex-col items-center justify-center py-4 relative">
                <svg className="w-36 h-20" viewBox="0 0 100 50">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gradient-gauge)" strokeWidth="8" strokeLinecap="round" 
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (125.6 * data.risk.overall) / 100}
                  />
                  <defs>
                    <linearGradient id="gradient-gauge" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="60%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-1 flex flex-col items-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{data.risk.overall}%</span>
                  <span className="text-[8px] text-emerald-650 dark:text-emerald-450 uppercase font-black tracking-wider mt-0.5">Low Risk</span>
                </div>
              </div>

              {/* Risk list parameters */}
              <div className="space-y-1.5 text-[9.5px]">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Market Beta Risk</span>
                  <span className="text-emerald-650 dark:text-emerald-500 font-bold">{data.risk.market}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Leverage / Debt Risk</span>
                  <span className="text-emerald-650 dark:text-emerald-500 font-bold">{data.risk.financial}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Competitor Margin Risk</span>
                  <span className="text-amber-650 dark:text-amber-505 font-bold">{data.risk.competition}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Regulatory Exposure</span>
                  <span className="text-emerald-650 dark:text-emerald-500 font-bold">{data.risk.regulatory}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Technology Disrupt Risk</span>
                  <span className="text-amber-650 dark:text-amber-505 font-bold">{data.risk.technology}</span>
                </div>
              </div>
            </div>

            {/* 6. AI REASONING PANEL */}
            <div id="analysis" className="glass-card rounded-2xl p-5 flex flex-col justify-between scroll-mt-20">
              <div>
                <h3 className="text-sm font-black tracking-wide text-slate-700 dark:text-slate-350">AI Reasoning Flow</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Multi-step validation chain to investment call</p>
              </div>

              {/* Connected node lines */}
              <div className="my-3 space-y-2 relative pl-3.5 border-l border-blue-200 dark:border-blue-900/60 text-[9.5px]">
                {data.reasoning.slice(0, 5).map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker on line */}
                    <div className="absolute -left-[19.5px] top-1 h-2 w-2 rounded-full bg-blue-500 border border-slate-50 dark:border-slate-950" />
                    <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{step}</p>
                  </div>
                ))}

                {/* Recommendation node */}
                <div className="relative pt-1">
                  <div className="absolute -left-[20.5px] top-2 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-slate-50 dark:border-slate-950" />
                  <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-1.5">
                    <span className="font-black text-[9px] text-emerald-650 dark:text-emerald-450 block uppercase">Final Action Trigger</span>
                    <span className="font-extrabold text-[10px] text-slate-900 dark:text-white mt-0.5 block">{data.rec} (Confidence {data.confidence}%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 7. SWOT PANEL */}
          <div id="swot" className="glass-card rounded-2xl p-5 scroll-mt-20">
            <h3 className="text-sm font-black tracking-wide text-slate-700 dark:text-slate-300 mb-4">SWOT Strategic Matrices</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Strengths */}
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-205 dark:border-emerald-900/30 p-3">
                <span className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-500 block uppercase">Strengths (S)</span>
                <ul className="mt-2.5 space-y-1.5 text-[8.5px] text-slate-700 dark:text-slate-300 font-medium">
                  {data.swot.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="rounded-xl bg-rose-50 dark:bg-rose-955/10 border border-rose-205 dark:border-rose-900/30 p-3">
                <span className="text-[9.5px] font-black text-rose-600 dark:text-rose-500 block uppercase">Weaknesses (W)</span>
                <ul className="mt-2.5 space-y-1.5 text-[8.5px] text-slate-700 dark:text-slate-300 font-medium">
                  {data.swot.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="rounded-xl bg-blue-50 dark:bg-blue-955/10 border border-blue-205 dark:border-blue-900/30 p-3">
                <span className="text-[9.5px] font-black text-blue-600 dark:text-blue-500 block uppercase">Opportunities (O)</span>
                <ul className="mt-2.5 space-y-1.5 text-[8.5px] text-slate-700 dark:text-slate-300 font-medium">
                  {data.swot.opportunities.map((o, i) => <li key={i}>• {o}</li>)}
                </ul>
              </div>

              {/* Threats */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-955/10 border border-amber-205 dark:border-amber-900/30 p-3">
                <span className="text-[9.5px] font-black text-amber-600 dark:text-amber-500 block uppercase">Threats (T)</span>
                <ul className="mt-2.5 space-y-1.5 text-[8.5px] text-slate-700 dark:text-slate-300 font-medium">
                  {data.swot.threats.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </div>
            </div>
          </div>
               {/* 8. STOCK PERFORMANCE CHART */}
          <div id="analytics" className="glass-card rounded-2xl p-5 scroll-mt-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-black tracking-wide text-slate-700 dark:text-slate-300">Stock Valuation Performance</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Daily historic closing prices</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-200/50 dark:bg-slate-950 p-1">
                {['1M', '6M', '1Y', '3Y', '5Y', 'Max'].map((it) => (
                  <button
                    key={it}
                    className={`rounded px-2.5 py-1 text-[9px] font-black uppercase transition-all ${
                      it === '1Y' ? 'bg-blue-650 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {it}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Vector Stock Chart */}
            <div className="mt-6 flex flex-col sm:flex-row gap-6 items-stretch sm:items-end">
              <div className="flex-1 h-44 relative bg-slate-100/30 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-slate-900/40 p-2">
                <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                  {/* Grid background lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="currentColor" className="text-slate-200 dark:text-[#161e33]" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" className="text-slate-200 dark:text-[#161e33]" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-slate-200 dark:text-[#161e33]" strokeWidth="0.5" strokeDasharray="4 4" />
                  
                  {/* Plotted Line Path */}
                  <path 
                    d={`M 0 80 L 100 65 L 200 85 L 300 45 L 400 35 L 500 20`} 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="2.5" 
                  />
                  {/* Plotted points */}
                  <circle cx="0" cy="80" r="3" fill="#3b82f6" />
                  <circle cx="100" cy="65" r="3" fill="#3b82f6" />
                  <circle cx="200" cy="85" r="3" fill="#3b82f6" />
                  <circle cx="300" cy="45" r="3" fill="#3b82f6" />
                  <circle cx="400" cy="35" r="3" fill="#3b82f6" />
                  <circle cx="500" cy="20" r="3" fill="#3b82f6" />
                </svg>
              </div>

              {/* Stat block */}
              <div className="w-full sm:w-44 text-[10px] space-y-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900/30 p-3.5 font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                <div className="flex justify-between">
                  <span>Current Price</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">${data.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>52w High</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">${data.range52w.split(' - ')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span>52w Low</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">${data.range52w.split(' - ')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>P/E Ratio</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{data.metrics.peRatio.value}</span>
                </div>
                <div className="flex justify-between">
                  <span>Yield %</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{data.divYield}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 9. LATEST AI NEWS TIMELINE */}
          <div id="news" className="glass-card rounded-2xl p-5 scroll-mt-20">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-black tracking-wide text-slate-700 dark:text-slate-300">AI Corporate Intelligence Feed</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Sentiment weighed news highlights</p>
              </div>
              <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3.5">
              {data.news.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start rounded-xl bg-slate-100/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-900/50 p-3.5 hover:bg-slate-200/40 dark:hover:bg-slate-950/60 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-slate-200/60 dark:bg-[#141b2e] flex items-center justify-center text-xs shadow">
                    <Newspaper className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[8.5px] font-black px-2 py-0.5 rounded uppercase ${
                        item.sentiment === 'Positive' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' :
                        item.sentiment === 'Negative' ? 'bg-rose-100 dark:bg-rose-955/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30' :
                        'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}>
                        {item.sentiment}
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold">{item.time}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 leading-snug">{item.title}</h5>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-1">Source: {item.source} • Impact Factor: {"★".repeat(item.impact)}{"☆".repeat(5 - item.impact)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 10. PORTFOLIO SIMULATOR */}
          <div id="portfolio" className="scroll-mt-20">
            <PortfolioSimulator />
          </div>

          {/* 11. BOTTOM INSIGHT CARD */}
          <div id="thesis" className="glass-card rounded-2xl bg-gradient-to-r from-blue-50/50 dark:from-blue-955/20 to-indigo-50/30 dark:to-[#0e172a] p-5 border-l-4 border-l-blue-600 relative overflow-hidden scroll-mt-20">
            <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
              AI Portfolio Insight & Catalyst Timeline
            </h4>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
              Consensus calculations suggest keeping high exposure to {data.ticker} while tracking geopolitical chip regulatory updates. Rebalancing is suggested in 9 days preceding Q2 Earnings releases to guard against near-term cash flow volatility parameters.
            </p>
          </div>

        </div>

        {/* RIGHT ANALYST TIMELINE COLUMN (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 12. AI RESEARCH TIMELINE */}
          <div id="history" className="glass-card rounded-2xl p-5 scroll-mt-20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">AI Research Timeline</h3>
              <button 
                onClick={() => startResearch(data.ticker)} 
                disabled={runningTimeline}
                className="text-[9px] font-black text-blue-650 dark:text-blue-400 flex items-center gap-1 hover:underline disabled:opacity-40"
              >
                <Play className="h-2.5 w-2.5" /> Re-Run
              </button>
            </div>

            {/* Steps timeline vertical */}
            <div className="space-y-4 relative pl-3.5 border-l border-slate-200 dark:border-slate-850">
              {timelineSteps.map((step, idx) => {
                const isDone = idx < activeStep;
                const isActive = idx === activeStep;
                
                return (
                  <div key={idx} className="relative">
                    {/* Bullet marker */}
                    <div className="absolute -left-[20.5px] top-1">
                      {isDone ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 bg-slate-50 dark:bg-slate-950 rounded-full" />
                      ) : isActive ? (
                        <div className="h-3.5 w-3.5 rounded-full border border-blue-500 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                        </div>
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-slate-300 dark:text-slate-800 bg-slate-50 dark:bg-slate-950" />
                      )}
                    </div>

                    <div className="pl-2">
                      <span className={`text-[10px] font-extrabold ${isActive ? 'text-blue-600 dark:text-blue-400 font-black' : isDone ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                        {step.label}
                      </span>
                      <p className="text-[9px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 13. WATCHLIST */}
          <div id="watchlist" className="scroll-mt-20">
            <Watchlist />
          </div>

          {/* 14. AI COPILOT CHAT */}
          <div id="ai-insights" className="scroll-mt-20">
            <AIChat />
          </div>

        </div>

        </div>
      </motion.div>
    </div>
  );
}
