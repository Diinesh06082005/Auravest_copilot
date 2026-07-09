import React, { useState } from 'react';
import { Search, Loader2, FileDown, AlertTriangle, Briefcase, Plus, BookOpen, LayoutDashboard } from 'lucide-react';
import { useResearchReportsQuery, downloadReportPdf } from '../../../business/hooks/useResearch';
import { useResearchStore } from '../../../business/store/research.store';
import { useNavigate } from 'react-router-dom';

export default function ResearchPage() {
  const [ticker, setTicker] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const { startResearch, loading, error: searchError } = useResearchStore();
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: reports = [], isLoading, isError } = useResearchReportsQuery();

  const handleCompile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    startResearch(ticker.trim().toUpperCase());
    setTicker('');
    navigate('/'); // Redirect to Dashboard single source of truth
  };

  const handleDownload = async (reportId: string, symbol: string) => {
    setDownloadingId(reportId);
    try {
      await downloadReportPdf(reportId, symbol);
    } catch (err) {
      alert('Failed to download PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getRecBadge = (rec: string) => {
    const r = rec.toLowerCase();
    if (r === 'buy') {
      return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-455 dark:border-emerald-900/40';
    } else if (r === 'sell') {
      return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-955/20 dark:text-rose-455 dark:border-rose-900/40';
    } else {
      return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-955/20 dark:text-amber-455 dark:border-amber-900/40';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">AI Research Copilot</h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Synthesize financial intelligence, run multi-agent LangGraph workflows, and export professional analyst reports.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75">
        <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Compile New Research Report
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Provide a ticker symbol. The LangGraph workflow will validate the ticker, resolve financial/market profiles, perform competitor SWOT mappings, and construct an investment thesis.
        </p>
        
        <form onSubmit={handleCompile} className="flex max-w-md gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g. AAPL, MSFT, TSLA..."
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-white"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>
          <button
            type="submit"
            disabled={loading || !ticker.trim()}
            className="flex items-center gap-2 rounded-xl bg-blue-650 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Compiling Graph...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Run Workflow
              </>
            )}
          </button>
        </form>

        {searchError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-455">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Reports Grid */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Research Dossiers</h3>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="mt-2 text-xs font-bold text-slate-500">Loading research reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-20 text-center dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-500">No reports generated yet. Enter a ticker above to run your first LangGraph research workflow.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {reports.map((report) => (
              <div
                key={report._id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75"
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-800 dark:bg-slate-850 dark:text-slate-200">
                      {report.ticker}
                    </span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase ${getRecBadge((report.analysis?.recommendation as any)?.rating || report.analysis?.recommendation || 'hold')}`}>
                      {(report.analysis?.recommendation as any)?.rating || report.analysis?.recommendation || 'HOLD'}
                    </span>
                  </div>

                  <h4 className="mt-4 font-black text-slate-900 dark:text-white leading-tight">
                    {report.title}
                  </h4>
                  
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-455 line-clamp-3">
                    {report.summary}
                  </p>

                  {/* SWOT Preview */}
                  {report.analysis?.swot && (
                    <div className="mt-4 grid grid-cols-4 gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800/50">
                      <div className="rounded bg-emerald-50/50 p-1.5 text-center dark:bg-emerald-950/10">
                        <p className="text-[9px] font-black text-emerald-600">S</p>
                        <p className="text-[7.5px] text-slate-400 font-semibold mt-0.5">{report.analysis.swot.strengths.length} items</p>
                      </div>
                      <div className="rounded bg-rose-50/50 p-1.5 text-center dark:bg-rose-950/10">
                        <p className="text-[9px] font-black text-rose-600">W</p>
                        <p className="text-[7.5px] text-slate-400 font-semibold mt-0.5">{report.analysis.swot.weaknesses.length} items</p>
                      </div>
                      <div className="rounded bg-blue-50/50 p-1.5 text-center dark:bg-blue-950/10">
                        <p className="text-[9px] font-black text-blue-600">O</p>
                        <p className="text-[7.5px] text-slate-400 font-semibold mt-0.5">{report.analysis.swot.opportunities.length} items</p>
                      </div>
                      <div className="rounded bg-amber-50/50 p-1.5 text-center dark:bg-amber-950/10">
                        <p className="text-[9px] font-black text-amber-600">T</p>
                        <p className="text-[7.5px] text-slate-400 font-semibold mt-0.5">{report.analysis.swot.threats.length} items</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/50">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Compiled: {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        useResearchStore.getState().openHistoricalReport(report.ticker);
                        navigate('/');
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600/10 border border-emerald-600/30 px-3 py-1.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-600/20 dark:text-emerald-450 dark:border-emerald-900/50 dark:hover:bg-emerald-950/40"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" /> Open
                    </button>
                    <button
                      onClick={() => handleDownload(report._id, report.ticker)}
                      disabled={downloadingId === report._id}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-655 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-850"
                    >
                      {downloadingId === report._id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <FileDown className="h-3.5 w-3.5 text-blue-650" /> PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
