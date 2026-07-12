import React, { useState } from 'react';
import { useResearchReportsQuery } from '../../../business/hooks/useResearch';
import { useResearchStore } from '../../../business/store/research.store';
import { useNavigate } from 'react-router-dom';
import { History, Search, ArrowUpRight, Play, CheckCircle2, Calendar, FileText } from 'lucide-react';

export default function HistoryPage() {
  const { data: reports = [], isLoading, isError } = useResearchReportsQuery();
  const { startResearch } = useResearchStore();
  const navigate = useNavigate();
  
  const [filterText, setFilterText] = useState('');

  const filteredReports = reports.filter(r => 
    r.ticker.toLowerCase().includes(filterText.toLowerCase()) ||
    r.title.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleOpenReport = (ticker: string) => {
    useResearchStore.getState().openHistoricalReport(ticker);
    navigate('/');
  };

  const handleReRun = (ticker: string) => {
    startResearch(ticker);
    navigate('/');
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'bearish':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <History className="h-8 w-8 text-blue-650" />
          Search & Research History
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Review previously executed LangGraph analysis tasks, explore cached profiles, and reload historical reports.
        </p>
      </div>

      {/* Controls & Search */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter history by ticker or company name..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-white"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Main List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="h-8 w-8 animate-spin border-4 border-blue-600 border-t-transparent rounded-full" />
            <p className="mt-2 text-xs font-semibold">Loading search history...</p>
          </div>
        ) : isError ? (
          <p className="text-center py-20 text-sm font-semibold text-rose-500">Failed to load search history.</p>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 text-sm text-slate-500 font-semibold">
            {filterText ? 'No search results match your filter.' : 'Your search history is empty. Start by researching a company.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredReports.map((report) => (
              <div key={report._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-xs font-black text-slate-800 dark:text-slate-200">
                    {report.ticker}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-450 transition-colors">
                      {report.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(report.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-450">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Workflow Succeeded
                      </span>
                      <span className={`px-2 py-0.2 rounded border text-[9.5px] uppercase font-black ${getSentimentColor(report.sentiment)}`}>
                        {report.sentiment}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReport(report.ticker)}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-3 py-1.5 text-xs font-bold transition-all hover:bg-blue-100 dark:hover:bg-blue-900/60"
                  >
                    Open <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleReRun(report.ticker)}
                    className="flex items-center gap-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    Re-run <Play className="h-3.5 w-3.5 fill-slate-700 dark:fill-slate-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
