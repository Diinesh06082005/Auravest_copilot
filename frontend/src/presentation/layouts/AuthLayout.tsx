import React from 'react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/30">
            Æ
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            EquiShare Copilot
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            AI-Driven Investment Research
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
