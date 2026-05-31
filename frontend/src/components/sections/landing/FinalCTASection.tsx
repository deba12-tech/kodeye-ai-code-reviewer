import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Code } from 'lucide-react';
import { CTAButton } from '../../ui/CTAButton';

interface FinalCTASectionProps {
  onStartReview?: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onStartReview }) => {
  return (
    <section className="relative py-28 md:py-36 w-full overflow-hidden bg-transparent z-10 flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.04)_0%,transparent_60%)] pointer-events-none -z-10" />
      <div className="absolute inset-0 dark-grid-bg opacity-20 pointer-events-none -z-10" />

      <div className="absolute top-1/4 left-1/4 w-12 h-12 border border-primary/10 rounded-xl flex items-center justify-center text-primary/20 -z-10 select-none animate-bounce">
        <Code className="w-6 h-6" />
      </div>
      <div className="absolute bottom-1/4 right-1/4 w-12 h-12 border border-secondary/10 rounded-xl flex items-center justify-center text-secondary/20 -z-10 select-none animate-pulse">
        <span className="font-mono text-xl">{'{'}</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 w-full text-center relative z-10 space-y-8">
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-border bg-surface select-none shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest">Continuous Security</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight"
        >
          Start reviewing code <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            with Kodeye today.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs md:text-sm text-text-secondary max-w-xl mx-auto leading-relaxed"
        >
          Detect bugs, identify security vulnerabilities, and resolve complex code smells before they reach your deployment branch.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <CTAButton onClick={onStartReview} variant="primary" className="w-full sm:w-auto flex items-center justify-center gap-2 font-mono uppercase text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            Start Reviewing
          </CTAButton>
          <CTAButton variant="secondary" className="w-full sm:w-auto flex items-center justify-center gap-2 font-mono uppercase text-xs font-bold">
            <Play className="w-3.5 h-3.5" />
            Watch Demo
          </CTAButton>
        </motion.div>

      </div>
    </section>
  );
};

export default FinalCTASection;
