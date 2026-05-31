import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle } from 'lucide-react';

export const ScoreCardMini: React.FC = () => {
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.03 }}
      className="absolute top-4 right-4 bg-[#121214]/95 backdrop-blur-md border border-surface-border rounded-xl p-3 flex items-center gap-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] z-20 cursor-default select-none inner-glow-card animate-shimmer-card"
    >
      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.1)]">
        <span className="font-sans text-base text-primary font-bold">98</span>
      </div>
      <div>
        <div className="font-mono text-[9px] tracking-widest text-text-muted uppercase">Code Quality</div>
        <div className="font-sans text-xs font-semibold text-white mt-0.5">Excellent</div>
      </div>
    </motion.div>
  );
};

export const SecurityCardMini: React.FC = () => {
  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.03 }}
      className="absolute top-20 right-6 bg-[#1A0505]/95 backdrop-blur-md border border-red-500/20 rounded-xl p-3 flex items-start gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.6)] z-20 cursor-default select-none w-72 hover:border-red-500/40 transition-colors duration-300"
    >
      <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 mt-0.5 shadow-[0_0_15px_rgba(239,68,68,0.1)] shrink-0">
        <AlertTriangle className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1">
        <div className="font-mono text-[9px] tracking-widest text-red-400 uppercase font-semibold">Security Risk</div>
        <div className="font-mono text-[10px] text-red-200/80 leading-relaxed mt-1">
          Missing rate limiting middleware on authentication endpoint.
        </div>
      </div>
    </motion.div>
  );
};

export const SuggestedFixCardMini: React.FC = () => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.0, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="absolute bottom-4 right-6 bg-[#121214]/95 backdrop-blur-md border border-surface-border rounded-xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.6)] z-20 cursor-default select-none w-[280px] inner-glow-card animate-shimmer-card"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className="p-1 rounded bg-secondary/10 border border-secondary/20 text-secondary shadow-[0_0_15px_rgba(139,92,246,0.15)] shrink-0">
          <Sparkles className="w-3 h-3" />
        </div>
        <span className="font-mono text-[9px] tracking-widest text-secondary font-bold uppercase">AI Suggested Fix</span>
      </div>
      <div className="bg-[#0A0A0B] border border-surface-border/80 rounded-lg p-2.5 font-mono text-[10px] text-text-muted leading-relaxed overflow-x-auto shadow-inner border-l-2 border-l-secondary/50">
        <div><span className="text-secondary">import</span> rateLimit <span className="text-secondary">from</span> <span className="text-primary">'express-rate-limit'</span>;</div>
        <div className="text-white/40 mt-0.5">// Rate limiting</div>
        <div>app.use(<span className="text-primary">'/api/auth'</span>, rateLimit);</div>
      </div>
      <button className="mt-3 w-full py-2 rounded-lg bg-background border border-surface-border text-[10px] font-semibold text-white hover:border-secondary hover:text-secondary hover:bg-secondary/5 transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
        <Sparkles className="w-3 h-3" />
        Apply Fix
      </button>
    </motion.div>
  );
};
