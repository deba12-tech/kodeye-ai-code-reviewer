import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldAlert, CheckCircle, AlertOctagon } from 'lucide-react';
import { getDashboardStats } from '../../services/dashboardService';

interface StatCardsProps {
  onNewReviewClick?: () => void;
}

export const StatCards: React.FC<StatCardsProps> = () => {
  const [stats, setStats] = useState({
    total_reviews: 0,
    open_issues: 0,
    critical_issues: 0,
    average_score: 0,
  });

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load dashboard stats", err));
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  const totalReviews = stats.total_reviews;
  const openIssues = stats.open_issues;
  const criticalBugs = stats.critical_issues;
  const averageScore = Math.round(stats.average_score);

  const metrics = [
    {
      title: "Reviews Completed",
      value: String(totalReviews),
      change: "backend",
      changeType: "up",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      colorClass: "text-primary",
      borderColor: "hover:border-primary/20"
    },
    {
      title: "Open Issues",
      value: String(openIssues),
      change: "active",
      changeType: "down",
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      colorClass: "text-yellow-400",
      borderColor: "hover:border-yellow-400/20"
    },
    {
      title: "Average Score",
      value: `${averageScore}%`,
      change: "grade",
      changeType: "up",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      colorClass: "text-emerald-400",
      borderColor: "hover:border-emerald-400/20"
    },
    {
      title: "Critical Bugs",
      value: String(criticalBugs),
      change: "Critical",
      changeType: "alert",
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
      colorClass: "text-red-400",
      borderColor: "hover:border-red-400/25 border-red-500/10"
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none w-full text-left"
    >
      {metrics.map((metric, idx) => (
        <motion.div
          key={idx}
          variants={cardVariants}
          className={`bg-card border border-border rounded-2xl p-4 flex items-center justify-between h-20 transition-all duration-300 inner-glow-card group ${metric.borderColor}`}
        >
          <div className="space-y-0.5 text-left truncate pr-4">
            <span className="text-[9px] font-mono tracking-widest text-text-muted uppercase font-bold block truncate">
              {metric.title}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white tracking-tight leading-none">
                {metric.value}
              </span>
              <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${
                metric.changeType === 'up' ? 'text-success' :
                metric.changeType === 'down' ? 'text-primary' : 'text-critical font-extrabold'
              }`}>
                {metric.change}
              </span>
            </div>
          </div>
          
          <div className={`p-2 rounded-xl bg-[#0C0C0E] border border-border shrink-0 ${metric.colorClass}`}>
            {metric.icon}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatCards;
