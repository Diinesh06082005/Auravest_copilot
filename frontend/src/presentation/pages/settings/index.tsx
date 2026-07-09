import React from 'react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Configure OAuth accounts, select LLM architectures, and fine-tune system preferences.</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-white">Integration Settings</h3>
        <p className="mt-2 text-sm text-slate-550 dark:text-slate-400">Connect Google accounts and setup custom API credentials securely.</p>
      </div>
    </div>
  );
}
