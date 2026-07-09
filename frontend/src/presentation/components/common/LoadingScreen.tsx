import React from 'react';

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
        <p className="animate-pulse text-sm font-semibold text-slate-600 dark:text-slate-400">
          Loading Investment Copilot...
        </p>
      </div>
    </div>
  );
}
