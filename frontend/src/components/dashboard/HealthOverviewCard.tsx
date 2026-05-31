import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '../../services/dashboardService';

interface HealthOverviewCardProps {
  onNewReviewClick: () => void;
}

export const HealthOverviewCard: React.FC<HealthOverviewCardProps> = ({ onNewReviewClick }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => console.error("Failed to load dashboard stats", err));
  }, []);

  const score = Math.round(stats?.average_score ?? 0);
  const hasReviews = (stats?.total_reviews ?? 0) > 0;
  const sparklineData = useMemo(() => {
    const recent = stats?.recent_reviews ?? [];
    return recent.length ? recent.map((review) => review.score).reverse() : [0, 0];
  }, [stats]);
  const width = 240;
  const height = 45;
  const padding = 5;

  const getCoordinates = () => {
    return sparklineData.map((val, index) => {
      const denominator = Math.max(sparklineData.length - 1, 1);
      const x = padding + (index * (width - 2 * padding)) / denominator;
      const minVal = 0;
      const maxVal = 100;
      const y = height - padding - ((val - minVal) * (height - 2 * padding)) / (maxVal - minVal);
      return { x, y };
    });
  };

  const coords = getCoordinates();
  const linePath = coords.reduce((path, coord, index) => {
    return path + `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`;
  }, "");

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6 h-auto sm:h-48 text-left select-none relative overflow-hidden w-full group">
      
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/30 via-transparent to-transparent" />
      
      <div className="flex-1 flex flex-col justify-between h-full space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Code Health Index</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#FAFAFA] tracking-tight">
            {hasReviews ? `${stats?.open_issues ?? 0} active issues across backend reviews` : "No backend reviews yet"}
          </h2>
          <p className="text-[10px] text-text-secondary font-medium max-w-[340px]">
            {hasReviews
              ? `${stats?.critical_issues ?? 0} critical issues need attention. Review metrics are loaded from the API.`
              : "Run a scan to populate dashboard health metrics from the backend."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-[180px] h-12 relative flex items-center">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <motion.path
                d={linePath}
                fill="none"
                stroke="#00e5ff"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
              <circle
                cx={coords[coords.length - 1].x}
                cy={coords[coords.length - 1].y}
                r="3"
                fill="#00e5ff"
                stroke="#070708"
                strokeWidth="1"
              />
            </svg>
          </div>
          <span className="font-mono text-[9px] text-primary font-bold uppercase shrink-0">{stats?.total_reviews ?? 0} Reviews</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center shrink-0 space-y-4 border-l border-border/40 pl-0 sm:pl-6 h-full">
        <div className="relative w-24 h-24 flex items-center justify-center select-none">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle 
              cx="48" 
              cy="48" 
              r="38" 
              className="stroke-[#0C0C0E] border border-border" 
              strokeWidth="5" 
              fill="transparent" 
            />
            <motion.circle 
              cx="48" 
              cy="48" 
              r="38" 
              className="stroke-primary" 
              strokeWidth="5" 
              fill="transparent"
              strokeLinecap="round"
              initial={{ strokeDasharray: 238.76, strokeDashoffset: 238.76 }}
              animate={{ strokeDashoffset: 238.76 - (238.76 * score) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                strokeDasharray: 238.76
              }}
            />
          </svg>
          <div className="absolute flex flex-col items-center select-none">
            <span className="font-mono text-xl font-black text-white tracking-tight leading-none">
              {score}
            </span>
            <span className="text-[7px] text-text-muted font-bold tracking-widest mt-0.5 uppercase">
              Score
            </span>
          </div>
        </div>

        <button
          onClick={onNewReviewClick}
          className="px-4 py-1.5 rounded-lg bg-primary hover:opacity-90 active:scale-[0.98] text-black font-extrabold text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Play className="w-2.5 h-2.5 text-black fill-current" />
          Run New Review
        </button>
      </div>

    </div>
  );
};

export default HealthOverviewCard;
