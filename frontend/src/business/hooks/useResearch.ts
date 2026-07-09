import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../data/api/client';

export interface ResearchReport {
  _id: string;
  ticker: string;
  title: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  analysis: {
    recommendation: 'buy' | 'sell' | 'hold';
    swot?: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    investmentThesis?: string;
  };
  createdAt: string;
}

const fetchReports = async (): Promise<ResearchReport[]> => {
  const response = await apiClient.get('/api/research/reports');
  return response.data.data.reports;
};

/**
 * Hook to retrieve compiled stock analysis reports
 */
export const useResearchReportsQuery = () => {
  return useQuery<ResearchReport[], Error>({
    queryKey: ['researchReports'],
    queryFn: fetchReports,
  });
};

/**
 * Mutation to run research compiling workflow
 */
export const useCompileResearchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiClient.post('/api/research', { ticker });
      return response.data.data.report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchReports'] });
    },
  });
};

/**
 * Utility to trigger binary Blob download of PDF report
 */
export const downloadReportPdf = async (reportId: string, ticker: string) => {
  try {
    const response = await apiClient.get(`/api/research/${reportId}/export`, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ticker.toUpperCase()}_Research_Report.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw new Error('Failed to generate and download PDF report file.');
  }
};
