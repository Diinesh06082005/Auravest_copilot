import React, { useState, useRef } from 'react';
import { BarChart3, LineChart, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

type ChartTab = 'price' | 'revenue';
type TimeRange = '1M' | '3M' | '1Y';

interface PriceDataPoint {
  date: string;
  price: number;
}

interface RevenueDataPoint {
  quarter: string;
  currentYear: number;
  previousYear: number;
}

export function MainChart() {
  const [activeTab, setActiveTab] = useState<ChartTab>('price');
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Price datasets based on time range
  const priceDatasets: Record<TimeRange, PriceDataPoint[]> = {
    '1M': [
      { date: 'Jun 08', price: 122.5 },
      { date: 'Jun 11', price: 124.2 },
      { date: 'Jun 14', price: 121.8 },
      { date: 'Jun 17', price: 125.4 },
      { date: 'Jun 20', price: 123.9 },
      { date: 'Jun 23', price: 128.1 },
      { date: 'Jun 26', price: 129.5 },
      { date: 'Jun 29', price: 131.0 },
      { date: 'Jul 02', price: 130.2 },
      { date: 'Jul 06', price: 132.85 },
    ],
    '3M': [
      { date: 'Apr 06', price: 104.5 },
      { date: 'Apr 16', price: 112.2 },
      { date: 'Apr 26', price: 108.9 },
      { date: 'May 06', price: 118.4 },
      { date: 'May 16', price: 120.1 },
      { date: 'May 26', price: 125.8 },
      { date: 'Jun 06', price: 122.3 },
      { date: 'Jun 16', price: 128.0 },
      { date: 'Jun 26', price: 129.5 },
      { date: 'Jul 06', price: 132.85 },
    ],
    '1Y': [
      { date: 'Jul 25', price: 82.4 },
      { date: 'Sep 25', price: 88.9 },
      { date: 'Nov 25', price: 92.1 },
      { date: 'Jan 26', price: 108.5 },
      { date: 'Mar 26', price: 114.2 },
      { date: 'May 26', price: 125.8 },
      { date: 'Jul 06', price: 132.85 },
    ],
  };

  const revenueData: RevenueDataPoint[] = [
    { quarter: 'Q3 FY25', currentYear: 18.1, previousYear: 9.2 },
    { quarter: 'Q4 FY25', currentYear: 22.1, previousYear: 12.4 },
    { quarter: 'Q1 FY26', currentYear: 26.0, previousYear: 14.8 },
    { quarter: 'Q2 FY26', currentYear: 28.4, previousYear: 18.1 }, // Scheduled guidance
  ];

  const currentPriceData = priceDatasets[timeRange];

  // SVG dimensions for the area chart
  const width = 600;
  const height = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Min and Max values for plotting
  const prices = currentPriceData.map((d) => d.price);
  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;
  const priceRange = maxPrice - minPrice;

  // Convert data points to SVG coordinates
  const getSvgCoordinates = (index: number, price: number) => {
    const x = paddingLeft + (index / (currentPriceData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    return { x, y };
  };

  // Generate path string for Line
  const points = currentPriceData.map((d, i) => getSvgCoordinates(i, d.price));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Generate path string for Area fill
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Handle Mouse Hover tracking on Area Chart
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Scale coordinate back to design viewbox (600 width)
    const viewboxX = (mouseX / rect.width) * width;
    
    // Find nearest data point index
    let nearestIndex = 0;
    let minDistance = Infinity;

    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - viewboxX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = idx;
      }
    });

    const activePoint = points[nearestIndex];
    setHoveredPoint({
      index: nearestIndex,
      x: activePoint.x,
      y: activePoint.y,
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-black/20">
      {/* Header / Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 p-1 dark:bg-slate-950/40 self-start">
          <button
            onClick={() => setActiveTab('price')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'price'
                ? 'bg-white shadow-sm dark:bg-slate-850 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            <LineChart className="h-4 w-4" />
            Performance History
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'revenue'
                ? 'bg-white shadow-sm dark:bg-slate-850 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Revenue YoY
          </button>
        </div>

        {/* Time ranges (Only for performance price view) */}
        {activeTab === 'price' && (
          <div className="flex gap-1.5">
            {(['1M', '3M', '1Y'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white dark:bg-blue-600'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-800/60'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Charts Canvas */}
      <div className="relative mt-6 flex-1 flex items-center justify-center">
        {activeTab === 'price' ? (
          /* Area Chart */
          <div className="w-full relative">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="w-full overflow-visible select-none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                {/* Blue Glow Gradient */}
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines (4 divisions) */}
              {[0, 1, 2, 3].map((val) => {
                const y = paddingTop + (val / 3) * chartHeight;
                const gridPrice = maxPrice - (val / 3) * priceRange;
                return (
                  <g key={val}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                      className="dark:stroke-slate-800/60"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y}
                      dy="0.32em"
                      textAnchor="end"
                      className="text-[9px] font-semibold fill-slate-400 dark:fill-slate-550"
                    >
                      ${gridPrice.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Area Path */}
              <motion.path
                key={timeRange + '-area'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                d={areaPath}
                fill="url(#area-gradient)"
              />

              {/* Line Path */}
              <motion.path
                key={timeRange + '-line'}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                d={linePath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* X Axis Labels */}
              {currentPriceData.map((d, i) => {
                if (i % 2 === 0 || i === currentPriceData.length - 1) {
                  const coord = getSvgCoordinates(i, d.price);
                  return (
                    <text
                      key={i}
                      x={coord.x}
                      y={height - 8}
                      textAnchor="middle"
                      className="text-[9px] font-semibold fill-slate-400 dark:fill-slate-550"
                    >
                      {d.date}
                    </text>
                  );
                }
                return null;
              })}

              {/* Hover guide crosshair */}
              {hoveredPoint && (
                <g>
                  {/* Vertical dotted guide */}
                  <line
                    x1={hoveredPoint.x}
                    y1={paddingTop}
                    x2={hoveredPoint.x}
                    y2={paddingTop + chartHeight}
                    stroke="#2563EB"
                    strokeWidth="1.25"
                    strokeDasharray="3 3"
                    opacity={0.7}
                  />
                  {/* Point circle dot */}
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="5"
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="dark:stroke-slate-900"
                  />
                </g>
              )}
            </svg>

            {/* Float Tooltip Card */}
            {hoveredPoint && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${(hoveredPoint.y / height) * 100 - 15}%`,
                  transform: 'translate(-50%, -100%)',
                }}
                className="pointer-events-none z-10 rounded-xl border border-slate-200/80 bg-white/95 px-2.5 py-1.5 text-[10px] shadow-xl backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/95"
              >
                <p className="font-extrabold text-slate-850 dark:text-white">
                  ${currentPriceData[hoveredPoint.index].price.toFixed(2)}
                </p>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                  {currentPriceData[hoveredPoint.index].date}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Bar Chart */
          <div className="w-full flex flex-col justify-end h-[200px]">
            <div className="flex items-end justify-between gap-6 h-full px-4">
              {revenueData.map((d) => {
                const maxVal = 30; // Scale helper
                const curHeight = (d.currentYear / maxVal) * 100;
                const prevHeight = (d.previousYear / maxVal) * 100;

                return (
                  <div key={d.quarter} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex items-end gap-2 w-full justify-center h-[140px]">
                      {/* Previous Year Bar */}
                      <div className="relative group/bar flex flex-col items-center w-5 sm:w-8">
                        <div className="absolute -top-7 scale-0 opacity-0 group-hover/bar:scale-100 group-hover/bar:opacity-100 rounded-lg bg-slate-900 px-2 py-1 text-[9px] font-black text-slate-100 transition-all dark:bg-slate-850">
                          ${d.previousYear}B
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${prevHeight}%` }}
                          transition={{ duration: 0.5 }}
                          className="w-full rounded-t bg-slate-200 dark:bg-slate-800 group-hover/bar:brightness-95 dark:group-hover/bar:brightness-110"
                        />
                      </div>

                      {/* Current Year Bar */}
                      <div className="relative group/bar2 flex flex-col items-center w-5 sm:w-8">
                        <div className="absolute -top-7 scale-0 opacity-0 group-hover/bar2:scale-100 group-hover/bar2:opacity-100 rounded-lg bg-blue-600 px-2 py-1 text-[9px] font-black text-white transition-all">
                          ${d.currentYear}B
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${curHeight}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="w-full rounded-t bg-blue-600 group-hover/bar2:bg-blue-700"
                        />
                      </div>
                    </div>
                    {/* Quarter Label */}
                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">
                      {d.quarter}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 flex items-center justify-center gap-6 border-t border-slate-200/50 pt-3 dark:border-slate-850/50">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-blue-600" />
                <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400">Current FY (2026)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-slate-300 dark:bg-slate-800" />
                <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400">Previous FY (2025)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
