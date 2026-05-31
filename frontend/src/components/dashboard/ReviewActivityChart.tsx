import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar } from 'lucide-react';
import { getReviews } from '../../services/reviewService';

export const ReviewActivityChart: React.FC = () => {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [reviewDates, setReviewDates] = useState<string[]>([]);

  useEffect(() => {
    getReviews()
      .then((data) => setReviewDates(data.items.map((review) => review.created_at)))
      .catch((err) => console.error("Failed to load review activity", err));
  }, []);

  const chartPoints = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const dayKey = date.toISOString().split("T")[0];
      return {
        week: date.toLocaleDateString(undefined, { weekday: "short" }),
        reviews: reviewDates.filter((created) => created.split("T")[0] === dayKey).length,
      };
    });
  }, [reviewDates]);

  const width = 500;
  const height = 150;
  const padding = 20;

  const getCoordinates = () => {
    return chartPoints.map((point, index) => {
      const x = padding + (index * (width - 2 * padding)) / (chartPoints.length - 1);
      const maxVal = Math.max(1, ...chartPoints.map((point) => point.reviews));
      const y = height - padding - (point.reviews * (height - 2 * padding)) / maxVal;
      return { x, y };
    });
  };

  const coords = getCoordinates();
  
  const linePath = coords.reduce((path, coord, index) => {
    return path + `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`;
  }, "");

  const areaPath = linePath + 
    ` L ${coords[coords.length - 1].x} ${height - padding}` +
    ` L ${coords[0].x} ${height - padding} Z`;

  return (
    <div className="bg-surface-card/60 backdrop-blur-md border border-surface-border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-primary/25 shadow-lg flex flex-col justify-between h-[280px] inner-glow-card select-none">
      
      <div className="flex items-center justify-between border-b border-surface-border/50 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-primary/10 border border-primary/20 text-primary">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">Review Activity</h3>
            <p className="text-[10px] text-text-muted/60 mt-0.5">Historical audit cycles compiled weekly.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border bg-background/50 font-mono text-[9px] text-text-muted select-none">
          <Calendar className="w-3 h-3 text-primary" />
          <span>Last 7 Days</span>
        </div>
      </div>

      <div className="flex-1 w-full relative flex items-center justify-center pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(31,31,35,0.2)" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(31,31,35,0.2)" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(31,31,35,0.3)" />

          <motion.path
            d={areaPath}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          />

          <motion.path
            d={linePath}
            fill="none"
            stroke="#00e5ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />

          {coords.map((coord, index) => {
            const isHovered = activeBar === index;
            return (
              <g key={index} className="cursor-pointer"
                 onMouseEnter={() => setActiveBar(index)}
                 onMouseLeave={() => setActiveBar(null)}>
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? "#00e5ff" : "#131314"}
                  stroke="#00e5ff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
                
                {isHovered && (
                  <line
                    x1={coord.x}
                    y1={coord.y}
                    x2={coord.x}
                    y2={height - padding}
                    stroke="rgba(0, 229, 255, 0.3)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        <AnimatePresence>
          {activeBar !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-12 bg-[#121214]/95 border border-primary/20 rounded-lg p-2 shadow-2xl font-mono text-[9px] z-20 text-center flex items-center gap-2 select-none"
            >
              <span className="text-text-muted">{chartPoints[activeBar].week}:</span>
              <span className="text-primary font-bold">{chartPoints[activeBar].reviews} reviews completed</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center px-4 font-mono text-[8px] text-text-muted/50 pt-2.5 select-none border-t border-surface-border/30 mt-3">
        {chartPoints.map((point) => (
          <span key={point.week}>{point.week}</span>
        ))}
      </div>

    </div>
  );
};
