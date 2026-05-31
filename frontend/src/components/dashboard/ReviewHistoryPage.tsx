import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, RotateCcw, 
  ExternalLink, ArrowRight,
  FolderOpen, Check
} from 'lucide-react';
import { getReviews } from '../../services/reviewService';

interface HistoricalReview {
  id: string;
  project: string;
  lang: string;
  score: number;
  totalIssues: number;
  criticalIssues: number;
  depth: 'Quick' | 'Deep';
  date: string;
}

interface ReviewHistoryPageProps {
  onViewReport: (reviewId: string) => void;
  onStartReview: () => void;
}

export const ReviewHistoryPage: React.FC<ReviewHistoryPageProps> = ({ 
  onViewReport, 
  onStartReview 
}) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<HistoricalReview[]>([]);

  useEffect(() => {
    getReviews()
      .then((data) => {
        setReviews(data.items.map((item) => ({
          id: String(item.id),
          project: item.project_name,
          lang: item.language,
          score: item.score,
          totalIssues: item.issues_count || 0,
          criticalIssues: 0,
          depth: "Quick",
          date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        })));
      })
      .catch((err) => console.error("Failed to load review history", err));
  }, []);

  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("All");
  const [filterScore, setFilterScore] = useState("All");
  const [filterDate, setFilterDate] = useState("All");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilterLang("All");
    setFilterScore("All");
    setFilterDate("All");
    showToast("Filters reset!");
  };

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = rev.project.toLowerCase().includes(search.toLowerCase()) || 
                          rev.id.toLowerCase().includes(search.toLowerCase());
    const matchesLang = filterLang === "All" || rev.lang === filterLang;
    
    let matchesScore = true;
    if (filterScore !== "All") {
      if (filterScore === "Excellent") matchesScore = rev.score >= 90;
      else if (filterScore === "Good") matchesScore = rev.score >= 75 && rev.score <= 89;
      else if (filterScore === "Needs Improvement") matchesScore = rev.score >= 60 && rev.score <= 74;
      else if (filterScore === "Risky") matchesScore = rev.score < 60;
    }

    let matchesDate = true;
    if (filterDate !== "All") {
      const revDate = new Date(rev.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - revDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterDate === "Today") matchesDate = diffDays <= 1;
      else if (filterDate === "Last 7 Days") matchesDate = diffDays <= 7;
      else if (filterDate === "Last 30 Days") matchesDate = diffDays <= 30;
    }

    return matchesSearch && matchesLang && matchesScore && matchesDate;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return {
        label: "Excellent",
        classes: "text-success border-success/20 bg-success/5"
      };
    } else if (score >= 75) {
      return {
        label: "Good",
        classes: "text-primary border-primary/20 bg-primary/5"
      };
    } else if (score >= 60) {
      return {
        label: "Needs Imp.",
        classes: "text-medium border-medium/20 bg-medium/5"
      };
    } else {
      return {
        label: "Risky",
        classes: "text-critical border-critical/20 bg-critical/5"
      };
    }
  };

  return (
    <div className="space-y-6 text-left relative select-none">
      
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#0C0C0E] border border-border text-primary px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-[10px] uppercase font-bold"
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Review History</h1>
          <p className="text-[11px] text-text-secondary font-semibold font-sans">
            View and compare your previous code review reports.
          </p>
        </div>
        
        <button 
          onClick={onStartReview}
          className="px-4 py-2 rounded-xl bg-primary text-black hover:opacity-90 active:scale-[0.99] transition-all duration-300 text-xs font-mono uppercase tracking-wide cursor-pointer flex items-center gap-1.5 shrink-0 font-bold h-9"
        >
          <span>New Review</span>
          <ArrowRight className="w-3.5 h-3.5 text-black" />
        </button>
      </div>

      <div className="p-4 bg-card border border-border rounded-2xl shadow-sm flex flex-col gap-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs select-text">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search by ID or project name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0C0C0E] border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder-text-muted focus:border-primary/50 focus:outline-none transition-all duration-150 font-mono font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {(search || filterLang !== "All" || filterScore !== "All" || filterDate !== "All") && (
              <button 
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl bg-[#0C0C0E] border border-border text-text-secondary hover:text-white hover:border-primary/20 transition-all duration-150 text-[10px] font-semibold font-mono uppercase tracking-wide cursor-pointer flex items-center gap-1.5 h-8 font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                Clear Filters
              </button>
            )}
            <span className="font-mono text-[9px] text-text-muted uppercase font-bold shrink-0">
              Isolated {filteredReviews.length} reports
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50">
          
          <div className="space-y-1 text-left">
            <label className="text-[8px] font-mono text-text-muted uppercase block font-bold tracking-wider">Language</label>
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="w-full bg-[#0C0C0E] border border-border rounded-xl px-3 py-1.5 text-[10px] font-mono text-text-secondary focus:border-primary/50 focus:outline-none cursor-pointer font-bold"
            >
              <option value="All">All Languages</option>
              <option value="TypeScript">TypeScript</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[8px] font-mono text-text-muted uppercase block font-bold tracking-wider">Quality Score</label>
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="w-full bg-[#0C0C0E] border border-border rounded-xl px-3 py-1.5 text-[10px] font-mono text-text-secondary focus:border-primary/50 focus:outline-none cursor-pointer font-bold"
            >
              <option value="All">All Scores</option>
              <option value="Excellent">Excellent (90+)</option>
              <option value="Good">Good (75-89)</option>
              <option value="Needs Improvement">Needs Improvement (60-74)</option>
              <option value="Risky">Risky (Below 60)</option>
            </select>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[8px] font-mono text-text-muted uppercase block font-bold tracking-wider">Timeline</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-[#0C0C0E] border border-border rounded-xl px-3 py-1.5 text-[10px] font-mono text-text-secondary focus:border-primary/50 focus:outline-none cursor-pointer font-bold"
            >
              <option value="All">All Timelines</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

        </div>

      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-[#0C0C0E]/50">
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold">Project</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold">Language</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-center">Score</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-center">Issues</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-center">Criticals</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-center">Depth</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-right">Date</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((rev) => {
                    const badge = getScoreBadge(rev.score);
                    return (
                      <motion.tr 
                        key={rev.id}
                        layoutId={`history-${rev.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => {
                          onViewReport(rev.id);
                          navigate(`/reviews/${rev.id}`);
                        }}
                        className="border-b border-border hover:bg-[#0C0C0E]/40 transition-colors cursor-pointer select-none group relative h-11"
                      >
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-text-muted font-bold shrink-0">{rev.id}</span>
                            <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate block max-w-[120px]">
                              {rev.project}
                            </span>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded border border-border bg-[#0C0C0E] font-mono text-[8px] text-text-secondary inline-block font-semibold">
                            {rev.lang}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-white">{rev.score}%</span>
                            <span className={`px-1.5 py-0.2 rounded font-mono text-[7px] font-bold uppercase border ${badge.classes}`}>
                              {badge.label}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 text-center font-mono text-xs font-bold text-white">
                          {rev.totalIssues}
                        </td>

                        <td className="p-3 text-center">
                          <span className={`font-mono text-xs font-bold ${rev.criticalIssues > 0 ? 'text-critical' : 'text-text-muted'}`}>
                            {rev.criticalIssues}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase inline-block border ${
                            rev.depth === 'Deep' ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-[#0C0C0E] border-border text-text-secondary'
                          }`}>
                            {rev.depth}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <span className="font-mono text-[10px] text-text-secondary font-semibold">{rev.date}</span>
                        </td>

                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              onViewReport(rev.id);
                              navigate(`/reviews/${rev.id}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#0C0C0E] border border-border text-text-secondary hover:text-white hover:border-primary/30 transition-all cursor-pointer font-mono text-[9px] uppercase font-bold shrink-0 h-6 flex items-center justify-center gap-1 mx-auto"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center select-none">
                      <div className="flex flex-col items-center justify-center space-y-3.5 max-w-xs mx-auto py-6">
                        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-text-muted/40">
                          <FolderOpen className="w-5 h-5 shrink-0" />
                        </div>
                        <div className="space-y-0.5 text-center">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">No reviews compiled</h4>
                          <p className="text-[9px] text-text-muted font-bold leading-normal uppercase">Filter criteria yield zero historical reports.</p>
                        </div>
                        <button
                          onClick={onStartReview}
                          className="px-4 py-2 rounded-xl bg-primary text-black font-extrabold text-[9px] font-mono uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>New Code Review</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ReviewHistoryPage;
