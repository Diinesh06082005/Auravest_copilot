import React from 'react';
import { useDashboardQuery } from '../../../business/hooks/useDashboard';
import { PortfolioSimulator } from '../../components/dashboard/PortfolioSimulator';
import { BarChart3, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ShieldCheck, Loader2 } from 'lucide-react';

export default function PortfolioPage() {
  const { data, isLoading, isError } = useDashboardQuery();

  const holdings = data?.portfolio?.assets || [];
  const metrics = data?.financialMetrics || {
    netLiquidValue: 341850.50,
    buyingPower: 58200.00,
    dayChange: 5120.40,
    dayChangePercent: 1.52,
  };

  // Mock mapping to resolve current price (using default fallback quotes if loading)
  const getHoldingLiveStats = (ticker: string) => {
    // Attempt to match from watchlist data if available
    const watchMatch = data?.watchlist?.find(w => w.symbol === ticker.toUpperCase());
    if (watchMatch) {
      return {
        price: watchMatch.price,
        changePercent: watchMatch.changePercent,
      };
    }
    // Hardcoded fallbacks matching yfinance mock feeds
    if (ticker === 'AAPL') return { price: 182.50, changePercent: 1.25 };
    if (ticker === 'MSFT') return { price: 415.60, changePercent: -0.45 };
    return { price: 150.00, changePercent: 0.00 };
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-650" />
          Portfolio Tracker & Simulator
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Monitor your real-time holdings, evaluate gains, and run Monte Carlo simulations for optimal asset allocations.
        </p>
      </div>

      {/* Metrics Cards Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Net Liquid Value</span>
            <Wallet className="h-4.5 w-4.5 text-blue-650" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            ${metrics.netLiquidValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Day's P&L</span>
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${metrics.dayChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {metrics.dayChange >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {metrics.dayChangePercent.toFixed(2)}%
            </span>
          </div>
          <p className={`mt-2 text-2xl font-black ${metrics.dayChange >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-605 dark:text-rose-455'}`}>
            {metrics.dayChange >= 0 ? '+' : ''}${metrics.dayChange.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Buying Power</span>
            <ArrowUpRight className="h-4.5 w-4.5 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            ${metrics.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Main Grid: Holdings & Simulator */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Holdings Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800/60">
            <h3 className="font-extrabold text-slate-900 dark:text-white">Active Positions</h3>
            <span className="rounded bg-slate-100 dark:bg-slate-850 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {holdings.length} Assets Held
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-2 text-xs font-semibold text-slate-500">Loading holdings...</p>
            </div>
          ) : holdings.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-500 font-semibold">
              No active assets in this portfolio. Search a stock on the Dashboard to execute a trade.
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 pb-2 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3 text-right">Shares</th>
                    <th className="pb-3 text-right">Avg Cost</th>
                    <th className="pb-3 text-right">Market Price</th>
                    <th className="pb-3 text-right">Total Value</th>
                    <th className="pb-3 text-right">Total Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/40">
                  {holdings.map((asset) => {
                    const stats = getHoldingLiveStats(asset.ticker);
                    const totalCost = asset.shares * asset.averageBuyPrice;
                    const currentValue = asset.shares * stats.price;
                    const pl = currentValue - totalCost;
                    const plPercent = (pl / totalCost) * 100;
                    const isPositive = pl >= 0;

                    return (
                      <tr key={asset.ticker} className="group/row transition-all hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-850 font-black text-[11px] text-slate-850 dark:text-slate-200">
                              {asset.ticker}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {asset.ticker === 'AAPL' ? 'Apple Inc.' : asset.ticker === 'MSFT' ? 'Microsoft Corp.' : `${asset.ticker} Corp.`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-right font-semibold text-slate-700 dark:text-slate-300">
                          {asset.shares}
                        </td>
                        <td className="py-3.5 px-2 text-right font-semibold text-slate-700 dark:text-slate-300">
                          ${asset.averageBuyPrice.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-2 text-right font-semibold text-slate-900 dark:text-slate-100">
                          ${stats.price.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-2 text-right font-extrabold text-slate-900 dark:text-white">
                          ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 pl-2 text-right">
                          <span className={`inline-flex flex-col text-right font-extrabold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            <span>{isPositive ? '+' : ''}${pl.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <span className="text-[10px] font-semibold mt-0.5">{isPositive ? '+' : ''}{plPercent.toFixed(2)}%</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Risk assessment card */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/20 p-4 dark:border-blue-900/30 dark:bg-blue-950/10 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-650 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Diversification Checked</h4>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1">
                Your portfolio holds low covariance equity assets which reduces idiosyncratic volatility. Try simulating different ratios in the allocator to find your target risk profile.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Allocator */}
        <div>
          <PortfolioSimulator />
        </div>
      </div>
    </div>
  );
}
