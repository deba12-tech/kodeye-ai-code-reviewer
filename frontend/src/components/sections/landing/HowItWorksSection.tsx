import React from 'react';
import { motion } from 'framer-motion';
import { Clipboard, Search, CheckCircle2 } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Paste Code",
      description: "Drop your source code, functions, or file structures directly into the scanner console or connect your GitHub repository.",
      icon: <Clipboard className="w-5 h-5" />,
      visual: (
        <div className="border border-surface-border bg-background rounded-xl p-4 font-mono text-[9px] w-full mt-4 select-none relative h-28 overflow-hidden z-10 text-left">
          <div className="flex items-center gap-1.5 pb-2 border-b border-surface-border/50 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary/40" />
            <span className="text-text-muted">index.js</span>
          </div>
          <div className="space-y-1 text-text-secondary">
            <div><span className="text-secondary font-semibold">function</span> <span className="text-text-primary">initSession</span>(user) {'{'}</div>
            <div>  <span className="text-secondary font-semibold">let</span> sql = <span className="text-primary">"SELECT * FROM users"</span>;</div>
            <div className="text-text-primary/30 animate-pulse">|</div>
          </div>
        </div>
      )
    },
    {
      num: "02",
      title: "Analyze Issues",
      description: "Our high-precision AST engine sweeps the code structure, highlighting syntax anomalies, key secrets, and performance lags.",
      icon: <Search className="w-5 h-5" />,
      visual: (
        <div className="border border-surface-border bg-background rounded-xl p-4 font-mono text-[9px] w-full mt-4 select-none relative h-28 overflow-hidden flex flex-col justify-between z-10 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border/50 mb-2">
            <span className="text-text-muted">Audit Scanner</span>
            <span className="text-primary font-bold animate-pulse">Scanning...</span>
          </div>
          <div className="relative flex-1 flex items-center justify-center">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/70 shadow-[0_0_12px_rgba(0,229,255,0.8)] animate-pulse" />
            <div className="bg-critical/10 border border-critical/20 text-critical rounded-lg p-2 text-center text-[8px] max-w-[150px] shadow-sm">
              Vulnerability Detected (SQLi)
            </div>
          </div>
        </div>
      )
    },
    {
      num: "03",
      title: "Track Fixes",
      description: "Automatically transform identified flaws into ticket tasks, apply suggested AI patch fixes, and verify full resolution.",
      icon: <CheckCircle2 className="w-5 h-5" />,
      visual: (
        <div className="border border-surface-border bg-background rounded-xl p-4 font-mono text-[9px] w-full mt-4 select-none relative h-28 overflow-hidden flex flex-col justify-between z-10 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border/50 mb-2">
            <span className="text-text-muted">Resolutions</span>
            <span className="text-primary font-bold">100% Fixed</span>
          </div>
          <div className="flex items-center gap-2 justify-center bg-primary/10 border border-primary/20 rounded-lg py-2 px-3 text-primary text-[10px]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Audit Passed Successfully</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="relative py-24 md:py-32 w-full overflow-hidden bg-transparent z-10">
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-surface-border to-transparent -z-10" />

      <div className="max-w-5xl mx-auto px-6 w-full">
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono font-bold tracking-widest text-primary uppercase mb-3 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            Workflow Lifecycle
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight"
          >
            How Kodeye works.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs md:text-sm text-text-secondary mt-3 max-w-xl mx-auto leading-relaxed"
          >
            Three simple, developer-centric steps to continuously protect and monitor your repository code quality.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-surface-border -z-10" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
              className="flex h-full w-full"
            >
              <div className="w-full h-[360px] p-6 bg-surface-card border border-surface-border rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-surface-bright flex flex-col justify-between group shadow-sm">
                <div className="absolute -top-6 -right-6 font-mono text-7xl font-extrabold text-white/[0.015] group-hover:text-white/[0.03] transition-colors duration-500 select-none">
                  {step.num}
                </div>

                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border text-primary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
                    {step.icon}
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-left">
                    <span className="font-mono text-xs font-bold text-primary">{step.num}.</span>
                    <h3 className="text-sm font-bold text-text-primary tracking-wide">{step.title}</h3>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed text-left">
                    {step.description}
                  </p>
                </div>

                {step.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
