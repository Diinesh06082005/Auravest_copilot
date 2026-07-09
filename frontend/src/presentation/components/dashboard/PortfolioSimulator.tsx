import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface AssetClass {
  id: string;
  name: string;
  weight: number;
  expectedReturn: number;
  volatility: number;
  color: string;
}

export function PortfolioSimulator() {
  const [assets, setAssets] = useState<AssetClass[]>([
    { id: 'stocks', name: 'Global Equities', weight: 50, expectedReturn: 0.12, volatility: 0.16, color: 'bg-blue-600' },
    { id: 'bonds', name: 'Fixed Income', weight: 30, expectedReturn: 0.05, volatility: 0.06, color: 'bg-indigo-500' },
    { id: 'crypto', name: 'Digital Assets', weight: 5, expectedReturn: 0.35, volatility: 0.65, color: 'bg-purple-600' },
    { id: 'commodities', name: 'Commodities', weight: 10, expectedReturn: 0.08, volatility: 0.12, color: 'bg-amber-500' },
    { id: 'cash', name: 'Cash / Yield', weight: 5, expectedReturn: 0.04, volatility: 0.01, color: 'bg-slate-400' },
  ]);

  const [metrics, setMetrics] = useState({
    simulatedReturn: 0,
    simulatedVolatility: 0,
    sharpeRatio: 0,
  });

  const RISK_FREE_RATE = 0.04; // 4% risk free rate

  // Calculate metrics whenever weights change
  useEffect(() => {
    // Expected Return = Weighted sum of returns
    let expectedReturnSum = 0;
    // Volatility = Weighted sum of volatilities minus a diversification bonus
    let volatilitySum = 0;
    let nonZeroAssets = 0;

    assets.forEach((asset) => {
      const weightFraction = asset.weight / 100;
      expectedReturnSum += weightFraction * asset.expectedReturn;
      volatilitySum += weightFraction * asset.volatility;
      if (asset.weight > 0) {
        nonZeroAssets += 1;
      }
    });

    // Diversification bonus reduces overall volatility
    const diversificationBonus = nonZeroAssets > 1 ? 0.02 * (nonZeroAssets - 1) : 0;
    const finalVolatility = Math.max(0.02, volatilitySum - diversificationBonus);

    // Sharpe Ratio = (Return - RFR) / Volatility
    const sharpe = (expectedReturnSum - RISK_FREE_RATE) / finalVolatility;

    setMetrics({
      simulatedReturn: expectedReturnSum * 100,
      simulatedVolatility: finalVolatility * 100,
      sharpeRatio: sharpe,
    });
  }, [assets]);

  // Dynamically balance the other sliders so total is always 100%
  const handleWeightChange = (id: string, newWeight: number) => {
    const targetAssetIndex = assets.findIndex((a) => a.id === id);
    if (targetAssetIndex === -1) return;

    const oldWeight = assets[targetAssetIndex].weight;
    const delta = newWeight - oldWeight;

    // Set target asset weight
    const updatedAssets = [...assets];
    updatedAssets[targetAssetIndex].weight = newWeight;

    // Remaining items to adjust
    const otherAssetsIndices = assets
      .map((_, i) => i)
      .filter((i) => i !== targetAssetIndex);

    // Sum of other weights
    const sumOtherWeights = otherAssetsIndices.reduce(
      (sum, idx) => sum + assets[idx].weight,
      0
    );

    if (sumOtherWeights > 0 && delta !== 0) {
      // Distribute delta proportionally to other assets
      let weightDistributed = 0;

      otherAssetsIndices.forEach((idx, i) => {
        const proportion = assets[idx].weight / sumOtherWeights;
        // Calculate raw new weight
        let adjusted = assets[idx].weight - delta * proportion;
        // Clamp between 0 and 100
        adjusted = Math.max(0, Math.min(100, adjusted));
        
        updatedAssets[idx].weight = Math.round(adjusted);
        weightDistributed += updatedAssets[idx].weight;
      });

      // Adjust target to handle rounding errors
      const currentTotal =
        weightDistributed + updatedAssets[targetAssetIndex].weight;
      const roundingError = 100 - currentTotal;
      
      if (roundingError !== 0) {
        // Adjust the first other asset that has available capacity
        const adjustmentIndex = otherAssetsIndices.find(
          (idx) =>
            updatedAssets[idx].weight + roundingError >= 0 &&
            updatedAssets[idx].weight + roundingError <= 100
        );
        if (adjustmentIndex !== undefined) {
          updatedAssets[adjustmentIndex].weight += roundingError;
        }
      }
    } else if (sumOtherWeights === 0 && delta !== 0) {
      // If others were all zero, split remaining equally
      const remainingWeight = 100 - newWeight;
      const count = otherAssetsIndices.length;
      const share = Math.floor(remainingWeight / count);
      let remainder = remainingWeight % count;

      otherAssetsIndices.forEach((idx) => {
        updatedAssets[idx].weight = share + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
      });
    }

    setAssets(updatedAssets);
  };

  const getSharpeRating = (sharpe: number) => {
    if (sharpe >= 1.5) return { text: 'Excellent', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' };
    if (sharpe >= 1.0) return { text: 'Good', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' };
    if (sharpe >= 0.5) return { text: 'Adequate', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' };
    return { text: 'Sub-Optimal', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' };
  };

  const sharpeRating = getSharpeRating(metrics.sharpeRatio);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-extrabold text-slate-900 dark:text-white">Portfolio Allocator</h3>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          Dynamic Auto-Balance
        </span>
      </div>

      {/* Simulator Metrics */}
      <div className="mt-5 grid grid-cols-3 gap-3.5 text-center">
        <div className="rounded-xl bg-slate-50/70 p-3.5 dark:bg-slate-950/40">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Exp. Return</p>
          <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
            {metrics.simulatedReturn.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl bg-slate-50/70 p-3.5 dark:bg-slate-950/40">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Volatility</p>
          <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
            {metrics.simulatedVolatility.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl bg-slate-50/70 p-3.5 dark:bg-slate-950/40">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sharpe Ratio</p>
          <div className="mt-1.5 flex flex-col items-center justify-center">
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {metrics.sharpeRatio.toFixed(2)}
            </span>
            <span className={`mt-1 rounded px-1.5 py-0.2 text-[9px] font-black uppercase ${sharpeRating.color}`}>
              {sharpeRating.text}
            </span>
          </div>
        </div>
      </div>

      {/* Stacked Allocation Bar */}
      <div className="mt-6">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              style={{ width: `${asset.weight}%` }}
              className={`h-full ${asset.color} transition-all duration-300`}
              title={`${asset.name}: ${asset.weight}%`}
            />
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2 justify-center">
          {assets.map((asset) => (
            <div key={asset.id} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${asset.color}`} />
              <span className="text-[10px] font-semibold text-slate-550 dark:text-slate-400">
                {asset.name} ({asset.weight}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sliders List */}
      <div className="mt-6 flex-1 space-y-4">
        {assets.map((asset) => (
          <div key={asset.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{asset.name}</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{asset.weight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={asset.weight}
              onChange={(e) => handleWeightChange(asset.id, parseInt(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-800 accent-blue-600 dark:accent-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
