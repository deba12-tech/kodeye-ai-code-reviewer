import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, ShieldAlert, GitBranch, Terminal, CheckCircle2 
} from 'lucide-react';

export const BentoGridSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section id="features" className="relative py-24 md:py-32 w-full overflow-hidden bg-transparent z-10">
      <div className="absolute inset-0 dark-grid-bg-fine opacity-40 pointer-events-none -z-10" />
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 w-full">
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono font-bold tracking-widest text-primary uppercase mb-3 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Capabilities
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight"
          >
            Supercharge your review cycle.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs md:text-sm text-text-secondary mt-3 max-w-xl mx-auto leading-relaxed"
          >
            A suite of automated intelligence tools designed to scan, analyze, and optimize your repository with developer-first feedback.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 flex h-full"
          >
            <div className="w-full h-full p-6 bg-surface-card border border-surface-border rounded-2xl transition-all duration-300 hover:border-surface-bright flex flex-col justify-between group shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-xl bg-surface border border-surface-border text-primary">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">AI Code Review</h3>
                </div>
                <p className="text-xs text-text-secondary max-w-md leading-relaxed mb-6">
                  Receive context-aware annotations explaining not just what went wrong, but also providing structural code alternatives.
                </p>
              </div>

              <div className="border border-surface-border bg-background rounded-xl p-4 font-mono text-[10px] w-full mt-2 relative overflow-hidden select-none z-10 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-surface-border/50 mb-2">
                  <span className="text-text-muted">user_controller.ts</span>
                  <span className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-[9px] text-primary">AI Recommendation</span>
                </div>
                <div className="space-y-1 text-text-secondary">
                  <div className="bg-critical/10 border-l-2 border-critical/50 px-2 py-1 text-critical flex items-center gap-2">
                    <span className="text-critical/50 select-none">-</span>
                    <span>const hash = crypto.md5(password);</span>
                  </div>
                  <div className="bg-primary/10 border-l-2 border-primary/50 px-2 py-1 text-primary flex items-center gap-2">
                    <span className="text-primary/50 select-none">+</span>
                    <span>const hash = await bcrypt.hash(password, 12);</span>
                  </div>
                </div>
                
                <div className="absolute bottom-2 right-2 bg-surface-card border border-surface-border rounded-xl p-2 shadow-lg flex items-center gap-2 max-w-[200px] border-primary/25">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[8px] text-primary">AI</div>
                  <span className="text-[9px] font-sans font-medium text-text-primary truncate">Swapped MD5 for bcrypt</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="md:col-span-1 flex h-full"
          >
            <div className="w-full h-full p-6 bg-surface-card border border-surface-border rounded-2xl transition-all duration-300 hover:border-surface-bright flex flex-col justify-between group shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-xl bg-surface border border-surface-border text-critical">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">Security Risk Detection</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                  Scan endpoints for secrets, SQL Injection, cross-site leaks, and out-of-date packages instantly.
                </p>
              </div>

              <div className="space-y-2 border border-surface-border bg-background/50 rounded-xl p-3 select-none z-10 w-full text-left">
                <div className="flex justify-between items-center font-mono text-[9px]">
                  <span className="text-text-muted">Vulnerability Log</span>
                  <span className="text-critical animate-pulse">● Live Audit</span>
                </div>
                
                <div className="flex items-center justify-between bg-critical/5 border border-critical/10 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-critical" />
                    <span className="font-mono text-[10px] text-text-primary">SQL Injection</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-critical/20 text-[8px] text-critical font-bold uppercase">Critical</span>
                </div>

                <div className="flex items-center justify-between bg-high/5 border border-high/10 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-high" />
                    <span className="font-mono text-[10px] text-text-primary">Hardcoded Token</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-high/20 text-[8px] text-high font-bold uppercase">High</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="md:col-span-1 flex h-full"
          >
            <div className="w-full h-full p-6 bg-surface-card border border-surface-border rounded-2xl transition-all duration-300 hover:border-surface-bright flex flex-col justify-between group shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-xl bg-surface border border-surface-border text-secondary">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">Interactive Bug Tracker</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                  Turn detected flaws into actionable issue tasks directly within your Kodeye workspace dashboard.
                </p>
              </div>

              <div className="space-y-2 border border-surface-border bg-background/50 rounded-xl p-3 font-sans select-none z-10 w-full text-left">
                <div className="flex items-center justify-between border-b border-surface-border/50 pb-1.5 mb-1.5">
                  <span className="text-[9px] font-mono text-text-muted uppercase">Workflow Track</span>
                  <span className="text-[9px] text-primary font-semibold">Done: 4/5</span>
                </div>
                
                <div className="bg-surface-card border border-surface-border rounded-xl p-2 flex items-center justify-between shadow-sm">
                  <span className="text-[10px] text-text-primary font-medium">Verify JWT Claim</span>
                  <span className="text-[9px] text-text-secondary bg-surface border border-surface-border px-1.5 py-0.5 rounded-lg font-mono">Assigned</span>
                </div>

                <div className="bg-surface-card border border-primary/20 rounded-xl p-2 flex items-center justify-between shadow-md">
                  <span className="text-[10px] text-primary font-medium">Sanitize DB Query</span>
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/25 text-[8px] text-primary font-bold uppercase">Fixed</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="md:col-span-1 flex h-full"
          >
            <div className="w-full h-full p-6 bg-surface-card border border-surface-border rounded-2xl transition-all duration-300 hover:border-surface-bright flex flex-col justify-between group shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-xl bg-surface border border-surface-border text-primary">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">Quality Score Dial</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                  Receive real-time progress calculations showing overall repository health and structural safety indexes.
                </p>
              </div>

              <div className="flex items-center justify-center p-3 border border-surface-border bg-background/50 rounded-xl select-none relative h-28 overflow-hidden z-10 w-full">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="34" className="stroke-surface-border" strokeWidth="4" fill="transparent" />
                  <circle cx="40" cy="40" r="34" className="stroke-primary" strokeWidth="4" fill="transparent"
                    strokeDasharray="213.6" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-xl font-bold text-text-primary shadow-[0_0_20px_rgba(0,229,255,0.1)]">98</span>
                  <span className="text-[7px] uppercase font-mono tracking-widest text-primary font-semibold mt-0.5">Safety Index</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="md:col-span-1 flex h-full"
          >
            <div className="w-full h-full p-6 bg-surface-card border border-surface-border rounded-2xl transition-all duration-300 hover:border-surface-bright flex flex-col justify-between group shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-xl bg-surface border border-surface-border text-secondary">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">Pull Request Feed</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                  Audit and log historical results of previous reviews. Compare trends and verify bug fix approvals.
                </p>
              </div>

              <div className="space-y-1.5 border border-surface-border bg-background/50 rounded-xl p-3 font-mono text-[9px] select-none z-10 w-full text-left">
                <div className="flex items-center justify-between border-b border-surface-border/50 pb-1 mb-1">
                  <span className="text-text-muted uppercase">History logs</span>
                  <span className="text-text-muted">Filtered: PRs</span>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-text-primary font-medium truncate max-w-[100px]">PR #104: feat/auth</span>
                  <span className="text-primary font-semibold bg-primary/5 border border-primary/20 rounded px-1 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Approved</span>
                </div>
                
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-text-primary font-medium truncate max-w-[100px]">PR #102: fix/cors</span>
                  <span className="text-secondary font-semibold bg-secondary/5 border border-secondary/20 rounded px-1 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Resolved</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="md:col-span-2 flex h-full"
          >
            <div className="w-full h-full p-6 bg-surface-card border border-surface-border rounded-2xl transition-all duration-300 hover:border-surface-bright flex flex-col justify-between group shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-xl bg-surface border border-surface-border text-primary flex items-center justify-center">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">GitHub Integration Ready</h3>
                </div>
                <p className="text-xs text-text-secondary max-w-md leading-relaxed mb-6">
                  Integrate Kodeye directly inside your GitHub Actions CI/CD workflows to block unsafe PR merges.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-surface-border bg-background rounded-xl p-4 font-mono text-[9px] w-full mt-2 relative overflow-hidden select-none z-10 text-left">
                <div className="space-y-1 text-text-secondary border-r border-surface-border/50 pr-2 shrink-0 overflow-x-auto">
                  <div className="text-secondary font-bold">name: <span className="text-primary">Kodeye Audit</span></div>
                  <div className="text-secondary font-bold">on: <span className="text-text-primary">[pull_request]</span></div>
                  <div className="text-secondary font-bold">jobs:</div>
                  <div className="pl-2 text-secondary font-bold">analyze:</div>
                  <div className="pl-4 text-secondary font-bold">runs-on: <span className="text-text-primary">ubuntu-latest</span></div>
                  <div className="pl-4 text-secondary font-bold">steps:</div>
                  <div className="pl-6 text-text-secondary">- <span className="text-secondary font-bold">uses: </span><span className="text-primary">kodeye/scan@v2</span></div>
                </div>

                <div className="flex flex-col justify-center space-y-3 pl-0 sm:pl-2 pt-3 sm:pt-0">
                  <div className="flex items-center justify-between border-b border-surface-border/50 pb-1 mb-1">
                    <span className="text-text-muted uppercase">CI Run #2409</span>
                    <span className="text-primary font-bold">Success</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-primary/25 border border-primary/50 flex items-center justify-center text-primary font-bold text-[8px]">✓</div>
                    <span className="text-text-primary text-[10px]">Initialize Kodeye</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-primary/25 border border-primary/50 flex items-center justify-center text-primary font-bold text-[8px]">✓</div>
                    <span className="text-text-primary text-[10px]">Static Vulnerability Audit</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default BentoGridSection;
