import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, AlertOctagon } from 'lucide-react';
import { getIssues, type IssueListItem } from '../../services/reviewService';

export const CriticalIssuesPanel: React.FC = () => {
  const [issues, setIssues] = useState<IssueListItem[]>([]);

  useEffect(() => {
    getIssues()
      .then((data) => setIssues(data.items))
      .catch((err) => console.error("Failed to load critical issues", err));
  }, []);

  const criticalIssues = useMemo(() => (
    issues
      .filter((issue) => issue.severity === "Critical" && issue.status !== "Fixed" && issue.status !== "Ignored")
      .slice(0, 3)
      .map((issue) => ({
        title: issue.title,
        file: `${issue.project_name || "Review " + issue.review_id} : L${issue.line_number}`,
        snippet: issue.fixed_code || "No fixed code snippet returned by backend.",
        desc: issue.description,
        remediation: issue.suggested_fix || "No remediation text returned by backend."
      }))
  ), [issues]);

  return (
    <div className="bg-[#121215]/80 border border-[#1A1A1E] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-primary/20 shadow-lg flex flex-col justify-between w-full inner-glow-card select-none text-left">
      
      <div className="flex items-center justify-between border-b border-[#1A1A1E]/50 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Critical Threats Isolated</h3>
            <p className="text-[10px] text-[#A1A1AA]/60 mt-0.5">High-priority security vulnerabilities requiring immediate patching.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {criticalIssues.length > 0 ? criticalIssues.map((issue, idx) => (
          <div
            key={idx}
            className="border border-[#1A1A1E] bg-[#0C0C0E]/30 hover:border-red-500/30 rounded-xl p-4 transition-all duration-300 shadow-md relative group"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[7px] font-mono text-red-400 font-bold uppercase tracking-wider">Critical</span>
            </div>

            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white leading-normal pr-16 group-hover:text-red-400 transition-colors">{issue.title}</h4>
              <div className="font-mono text-[9px] text-[#A1A1AA]/50">{issue.file}</div>
            </div>

            <p className="text-[10px] text-[#A1A1AA] mt-2 leading-relaxed font-medium">
              {issue.desc}
            </p>

            <div className="bg-[#070708] border border-[#1A1A1E] rounded-lg p-2.5 font-mono text-[9px] text-red-300/80 leading-normal mt-3 border-l-2 border-l-red-500/50 overflow-x-auto select-text">
              {issue.snippet}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3.5 pt-3 border-t border-[#1A1A1E]/50">
              <span className="text-[9px] font-mono text-[#A1A1AA]/40 max-w-[280px]">Remedy: {issue.remediation}</span>
              <button className="px-3 py-1.5 rounded-xl bg-red-950/10 border border-red-500/25 hover:bg-red-500/10 hover:border-red-500 text-red-400 transition-all text-[9px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0">
                <Sparkles className="w-3 h-3 text-red-400" />
                <span>Fix Inline</span>
              </button>
            </div>

          </div>
        )) : (
          <div className="py-8 text-center text-[10px] font-mono uppercase font-bold text-text-muted">
            No critical backend issues
          </div>
        )}
      </div>

    </div>
  );
};
