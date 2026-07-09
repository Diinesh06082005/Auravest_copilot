import React from 'react';
import { TrendingUp, Award, Zap, ChevronRight, BarChart3, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function RecommendationCard() {
  const recommendation = {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    consensus: 'STRONG BUY',
    currentPrice: 132.85,
    targetPrice: 165.00,
    potentialUpside: '24.2%',
    confidenceScore: 94,
    lastUpdated: 'Today, 08:30 AM',
    catalysts: [
      {
        title: 'Blackwell GPU Supercycle',
        description: 'Next-gen Blackwell B200 shipments are ramping up with pre-orders booked out for 12 months.',
      },
      {
        title: 'Sovereign AI Demand Expansion',
        description: 'National governments (Japan, France, UAE) are establishing local computing clusters, driving non-cloud growth.',
      },
      {
        title: 'Margin Sustainability',
        description: 'Gross margin projected to hold above 75.5% despite high TSMC packaging and CoWoS node premiums.',
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col justify-between h-full rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-black/20"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Award className="h-3.5 w-3.5" />
              AI Focus Asset
            </span>
            <div className="mt-2.5 flex items-baseline gap-2">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {recommendation.symbol}
              </h3>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {recommendation.name}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              {recommendation.consensus}
            </span>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Updated {recommendation.lastUpdated}</p>
          </div>
        </div>

        {/* Pricing Metrics */}
        <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current</p>
            <p className="mt-1 text-lg font-bold text-slate-950 dark:text-slate-100">${recommendation.currentPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Target</p>
            <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">${recommendation.targetPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Upside</p>
            <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">+{recommendation.potentialUpside}</p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-350 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              AI Recommendation Confidence
            </span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">{recommendation.confidenceScore}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${recommendation.confidenceScore}%` }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
            />
          </div>
        </div>

        {/* Key Catalysts */}
        <div className="mt-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Key Catalysts</h4>
          <div className="space-y-3">
            {recommendation.catalysts.map((catalyst, index) => (
              <div key={index} className="flex gap-2.5">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-250">{catalyst.title}</h5>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-450 mt-0.5">{catalyst.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition-all hover:bg-blue-700 active:scale-[0.99] dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm shadow-blue-500/10">
        Generate Comprehensive AI Report
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
