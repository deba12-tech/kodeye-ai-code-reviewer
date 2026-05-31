import React from 'react';
import { ExternalLink, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface ReviewItem {
  id?: string;
  project: string;
  lang: string;
  score: number;
  issues: number;
  date: string;
  status: string;
  colorClass: string;
}

interface RecentReviewsTableProps {
  reviews: ReviewItem[];
  onViewReportClick?: (reviewId?: string) => void;
}

export const RecentReviewsTable: React.FC<RecentReviewsTableProps> = ({ reviews, onViewReportClick }) => {
  const getLangStyle = (lang: string) => {
    switch (lang) {
      case 'Rust': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'TypeScript': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Python': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Go': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-[#A1A1AA] bg-[#0C0C0E] border-[#1A1A1E]';
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return {
        label: "Excellent",
        classes: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_12px_rgba(52,211,153,0.06)]"
      };
    } else if (score >= 75) {
      return {
        label: "Good",
        classes: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5"
      };
    } else if (score >= 60) {
      return {
        label: "Needs Imp.",
        classes: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5"
      };
    } else {
      return {
        label: "Risky",
        classes: "text-red-400 border-red-500/20 bg-red-500/5 animate-pulse"
      };
    }
  };

  return (
    <div className="bg-[#121215]/80 border border-[#1A1A1E] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-primary/20 shadow-lg flex flex-col justify-between w-full inner-glow-card select-none">
      
      <div className="flex items-center justify-between border-b border-[#1A1A1E]/50 pb-3.5 mb-4">
        <div>
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Recent Reviews</h3>
          <p className="text-[10px] text-[#A1A1AA]/60 mt-0.5">Summary logs of the latest repository audits.</p>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left font-sans text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1A1A1E]/50 text-[9px] font-mono tracking-widest text-[#A1A1AA]/40 uppercase select-none">
              <th className="pb-3 font-semibold">Project</th>
              <th className="pb-3 font-semibold">Language</th>
              <th className="pb-3 font-semibold text-center">Score</th>
              <th className="pb-3 font-semibold text-center">Issues</th>
              <th className="pb-3 font-semibold text-right">Date</th>
              <th className="pb-3 font-semibold text-center">Status</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1E]/40 text-[#A1A1AA]">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[10px] font-mono uppercase font-bold text-text-muted">
                  No backend reviews yet
                </td>
              </tr>
            ) : reviews.map((review, idx) => {
              const badge = getScoreBadge(review.score);
              return (
                <tr key={idx} className="hover:bg-[#0C0C0E]/50 transition-colors cursor-pointer" onClick={() => onViewReportClick?.(review.id)}>
                  <td className="py-3 font-semibold text-white truncate max-w-[120px]">{review.project}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-semibold ${getLangStyle(review.lang)}`}>
                      {review.lang}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-white text-xs">{review.score}%</span>
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[7px] font-bold uppercase border ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-center text-white font-medium">{review.issues}</td>
                  <td className="py-3 font-mono text-[10px] text-[#A1A1AA]/50 text-right">{review.date}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded border text-[8px] font-mono font-bold uppercase inline-flex items-center gap-1.5 w-fit ${review.colorClass}`}>
                      {review.status === 'Clean' ? <CheckCircle className="w-2.5 h-2.5 text-emerald-400" /> :
                       review.status === 'Issues' ? <AlertCircle className="w-2.5 h-2.5 text-yellow-400" /> :
                       <AlertTriangle className="w-2.5 h-2.5 animate-pulse text-red-400" />}
                      {review.status}
                    </span>
                  </td>
                  <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onViewReportClick?.(review.id)} className="px-2.5 py-1 rounded-xl bg-[#0C0C0E] border border-[#1A1A1E] hover:border-primary/30 hover:text-white transition-all text-[9px] font-mono uppercase tracking-wide flex items-center gap-1 cursor-pointer ml-auto">
                      <span>Inspect</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
