import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { getIssues, type IssueListItem } from '../../services/reviewService';

export const SeverityBreakdown: React.FC = () => {
  const [issues, setIssues] = useState<IssueListItem[]>([]);

  useEffect(() => {
    getIssues()
      .then((data) => setIssues(data.items))
      .catch((err) => console.error("Failed to load severity data", err));
  }, []);

  const breakdownData = useMemo(() => {
    const total = Math.max(issues.length, 1);
    const count = (severity: string) => issues.filter((issue) => issue.severity === severity).length;
    return [
      { label: "Critical", count: count("Critical"), color: "bg-red-500", textClass: "text-red-400", borderClass: "border-red-500/20", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
      { label: "High", count: count("High"), color: "bg-orange-500", textClass: "text-orange-400", borderClass: "border-orange-500/20", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
      { label: "Medium", count: count("Medium"), color: "bg-yellow-500", textClass: "text-yellow-400", borderClass: "border-yellow-500/20", icon: <AlertCircle className="w-3.5 h-3.5" /> },
      { label: "Low", count: count("Low"), color: "bg-blue-500", textClass: "text-blue-400", borderClass: "border-blue-500/20", icon: <Info className="w-3.5 h-3.5" /> }
    ].map((item) => ({ ...item, pct: issues.length ? Math.round((item.count / total) * 100) : 0 }));
  }, [issues]);

  return (
    <div className="bg-[#121215]/80 border border-[#1A1A1E] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-primary/20 shadow-lg flex flex-col justify-between h-[280px] inner-glow-card select-none text-left">
      
      <div className="flex items-center justify-between border-b border-[#1A1A1E]/50 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/5 border border-primary/20 text-primary">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Severity Allocation</h3>
            <p className="text-[10px] text-[#A1A1AA]/60 mt-0.5">Vulnerability categories and distribution counts.</p>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4 flex-1 flex flex-col justify-center">
        <div className="h-1.5 w-full bg-[#0C0C0E] rounded-full overflow-hidden flex border border-[#1A1A1E]">
          {breakdownData.map((item) => (
            <div
              key={item.label}
              className={`${item.color} h-full first:rounded-l-full last:rounded-r-full transition-all duration-500`}
              style={{ width: `${item.pct}%` }}
              title={`${item.label}: ${item.count} items (${item.pct}%)`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {breakdownData.map((item) => (
            <div
              key={item.label}
              className={`flex items-center justify-between bg-[#0C0C0E]/40 border ${item.borderClass} rounded-xl px-3 py-2 inner-glow-card hover:bg-[#0C0C0E]/75 transition-colors duration-200`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-lg bg-[#070708] ${item.textClass} border border-[#1A1A1E]`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold text-white font-mono uppercase tracking-wider">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-white leading-none">{item.count}</span>
                <span className="font-mono text-[7px] text-[#A1A1AA]/40 block mt-0.5">{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
