import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { getIssues, type IssueListItem } from '../../services/reviewService';

interface CriticalQueueProps {
  onInvestigateClick: () => void;
}

export const CriticalQueue: React.FC<CriticalQueueProps> = ({ onInvestigateClick }) => {
  const [issues, setIssues] = useState<IssueListItem[]>([]);

  useEffect(() => {
    getIssues()
      .then((data) => setIssues(data.items))
      .catch((err) => console.error("Failed to load backend issues", err));
  }, []);

  const topIssues = useMemo(() => {
    const severityRank: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return issues
      .filter((issue) => issue.status !== "Fixed" && issue.status !== "Ignored")
      .sort((a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9))
      .slice(0, 3)
      .map((issue) => ({
        title: issue.title,
        category: issue.category,
        loc: `${issue.project_name || "Review " + issue.review_id}:L${issue.line_number}`,
      }));
  }, [issues]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-auto sm:h-48 text-left select-none relative w-full group">
      
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5 text-text-muted">
          <ShieldAlert className="w-3.5 h-3.5 text-critical shrink-0 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-critical">Critical Queue</span>
        </div>
        <span className="text-[8px] font-mono text-text-muted font-bold uppercase">Top 3 Threats</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2 pt-2">
        {topIssues.length > 0 ? topIssues.map((issue, idx) => (
          <div 
            key={idx} 
            onClick={onInvestigateClick}
            className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-surface border border-transparent hover:border-border transition-all duration-150 cursor-pointer"
          >
            <div className="truncate text-left pr-4">
              <span className="text-xs font-bold text-text-primary block truncate leading-tight hover:text-primary transition-colors">{issue.title}</span>
              <span className="text-[9px] font-mono text-text-muted">{issue.loc} • <span className="text-critical/80 font-semibold">{issue.category}</span></span>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); onInvestigateClick(); }}
              className="px-2 py-1 rounded border border-border bg-background hover:border-primary/30 text-text-secondary hover:text-white text-[8px] font-mono uppercase tracking-wide cursor-pointer flex items-center gap-0.5 shrink-0 transition-all"
            >
              <span>Fix</span>
              <ArrowRight className="w-2 h-2" />
            </button>
          </div>
        )) : (
          <div className="text-[10px] text-text-muted font-mono uppercase font-bold text-center py-6">
            No active backend issues
          </div>
        )}
      </div>

    </div>
  );
};

export default CriticalQueue;
