import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '../../services/dashboardService';

export const ScannerCoverageCard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => console.error("Failed to load scanner coverage data", err));
  }, []);

  const totalReviews = stats?.total_reviews ?? 0;
  const score = Math.round(stats?.average_score ?? 0);
  const uncovered = Math.max(0, 100 - score);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-[280px] inner-glow-card select-none text-left w-full group">
      
      <div className="flex items-center justify-between border-b border-border/40 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/5 border border-primary/20 text-primary">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Scanner Coverage</h3>
            <p className="text-[10px] text-text-muted mt-0.5 font-medium">Telemetry parameters parsed during scans.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-4xl font-black text-white tracking-tight leading-none">{score}%</span>
            <span className="text-[9px] font-mono text-primary font-bold block uppercase tracking-wider mt-1">
              Backend Average Score
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#0C0C0E] border border-border text-emerald-400">
            <ShieldCheck className="w-6 h-6 shrink-0" />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="h-1.5 w-full bg-[#0C0C0E] border border-border rounded-full overflow-hidden flex">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${score}%` }} />
          </div>
          <div className="flex justify-between items-center text-[8px] font-mono text-text-muted font-bold uppercase tracking-wider">
            <span>Reviews Processed: {totalReviews}</span>
            <span>Score Gap: {uncovered}%</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border/30 pt-3 mt-3 flex justify-between items-center font-mono text-[8px] text-text-muted font-bold uppercase">
        <span>Source: Backend API</span>
        <span className="text-emerald-400">{totalReviews > 0 ? "Telemetry Loaded" : "Awaiting Reviews"}</span>
      </div>

    </div>
  );
};

export default ScannerCoverageCard;
