import React, { useState } from 'react';
import { Eye, Bell, BellOff, TrendingUp, TrendingDown, Trash2, Plus, Loader2, AlertCircle, MessageSquareCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboardQuery, useAddWatchlistTicker, useRemoveWatchlistTicker, useToggleWatchlistAlert } from '../../../business/hooks/useDashboard';

export function Watchlist() {
  const [newTicker, setNewTicker] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Queries and mutations
  const { data, isLoading, isError, error } = useDashboardQuery();
  const addMutation = useAddWatchlistTicker();
  const removeMutation = useRemoveWatchlistTicker();
  const toggleAlertMutation = useToggleWatchlistAlert();

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim()) return;

    try {
      await addMutation.mutateAsync(newTicker.trim());
      setNewTicker('');
      setIsAdding(false);
    } catch (err) {
      // Handled in mutation/react-query
    }
  };

  const handleRemoveTicker = (symbol: string) => {
    removeMutation.mutate(symbol);
  };

  const handleToggleAlert = (symbol: string) => {
    toggleAlertMutation.mutate(symbol);
  };

  const getSentimentBadge = (sentiment: 'Bullish' | 'Bearish' | 'Neutral') => {
    switch (sentiment) {
      case 'Bullish':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/20';
      case 'Bearish':
        return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/20';
      case 'Neutral':
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/50';
    }
  };

  const renderSparkline = (dataPoints: number[], isPositive: boolean) => {
    const width = 80;
    const height = 24;
    const max = Math.max(...dataPoints);
    const min = Math.min(...dataPoints);
    const range = max - min || 1;

    const points = dataPoints
      .map((val, index) => {
        const x = (index / (dataPoints.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#10B981' : '#EF4444';
    return (
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={`M ${points}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const items = data?.watchlist || [];

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-black/20">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-650 dark:text-blue-450" />
          <h3 className="font-extrabold text-slate-900 dark:text-white">Active Watchlist</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdding ? (
            <form onSubmit={handleAddTicker} className="flex items-center gap-2">
              <input
                type="text"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                placeholder="AAPL, TSLA..."
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                autoFocus
              />
              <button
                type="submit"
                disabled={addMutation.isPending}
                className="flex items-center justify-center rounded-lg bg-blue-600 p-1 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-450 dark:hover:text-blue-400"
            >
              <Plus className="h-3.5 w-3.5" /> Add Asset
            </button>
          )}
        </div>
      </div>

      {/* Query state loading/errors */}
      {isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Loading Watchlist from server...</p>
        </div>
      )}

      {isError && (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-8 w-8 text-rose-600" />
          <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Failed to load watchlist</p>
          <p className="text-xs text-slate-550 dark:text-slate-450 mt-1">{(error as Error)?.message || 'Unknown network error'}</p>
        </div>
      )}

      {/* Watchlist Table */}
      {!isLoading && !isError && (
        <div className="flex-1 overflow-x-auto mt-4">
          {items.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-semibold">
              No assets in your watchlist. Click "Add Asset" to start tracking.
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 pb-2">
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Asset</th>
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Price</th>
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">Trend (7d)</th>
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">Sentiment</th>
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/40">
                {items.map((item) => {
                  const isPositive = item.change >= 0;
                  return (
                    <tr key={item.symbol} className="group/row transition-all hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                      {/* Symbol & Name */}
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-850 dark:bg-slate-850 dark:text-slate-200">
                            {item.symbol}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <MessageSquareCode className="h-3 w-3 text-slate-400" />
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]" title={item.aiPulse}>
                                {item.aiPulse}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price & Change */}
                      <td className="py-3.5 px-2">
                        <p className="text-sm font-bold text-slate-950 dark:text-slate-100">${item.price.toFixed(2)}</p>
                        <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-605 dark:text-rose-450'}`}>
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {isPositive ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                        </span>
                      </td>

                      {/* Sparkline */}
                      <td className="py-3.5 px-2 text-center align-middle">
                        <div className="flex justify-center">
                          {renderSparkline(item.sparkline, isPositive)}
                        </div>
                      </td>

                      {/* Sentiment Badge */}
                      <td className="py-3.5 px-2 text-center align-middle">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase ${getSentimentBadge(item.sentiment)}`}>
                            {item.sentiment}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">{item.sentimentScore}% index</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleAlert(item.symbol)}
                            className={`rounded-lg p-1.5 transition-colors ${
                              item.hasAlert
                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800'
                            }`}
                            title={item.hasAlert ? 'Disable Alert' : 'Enable Alert'}
                          >
                            {item.hasAlert ? <Bell className="h-4 w-4 fill-amber-500" /> : <BellOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleRemoveTicker(item.symbol)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
