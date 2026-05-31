import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Terminal } from 'lucide-react';
import { CTAButton } from '../ui/CTAButton';
import { ContainerScroll } from '../ui/container-scroll-animation';
import { ProductPreview } from '../ui/ProductPreview';

interface HeroSectionProps {
  onStartReview?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartReview }) => {
  return (
    <section className="relative min-h-[160vh] pb-[20rem] flex flex-col items-center justify-start overflow-hidden pt-36 md:pt-48 bg-transparent z-10 w-full dark-grid-bg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,10,11,0.6)_100%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center px-4 w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-surface-border bg-surface-card/60 backdrop-blur-md mb-8 select-none shadow-[0_0_15px_rgba(0,229,255,0.02)] inner-glow-cyan"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[10px] font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
            <Terminal className="w-3 h-3" />
            v2.0 Scanning Engine Live
          </span>
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-6 max-w-4xl"
        >
          Your AI eye for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-fixed-dim to-secondary">
            cleaner, safer code.
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm md:text-lg text-text-muted max-w-2xl leading-relaxed mb-10 px-2"
        >
          Paste your code, detect bugs, security risks, code smells, and performance issues before they reach production.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full sm:w-auto px-4 sm:px-0"
        >
          <CTAButton onClick={onStartReview} variant="primary" className="w-full sm:w-auto flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Start Reviewing
          </CTAButton>
          <CTAButton variant="secondary" className="w-full sm:w-auto flex items-center justify-center gap-2">
            <Play className="w-3.5 h-3.5" />
            Watch Demo
          </CTAButton>
        </motion.div>
      </div>

      <div className="w-full max-w-5xl mx-auto mt-16 relative px-4 md:px-0 z-20">
        <div className="absolute -inset-10 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-[120px] pointer-events-none -z-10" />

        <ContainerScroll>
          <ProductPreview />
        </ContainerScroll>
      </div>
    </section>
  );
};
