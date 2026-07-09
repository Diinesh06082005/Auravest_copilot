import React from 'react';
import { DollarSign, TrendingUp, ShieldCheck, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboardQuery } from '../../../business/hooks/useDashboard';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<any>;
  sparklineData: number[];
  color: string;
}

function Sparkline({ data, color, isPositive }: { data: number[]; color: string; isPositive: boolean }) {
  const width = 120;
  const height = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#10B981' : '#EF4444';
  const gradientId = `sparkline-grad-${color}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d={`M 0,${height} L ${points} L ${width},${height} Z`}
        fill={`url(#${gradientId})`}
      />
      <path
        d={`M ${points}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({ title, value, change, isPositive, icon: Icon, sparklineData, color }: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-black/20"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {value}
          </span>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {change}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-550">daily change</span>
          </div>
        </div>

        <div className="flex items-end self-end">
          <Sparkline data={sparklineData} color={color} isPositive={isPositive} />
        </div>
      </div>
    </motion.div>
  );
}

export function FinancialCards() {
  const { data } = useDashboardQuery();

  const metrics: MetricCardProps[] = [
    {
      title: 'Net Portfolio Value',
      value: data?.financialMetrics?.netLiquidValue
        ? `$${data.financialMetrics.netLiquidValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : '$341,850.50',
      change: data?.financialMetrics?.dayChangePercent
        ? `${data.financialMetrics.dayChangePercent}%`
        : '1.52%',
      isPositive: (data?.financialMetrics?.dayChangePercent ?? 0) >= 0,
      icon: DollarSign,
      sparklineData: [332000, 335000, 331000, 338000, 337000, 340000, data?.financialMetrics?.netLiquidValue ?? 341850.5],
      color: 'blue',
    },
    {
      title: 'Buying Power',
      value: data?.financialMetrics?.buyingPower
        ? `$${data.financialMetrics.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : '$58,200.00',
      change: '0.00%',
      isPositive: true,
      icon: Scale,
      sparklineData: [58200, 58200, 58200, 58200, 58200, 58200, data?.financialMetrics?.buyingPower ?? 58200],
      color: 'indigo',
    },
    {
      title: 'Day Capital Change',
      value: data?.financialMetrics?.dayChange
        ? `$${data.financialMetrics.dayChange.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : '$5,120.40',
      change: data?.financialMetrics?.dayChangePercent
        ? `${data.financialMetrics.dayChangePercent}%`
        : '1.52%',
      isPositive: (data?.financialMetrics?.dayChange ?? 0) >= 0,
      icon: TrendingUp,
      sparklineData: [4200, 3500, 4800, 4100, 5300, 4900, data?.financialMetrics?.dayChange ?? 5120.4],
      color: 'emerald',
    },
    {
      title: 'Active Alerts',
      value: data?.financialMetrics?.activeAlertsCount?.toString() ?? '4',
      change: 'Critical',
      isPositive: false,
      icon: ShieldCheck,
      sparklineData: [2, 3, 2, 4, 3, 4, data?.financialMetrics?.activeAlertsCount ?? 4],
      color: 'amber',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
