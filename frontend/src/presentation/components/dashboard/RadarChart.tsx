import React, { useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface RadarData {
  axis: string;
  assetValue: number;
  sectorValue: number;
}

export function RadarChart() {
  const [selectedPoint, setSelectedPoint] = useState<{ axis: string; asset: number; sector: number } | null>(null);
  const [activeDataset, setActiveDataset] = useState<'both' | 'asset' | 'sector'>('both');

  const data: RadarData[] = [
    { axis: 'Growth', assetValue: 95, sectorValue: 60 },
    { axis: 'Quality', assetValue: 90, sectorValue: 70 },
    { axis: 'Safety', assetValue: 65, sectorValue: 75 },
    { axis: 'Dividend', assetValue: 12, sectorValue: 35 },
    { axis: 'Value', assetValue: 25, sectorValue: 50 },
    { axis: 'Momentum', assetValue: 88, sectorValue: 55 },
  ];

  // Radar SVG constants
  const size = 320;
  const center = size / 2;
  const rMax = 100; // max radius

  // Convert polar coordinates to Cartesian
  const getCoordinates = (index: number, value: number) => {
    // 6 axes, spacing is 60 degrees (Math.PI / 3)
    // Rotate by -Math.PI / 2 to start at the top
    const angle = (index * Math.PI) / 3 - Math.PI / 2;
    const r = (value / 100) * rMax;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate radial grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];
  const gridPaths = gridLevels.map((level) => {
    const points = data.map((_, i) => {
      const { x, y } = getCoordinates(i, level);
      return `${x},${y}`;
    });
    return points.join(' ');
  });

  // Generate path coordinates for NVDA
  const assetPoints = data.map((d, i) => getCoordinates(i, d.assetValue));
  const assetPath = assetPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Generate path coordinates for Sector Average
  const sectorPoints = data.map((d, i) => getCoordinates(i, d.sectorValue));
  const sectorPath = sectorPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Label placements helper
  const getLabelPlacement = (index: number) => {
    const angle = (index * Math.PI) / 3 - Math.PI / 2;
    const labelDistance = rMax + 22;
    const x = center + labelDistance * Math.cos(angle);
    const y = center + labelDistance * Math.sin(angle);
    
    let textAnchor: 'inherit' | 'end' | 'middle' | 'start' = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    if (Math.cos(angle) < -0.1) textAnchor = 'end';

    let dy = '0.35em';
    if (Math.sin(angle) < -0.9) dy = '-0.2em';
    if (Math.sin(angle) > 0.9) dy = '0.8em';

    return { x, y, textAnchor, dy };
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-extrabold text-slate-900 dark:text-white">Factor Profile</h3>
        </div>

        {/* Dataset Toggles */}
        <div className="flex gap-1.5 rounded-lg bg-slate-50 p-1 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveDataset('both')}
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
              activeDataset === 'both' ? 'bg-white shadow-sm dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveDataset('asset')}
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
              activeDataset === 'asset' ? 'bg-white shadow-sm dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            NVDA
          </button>
          <button
            onClick={() => setActiveDataset('sector')}
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
              activeDataset === 'sector' ? 'bg-white shadow-sm dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            Sector
          </button>
        </div>
      </div>

      <div className="relative mt-4 flex flex-1 items-center justify-center">
        {/* SVG Drawing */}
        <svg width={size} height={size} className="overflow-visible select-none">
          {/* Radial Grid lines */}
          {gridPaths.map((points, index) => (
            <polygon
              key={index}
              points={points}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="0.75"
              strokeDasharray="2 3"
              opacity={0.35}
            />
          ))}

          {/* Core Axis Lines */}
          {data.map((_, i) => {
            const outer = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="#94A3B8"
                strokeWidth="1"
                opacity={0.35}
              />
            );
          })}

          {/* Web Labels */}
          {data.map((d, i) => {
            const placement = getLabelPlacement(i);
            return (
              <text
                key={i}
                x={placement.x}
                y={placement.y}
                textAnchor={placement.textAnchor}
                dy={placement.dy}
                className="text-[11px] font-extrabold fill-slate-500 dark:fill-slate-400"
              >
                {d.axis}
              </text>
            );
          })}

          {/* Sector Average Polygon (Background layer) */}
          {(activeDataset === 'both' || activeDataset === 'sector') && (
            <motion.polygon
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ duration: 0.5 }}
              points={sectorPath}
              fill="#EF4444"
              stroke="#EF4444"
              strokeWidth="1.5"
              className="origin-center"
            />
          )}

          {/* NVDA Focus Polygon (Foreground layer) */}
          {(activeDataset === 'both' || activeDataset === 'asset') && (
            <motion.polygon
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.25, scale: 1 }}
              transition={{ duration: 0.5 }}
              points={assetPath}
              fill="#2563EB"
              stroke="#2563EB"
              strokeWidth="2.5"
              className="origin-center"
            />
          )}

          {/* Polygon boundary lines with gradients */}
          {(activeDataset === 'both' || activeDataset === 'sector') && (
            <polygon
              points={sectorPath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Interactive Vertex Dots */}
          {data.map((d, i) => {
            const assetPoint = getCoordinates(i, d.assetValue);
            const sectorPoint = getCoordinates(i, d.sectorValue);

            return (
              <g key={i}>
                {/* NVDA dot */}
                {(activeDataset === 'both' || activeDataset === 'asset') && (
                  <circle
                    cx={assetPoint.x}
                    cy={assetPoint.y}
                    r="4.5"
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:r-[6.5px] dark:stroke-slate-900"
                    onMouseEnter={() => setSelectedPoint({ axis: d.axis, asset: d.assetValue, sector: d.sectorValue })}
                    onMouseLeave={() => setSelectedPoint(null)}
                  />
                )}
                
                {/* Sector dot */}
                {(activeDataset === 'both' || activeDataset === 'sector') && (
                  <circle
                    cx={sectorPoint.x}
                    cy={sectorPoint.y}
                    r="4.5"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:r-[6.5px] dark:stroke-slate-900"
                    onMouseEnter={() => setSelectedPoint({ axis: d.axis, asset: d.assetValue, sector: d.sectorValue })}
                    onMouseLeave={() => setSelectedPoint(null)}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {selectedPoint && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200/80 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95 min-w-[140px] text-center pointer-events-none">
            <p className="font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-1 mb-1.5">{selectedPoint.axis}</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 font-medium">NVDA:</span>
                <span className="text-blue-600 font-extrabold">{selectedPoint.asset} / 100</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 font-medium">Sector:</span>
                <span className="text-rose-500 font-extrabold">{selectedPoint.sector} / 100</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-6 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-600" />
          <span className="text-xs font-bold text-slate-650 dark:text-slate-350">NVDA (Asset)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          <span className="text-xs font-bold text-slate-650 dark:text-slate-350">Sector Median</span>
        </div>
      </div>
    </div>
  );
}
