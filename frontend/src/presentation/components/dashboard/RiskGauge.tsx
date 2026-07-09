import React, { useState } from 'react';
import { ShieldAlert, Info, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function RiskGauge() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Risk value between 0 and 100
  const riskValue = 68; // High-medium risk
  const riskLabel = 'Moderate-High';

  const riskFactors = [
    { name: 'Market Volatility', score: 75, status: 'High', description: '30-day realized volatility of 34% due to AI growth premium.' },
    { name: 'Financial Leverage', score: 32, status: 'Low', description: 'Healthy cash reserve ($26B) vs long-term debt.' },
    { name: 'Regulatory exposure', score: 82, status: 'Extreme', description: 'Subject to multi-national antitrust audits in US & EU.' },
    { name: 'Liquidity risk', score: 18, status: 'Low', description: 'Massive average daily trading volume ($12B+) reduces slippage.' },
  ];

  // Map 0-100 score to degrees for semi-circle (-90 to +90 degrees)
  const rotationDegrees = (riskValue / 100) * 180 - 90;

  const riskZones = [
    { label: 'Low', range: '0-25', color: '#10B981', hoverColor: 'shadow-emerald-500/20' },
    { label: 'Medium', range: '26-50', color: '#F59E0B', hoverColor: 'shadow-amber-500/20' },
    { label: 'High', range: '51-75', color: '#EF4444', hoverColor: 'shadow-red-500/20' },
    { label: 'Extreme', range: '76-100', color: '#8B5CF6', hoverColor: 'shadow-violet-500/20' },
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-extrabold text-slate-900 dark:text-white">AI Risk Assessment</h3>
        </div>
        <div className="group relative">
          <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-500 cursor-pointer" />
          <div className="absolute right-0 top-6 z-25 w-48 scale-0 rounded-lg bg-slate-900 p-2 text-[10px] text-slate-200 transition-all group-hover:scale-100 dark:bg-slate-800">
            Computed by analyzing volatility, leverage ratios, compliance filing sentiment, and liquidity.
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center">
        {/* Semi-circular Gauge */}
        <div className="relative flex h-32 w-56 items-end justify-center overflow-hidden">
          {/* SVG Arc Path */}
          <svg className="absolute bottom-0 left-0 right-0 h-28 w-56 overflow-visible" viewBox="0 0 100 50">
            {/* Background Arc */}
            <path
              d="M 10,50 A 40,40 0 0,1 90,50"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="8"
              strokeLinecap="round"
              className="dark:stroke-slate-800"
            />
            {/* Colored Risk Segments */}
            {/* Low Range */}
            <path
              d="M 10,50 A 40,40 0 0,1 30,19.3"
              fill="none"
              stroke="#10B981"
              strokeWidth="8"
              className="cursor-pointer transition-all hover:stroke-[10px]"
              onMouseEnter={() => setHoveredZone('Low Risk Zone: 0-25')}
              onMouseLeave={() => setHoveredZone(null)}
            />
            {/* Medium Range */}
            <path
              d="M 30,19.3 A 40,40 0 0,1 50,10"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="8"
              className="cursor-pointer transition-all hover:stroke-[10px]"
              onMouseEnter={() => setHoveredZone('Medium Risk Zone: 26-50')}
              onMouseLeave={() => setHoveredZone(null)}
            />
            {/* High Range */}
            <path
              d="M 50,10 A 40,40 0 0,1 70,19.3"
              fill="none"
              stroke="#EF4444"
              strokeWidth="8"
              className="cursor-pointer transition-all hover:stroke-[10px]"
              onMouseEnter={() => setHoveredZone('High Risk Zone: 51-75')}
              onMouseLeave={() => setHoveredZone(null)}
            />
            {/* Extreme Range */}
            <path
              d="M 70,19.3 A 40,40 0 0,1 90,50"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="8"
              className="cursor-pointer transition-all hover:stroke-[10px]"
              onMouseEnter={() => setHoveredZone('Extreme Risk Zone: 76-100')}
              onMouseLeave={() => setHoveredZone(null)}
            />
          </svg>

          {/* Needle Pin */}
          <div className="absolute bottom-0 z-10 h-3 w-3 rounded-full bg-slate-800 dark:bg-slate-200" />
          
          {/* Animated Needle */}
          <motion.div
            initial={{ rotate: -90 }}
            animate={{ rotate: rotationDegrees }}
            transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.1 }}
            style={{ originX: '50%', originY: '100%' }}
            className="absolute bottom-0 z-10 h-24 w-1 bg-gradient-to-t from-slate-800 to-slate-900 rounded-t-full origin-bottom dark:from-slate-350 dark:to-white"
          />
        </div>

        {/* Scoring text */}
        <div className="mt-3 text-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {riskValue}
          </span>
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">/100</span>
          <p className="mt-0.5 text-xs font-bold text-red-500 dark:text-red-400">
            {hoveredZone || `${riskLabel} Risk`}
          </p>
        </div>
      </div>

      {/* Component Risk Indicators */}
      <div className="mt-6 flex-1 space-y-3.5">
        {riskFactors.map((factor) => {
          const barColor = 
            factor.score < 30 ? 'bg-emerald-500' :
            factor.score < 60 ? 'bg-amber-500' :
            factor.score < 80 ? 'bg-red-500' : 'bg-violet-500';

          return (
            <div key={factor.name} className="group relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{factor.name}</span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{factor.score}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.score}%` }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className={`h-full rounded-full ${barColor}`}
                />
              </div>

              {/* Tooltip detail panel on hover */}
              <div className="pointer-events-none absolute -top-8 left-0 z-20 w-full scale-0 opacity-0 rounded-lg bg-slate-900 px-2 py-1.5 text-[10px] text-slate-200 transition-all group-hover:scale-100 group-hover:opacity-100 dark:bg-slate-800 border border-slate-700/30">
                {factor.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
