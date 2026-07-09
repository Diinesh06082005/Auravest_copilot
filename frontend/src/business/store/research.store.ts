import { create } from 'zustand';
import { config } from '../../shared/config';
import { apiClient } from '../../data/api/client';

export interface InvestmentReport {
  companyOverview: {
    name: string;
    symbol: string;
    ceo: string;
    industry: string;
    sector: string;
    hq: string;
    description: string;
  };
  financialSummary: {
    revenue: number;
    netIncome: number;
    grossMargin: number;
    operatingMargin: number;
    eps: number;
    peRatio: number;
    financialHealthScore: number;
  };
  stockSummary: {
    currentPrice: number;
    changePercent: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    beta: number;
  };
  newsSummary: {
    articleCount: number;
    categories: Record<string, number>;
    recentNews?: Array<{ title: string; sentiment: string; impact: number; source: string; time: string; }>;
  };
  competitorSummary: {
    competitors: Array<{
      name: string;
      symbol: string;
      marketCap: number;
      revenue: number;
    }>;
  };
  riskSummary: {
    overallRiskScore: number;
    overallRiskLevel: string;
    majorRisks: string[];
  };
  swot: {
    strengths: Array<{ title: string; explanation: string; confidenceScore: number }>;
    weaknesses: Array<{ title: string; explanation: string; confidenceScore: number }>;
    opportunities: Array<{ title: string; explanation: string; confidenceScore: number }>;
    threats: Array<{ title: string; explanation: string; confidenceScore: number }>;
  };
  thesis: {
    investmentThesis: { title: string; explanation: string; confidenceScore: number };
    executiveSummary: { title: string; explanation: string; confidenceScore: number };
    businessModel: { title: string; explanation: string; confidenceScore: number };
    competitiveAdvantage: { title: string; explanation: string; confidenceScore: number };
    growthDrivers: { title: string; explanation: string; confidenceScore: number };
    longTermOutlook: { title: string; explanation: string; confidenceScore: number };
  };
  scores: {
    grade: string;
    overallScore: number;
    financialHealth: { value: number; weight: number; explanation: string };
    growth: { value: number; weight: number; explanation: string };
    profitability: { value: number; weight: number; explanation: string };
    valuation: { value: number; weight: number; explanation: string };
    marketPerformance: { value: number; weight: number; explanation: string };
    competitiveStrength: { value: number; weight: number; explanation: string };
    newsSentiment: { value: number; weight: number; explanation: string };
    risk: { value: number; weight: number; explanation: string };
    management: { value: number; weight: number; explanation: string };
    innovation: { value: number; weight: number; explanation: string };
  };
  recommendation: {
    rating: string;
    targetPrice: string;
    horizon: string;
    rationale: string[];
  };
  confidence: number;
}

interface ResearchState {
  currentCompany: string | null;
  currentResearch: InvestmentReport | null;
  workflowStatus: 'idle' | 'searching' | 'completed' | 'failed';
  loading: boolean;
  error: string | null;
  history: InvestmentReport[];
  
  progressNode: string;
  progressMessage: string;

  startResearch: (company: string) => void;
  openHistoricalReport: (ticker: string) => void;
  reset: () => void;
}

export const useResearchStore = create<ResearchState>((set, get) => ({
  currentCompany: null,
  currentResearch: null,
  workflowStatus: 'idle',
  loading: false,
  error: null,
  history: [],
  progressNode: '',
  progressMessage: '',

  startResearch: async (company: string) => {
    // Set initial state
    set({
      currentCompany: company,
      loading: true,
      workflowStatus: 'searching',
      error: null,
      progressNode: 'start',
      progressMessage: 'Initializing research workflow...',
    });

    try {
      // Pre-flight check: Force Axios to execute a fast request.
      // If the token is expired, the Axios interceptor will catch the 401,
      // silently refresh the session, and save the NEW token to localStorage.
      await apiClient.get('/api/auth/me');
    } catch (err) {
      set({
        loading: false,
        workflowStatus: 'failed',
        error: 'Authentication session expired. Please refresh the page or log in again.',
        progressNode: 'error',
      });
      return;
    }

    const token = localStorage.getItem('auth_token');
    const url = new URL('/api/research/stream', config.apiUrl);
    url.searchParams.set('company', company);
    if (token) url.searchParams.set('token', token);

    const eventSource = new EventSource(url.toString(), { withCredentials: true });

    eventSource.addEventListener('progress', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        set({
          progressNode: data.node,
          progressMessage: data.message || `Executing node: ${data.node}`,
        });
      } catch (err) {}
    });

    eventSource.addEventListener('complete', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        const report = data.report;
        const currentHistory = get().history;
        set({
          currentResearch: report,
          history: [report, ...currentHistory],
          loading: false,
          workflowStatus: 'completed',
          progressNode: 'complete',
          progressMessage: 'Research compiled successfully.',
        });
        eventSource.close();
      } catch (err) {}
    });

    eventSource.addEventListener('error', async (e: any) => {
      // Gracefully handle SSE failures and attempt synchronous fallback
      try {
        const data = e.data ? JSON.parse(e.data) : null;
        set({
          loading: false,
          workflowStatus: 'failed',
          error: data?.error || 'Failed to execute research via SSE.',
          progressNode: 'error',
        });
        eventSource.close();
      } catch (err) {
        set({
          loading: false,
          workflowStatus: 'failed',
          error: 'Connection to research agent lost.',
          progressNode: 'error',
        });
        eventSource.close();
      }

      // Fallback: attempt synchronous POST /api/research to compile report
      try {
        set({ progressNode: 'fallback', progressMessage: 'SSE failed — falling back to synchronous workflow...' });
        const response = await apiClient.post('/api/research', { company });
        const report = response.data?.data?.report || response.data?.data;
        const currentHistory = get().history;

        set({
          currentResearch: report || null,
          history: report ? [report, ...currentHistory] : currentHistory,
          loading: false,
          workflowStatus: report ? 'completed' : 'failed',
          progressNode: report ? 'complete' : 'error',
          progressMessage: report ? 'Research compiled successfully (fallback).' : 'Synchronous research completed but no report returned.',
          error: report ? null : 'Synchronous research completed with no report.',
        });
      } catch (fallbackErr) {
        set({
          loading: false,
          workflowStatus: 'failed',
          error: (fallbackErr as any)?.response?.data?.message || 'Failed to execute research (SSE + fallback).',
          progressNode: 'error',
        });
      }
    });
  },

  openHistoricalReport: (ticker: string) => {
    const { history } = get();
    const historicalReport = history.find(r => r.companyOverview.symbol.toLowerCase() === ticker.toLowerCase());
    
    if (historicalReport) {
      set({
        currentCompany: historicalReport.companyOverview.symbol,
        currentResearch: historicalReport,
        workflowStatus: 'completed',
        loading: false,
        error: null,
      });
    } else {
      get().startResearch(ticker);
    }
  },

  reset: () => {
    set({
      loading: false,
      workflowStatus: 'idle',
      error: null,
      progressNode: '',
      progressMessage: '',
    });
  }
}));
