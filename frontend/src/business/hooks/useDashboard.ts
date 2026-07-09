import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../data/api/client';

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore: number;
  hasAlert: boolean;
  aiPulse: string;
}

export interface FinancialMetrics {
  netLiquidValue: number;
  buyingPower: number;
  dayChange: number;
  dayChangePercent: number;
  activeAlertsCount: number;
}

export interface DashboardData {
  financialMetrics: FinancialMetrics;
  watchlist: WatchlistItem[];
  portfolio: {
    name: string;
    assets: Array<{ ticker: string; shares: number; averageBuyPrice: number }>;
  };
}

// Fetch aggregated dashboard metrics
const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await apiClient.get('/api/dashboard');
  return response.data.data;
};

/**
 * Hook to retrieve dashboard datasets with built-in caching
 */
export const useDashboardQuery = () => {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 20000, // Consider data stale after 20 seconds
  });
};

/**
 * Mutation to add a new ticker to user's watchlist with Optimistic Updates
 */
export const useAddWatchlistTicker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiClient.post('/api/dashboard/watchlist', { ticker });
      return response.data.data;
    },
    onMutate: async (newTicker) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      const previousDashboard = queryClient.getQueryData<DashboardData>(['dashboard']);

      if (previousDashboard) {
        const optimisticItem: WatchlistItem = {
          symbol: newTicker.toUpperCase(),
          name: `${newTicker.toUpperCase()} Corp.`,
          price: 150.0,
          change: 0.0,
          changePercent: 0.0,
          sparkline: [150, 150],
          sentiment: 'Neutral',
          sentimentScore: 50,
          hasAlert: false,
          aiPulse: 'Synchronizing watchlist metrics...',
        };

        queryClient.setQueryData<DashboardData>(['dashboard'], {
          ...previousDashboard,
          watchlist: [...previousDashboard.watchlist, optimisticItem],
        });
      }

      return { previousDashboard };
    },
    onError: (err, newTicker, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Mutation to remove a ticker from user's watchlist with Optimistic Updates
 */
export const useRemoveWatchlistTicker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiClient.delete(`/api/dashboard/watchlist/${ticker}`);
      return response.data.data;
    },
    onMutate: async (tickerToRemove) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      const previousDashboard = queryClient.getQueryData<DashboardData>(['dashboard']);

      if (previousDashboard) {
        queryClient.setQueryData<DashboardData>(['dashboard'], {
          ...previousDashboard,
          watchlist: previousDashboard.watchlist.filter(
            (item) => item.symbol !== tickerToRemove.toUpperCase()
          ),
        });
      }

      return { previousDashboard };
    },
    onError: (err, tickerToRemove, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Mutation to toggle alert preferences on a ticker with Optimistic Updates
 */
export const useToggleWatchlistAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticker: string) => {
      // Mock toggle delay simulation
      return { ticker };
    },
    onMutate: async (tickerToToggle) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      const previousDashboard = queryClient.getQueryData<DashboardData>(['dashboard']);

      if (previousDashboard) {
        queryClient.setQueryData<DashboardData>(['dashboard'], {
          ...previousDashboard,
          watchlist: previousDashboard.watchlist.map((item) =>
            item.symbol === tickerToToggle.toUpperCase()
              ? { ...item, hasAlert: !item.hasAlert }
              : item
          ),
        });
      }

      return { previousDashboard };
    },
    onError: (err, tickerToToggle, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
