import React, { useState } from 'react';
import { useResearchReportsQuery, downloadReportPdf } from '../../../business/hooks/useResearch';
import { Download, Search, FileDown, TableProperties, Calendar, AlertCircle } from 'lucide-react';

export default function ExportPage() {
  const { data: reports = [], isLoading, isError } = useResearchReportsQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const filteredReports = reports.filter(r => 
    r.ticker.toLowerCase().includes(filterText.toLowerCase()) ||
    r.title.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleDownloadPdf = async (reportId: string, ticker: string) => {
    setDownloadingId(reportId);
    try {
      await downloadReportPdf(reportId, ticker);
    } catch (err) {
      alert('Failed to download PDF report.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportCsv = (report: any) => {
    const swot = report.analysis?.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
    const thesis = report.analysis?.investmentThesis || '';
    
    // Construct structured rows for the CSV spreadsheet
    const rows = [
      ['AuraVest Research Copilot - Stock Report Export'],
      ['Ticker', report.ticker],
      ['Company Title', report.title],
      ['Date Compiled', new Date(report.createdAt).toLocaleString()],
      ['Sentiment Consensus', report.sentiment.toUpperCase()],
      ['Recommendation Rating', report.analysis?.recommendation?.rating || report.analysis?.recommendation || 'HOLD'],
      ['Summary', report.summary],
      [''],
      ['SWOT ANALYSIS MAPPINGS'],
      ['Strengths', swot.strengths.join('; ')],
      ['Weaknesses', swot.weaknesses.join('; ')],
      ['Opportunities', swot.opportunities.join('; ')],
      ['Threats', swot.threats.join('; ')],
      [''],
      ['INVESTMENT THESIS STATEMENT'],
      [thesis.replace(/"/g, '""')]
    ];
    
    // Convert to CSV formatting with correct encapsulation and encoding
    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${report.ticker}_Research_Data_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="h-8 w-8 text-blue-650" />
          Export Reports & Spreadsheets
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Generate print-ready PDFs of investment theses or download structured CSV datasets for Excel and analytical tools.
        </p>
      </div>

      {/* Controls & Search */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search report archives..."
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
            <p className="mt-2 text-xs font-semibold">Loading archives...</p>
          </div>
        ) : isError ? (
          <p className="text-center py-20 text-sm font-semibold text-rose-500">Failed to load reports list.</p>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 text-sm text-slate-500 font-semibold">
            {filterText ? 'No report archives match your filter.' : 'No dossiers found. Run a research run to generate reports.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 pb-2 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Ticker</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Compiled Date</th>
                  <th className="pb-3">Consensus</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/40">
                {filteredReports.map((report) => (
                  <tr key={report._id} className="group/row transition-all hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                    <td className="py-3.5 pr-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-850 font-black text-[11px] text-slate-850 dark:text-slate-200">
                        {report.ticker}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-white">
                      {report.title}
                    </td>
                    <td className="py-3.5 px-2 text-slate-550 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-extrabold uppercase text-slate-700 dark:text-slate-350">
                      {report.sentiment}
                    </td>
                    <td className="py-3.5 pl-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadPdf(report._id, report.ticker)}
                          disabled={downloadingId === report._id}
                          className="flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-3 py-1.5 text-xs font-bold transition-all hover:bg-blue-105"
                        >
                          <FileDown className="h-3.5 w-3.5" /> PDF
                        </button>
                        <button
                          onClick={() => handleExportCsv(report)}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 text-xs font-bold transition-all hover:bg-emerald-105"
                        >
                          <TableProperties className="h-3.5 w-3.5" /> CSV (Excel)
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
