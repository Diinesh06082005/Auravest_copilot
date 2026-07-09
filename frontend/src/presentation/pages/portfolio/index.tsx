import React from 'react';

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Portfolio Tracker</h1>
        <p className="text-slate-500 dark:text-slate-400">Track and monitor your stock distributions, historical gains, and model suggestions.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-semibold text-slate-900 dark:text-white">Distribution Summary</h3>
          <div className="mt-4 h-48 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-sm text-slate-500">
            Pie/Donut allocation charts
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-semibold text-slate-900 dark:text-white">Holdings</h3>
          <div className="mt-4 h-48 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-sm text-slate-500">
            Stock assets datagrid
          </div>
        </div>
      </div>
    </div>
  );
}
