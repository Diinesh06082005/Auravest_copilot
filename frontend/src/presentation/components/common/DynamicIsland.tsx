import React, { useEffect, useState } from 'react';
import { useResearchStore } from '../../../business/store/research.store';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldAlert, Loader2, Sparkles } from 'lucide-react';

const getProgressPercent = (node: string): number => {
  switch (node) {
    case 'start':
    case 'validateCompany':
    case 'companyProfile':
      return 12;
    case 'financialAnalysis':
      return 25;
    case 'stockAnalysis':
      return 38;
    case 'newsAnalysis':
      return 50;
    case 'competitorAnalysis':
    case 'validation':
      return 62;
    case 'riskAnalysis':
    case 'swotAnalysis':
      return 75;
    case 'investmentThesis':
    case 'investmentScoring':
      return 88;
    case 'generateRecommendation':
    case 'reportGeneration':
      return 95;
    case 'complete':
      return 100;
    default:
      return 0;
  }
};

export function DynamicIsland() {
  const { workflowStatus, currentCompany, progressMessage, progressNode } = useResearchStore();
  const [displayStatus, setDisplayStatus] = useState<'idle' | 'searching' | 'completed' | 'failed'>('idle');

  useEffect(() => {
    setDisplayStatus(workflowStatus);
    
    // Revert back to idle status after 6 seconds of completion or failure display
    if (workflowStatus === 'completed' || workflowStatus === 'failed') {
      const timer = setTimeout(() => {
        setDisplayStatus('idle');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [workflowStatus, currentCompany]);

  let text = "AI Systems Operational";
  let icon = <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />;
  let glowColor = "shadow-[0_0_15px_rgba(59,130,246,0.4)] border-blue-500/30";
  
  if (displayStatus === 'searching') {
    text = `Researching ${currentCompany || 'Asset'}`;
    icon = <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />;
    glowColor = "shadow-[0_0_20px_rgba(37,99,235,0.7)] border-blue-500/60";
  } else if (displayStatus === 'completed') {
    text = `Research Succeeded: Compiled ${currentCompany || 'Asset'}!`;
    icon = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    glowColor = "shadow-[0_0_20px_rgba(16,185,129,0.7)] border-emerald-500/60";
  } else if (displayStatus === 'failed') {
    text = `Research Failed: Unable to compile ${currentCompany || 'Asset'}`;
    icon = <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />;
    glowColor = "shadow-[0_0_20px_rgba(239,68,68,0.7)] border-rose-500/60";
  }

  const percent = getProgressPercent(progressNode || 'start');

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-3 z-50 pointer-events-none hidden md:block">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className={`flex flex-col gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white bg-[#0B0F19]/95 backdrop-blur-md border transition-all duration-300 pointer-events-auto ${glowColor}`}
        style={{ minWidth: displayStatus === 'searching' ? '280px' : 'auto' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={displayStatus + '-' + text}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between gap-3 w-full"
          >
            <div className="flex items-center gap-2 whitespace-nowrap">
              {icon}
              <span>{text}</span>
            </div>
            {displayStatus === 'searching' && (
              <span className="text-[9.5px] bg-blue-500/20 text-blue-450 px-1.5 py-0.5 rounded-md border border-blue-500/35">
                {percent}%
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Loading Progress Bar */}
        {displayStatus === 'searching' && (
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5 relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
