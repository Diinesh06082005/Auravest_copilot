import React, { useState } from 'react';
import { Calendar, Filter, ChevronDown, ChevronUp, Bell, CheckCircle2, AlertTriangle, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TimelineCategory = 'All' | 'Earnings' | 'Regulatory' | 'Macro' | 'Product';

interface TimelineEvent {
  id: string;
  date: string;
  category: Exclude<TimelineCategory, 'All'>;
  title: string;
  description: string;
  status: 'Completed' | 'Pending' | 'In Progress';
  impact: 'High' | 'Medium' | 'Low';
  details: string;
}

export function ResearchTimeline() {
  const [selectedCategory, setSelectedCategory] = useState<TimelineCategory>('All');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const events: TimelineEvent[] = [
    {
      id: 'event-1',
      date: 'July 15, 2026',
      category: 'Earnings',
      title: 'Q2 2026 Financial Earnings Release',
      description: 'NVIDIA scheduled to report quarterly earnings after market close. consensus expects EPS of $0.64.',
      status: 'Pending',
      impact: 'High',
      details: 'Wall street expects revenue of $28.4B. Main metrics to watch are data center revenue growth margins (cons. 75.2%) and guidance on Blackwell chip shipments. Whisper numbers indicate potential beat in networking segments.',
    },
    {
      id: 'event-2',
      date: 'July 04, 2026',
      category: 'Macro',
      title: 'Federal Reserve Interest Rate Decision',
      description: 'FOMC announced rate hold at 5.25%-5.50% with hawkish press conference indicating higher for longer.',
      status: 'Completed',
      impact: 'High',
      details: 'Chair Powell noted that while inflation has eased, it remains above the 2% target. Dot plot shifts towards single rate cut in Q4 2026, slightly negative for tech valuations but supportive of treasury yields.',
    },
    {
      id: 'event-3',
      date: 'June 28, 2026',
      category: 'Regulatory',
      title: 'EU AI Act Compliance Audit',
      description: 'European Commission released preliminary directive on foundational model audits under the new AI safety framework.',
      status: 'Completed',
      impact: 'Medium',
      details: 'Audits focus on transparency of model training data, carbon footprint, and systemic risk mitigation. Major US hyperscalers have 6 months to register. Compliance costs estimated to rise by 12% YoY.',
    },
    {
      id: 'event-4',
      date: 'June 18, 2026',
      category: 'Product',
      title: 'Enterprise AI Hub v4.2 Deployment',
      description: 'Rollout of customized copilot workflows to select enterprise partners (health & finance sectors).',
      status: 'Completed',
      impact: 'Medium',
      details: 'Version 4.2 offers zero-knowledge client databases allowing secure fine-tuning on proprietary financial logs without data leakage. Net promoter score (NPS) from closed beta registered at 74.',
    },
    {
      id: 'event-5',
      date: 'July 22, 2026',
      category: 'Regulatory',
      title: 'DoJ Antitrust Investigation Hearing',
      description: 'Congressional hearing scheduled to review cloud pricing and chips allocation bundling contracts.',
      status: 'In Progress',
      impact: 'High',
      details: 'Probes will examine whether exclusivity discounts with major cloud service providers stifle competition in GPU rental markets. Expected to introduce temporary market volatility.',
    },
  ];

  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />;
      case 'In Progress':
        return <PlayCircle className="h-4.5 w-4.5 text-blue-500 animate-pulse" />;
      case 'Pending':
        return <Bell className="h-4.5 w-4.5 text-amber-500" />;
    }
  };

  const getImpactColor = (impact: TimelineEvent['impact']) => {
    switch (impact) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Low':
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-350 dark:border-slate-700';
    }
  };

  const getCategoryColor = (cat: TimelineEvent['category']) => {
    switch (cat) {
      case 'Earnings': return 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400';
      case 'Regulatory': return 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400';
      case 'Macro': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400';
      case 'Product': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400';
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-black/20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-extrabold text-slate-900 dark:text-white">Research & Macro Timeline</h3>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Earnings', 'Macro', 'Regulatory', 'Product'] as TimelineCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="relative mt-6 flex-1 pl-4 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800/85">
        <div className="space-y-6">
          {filteredEvents.map((event) => {
            const isExpanded = expandedEvent === event.id;
            return (
              <div key={event.id} className="relative pl-6">
                {/* Timeline Dot */}
                <div className="absolute -left-[14.5px] top-1 flex h-[28px] w-[28px] items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-850 dark:bg-slate-900">
                  {getStatusIcon(event.status)}
                </div>

                {/* Event Card */}
                <div className="rounded-xl border border-slate-200/65 bg-slate-50/40 p-4 transition-all hover:bg-slate-50/80 dark:border-slate-800/50 dark:bg-slate-950/20 dark:hover:bg-slate-950/40">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{event.date}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getImpactColor(event.impact)}`}>
                        {event.impact} Impact
                      </span>
                    </div>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{event.description}</p>

                  {/* Expandable Technical Details */}
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-450 dark:hover:text-blue-400"
                    >
                      {isExpanded ? (
                        <>
                          Hide Technical Notes <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          Show Technical Notes <ChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2.5 rounded-lg bg-white p-3 text-xs text-slate-600 dark:bg-slate-900/60 dark:text-slate-400 border border-slate-100 dark:border-slate-800/40 leading-relaxed">
                            {event.details}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
