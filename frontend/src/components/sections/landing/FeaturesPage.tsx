import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, ShieldAlert, Layers, Activity, Sparkles, Clock, 
  Settings, ArrowRight, ArrowLeft, Check, 
  AlertCircle
} from 'lucide-react';
import { NavHeader } from '../../layout/NavHeader';
import { Footer } from './Footer';
import { AuroraBackground } from '../../ui/aurora-background';
import { CTAButton } from '../../ui/CTAButton';

interface FeaturesPageProps {
  onStartReview: () => void;
  onNavigate: (route: 'landing' | 'features' | 'auth' | 'dashboard') => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({
  onStartReview,
  onNavigate
}) => {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        if (current >= 82) {
          clearInterval(interval);
        } else {
          current += 1;
          setScore(current);
        }
      }, 15);
      return () => clearInterval(interval);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const [scanStep, setScanStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setScanStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuroraBackground className="min-h-screen h-auto !bg-background text-white font-sans overflow-x-hidden flex flex-col relative select-none w-full justify-start py-0">
      <NavHeader onStartReview={onStartReview} />

      <section className="relative w-full pt-44 pb-20 select-none flex items-center justify-center">
        <div className="absolute inset-0 dark-grid-bg-fine opacity-20 pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.05)]"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Kodeye Features</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight"
          >
            Everything you need to <br />
            <span className="text-primary font-extrabold">review code smarter.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-text-secondary leading-relaxed max-w-xl mx-auto font-medium"
          >
            Kodeye combines code scanning, security detection, quality scoring, and issue tracking into one focused developer workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4 select-none"
          >
            <CTAButton onClick={onStartReview} variant="primary" className="px-8 py-3 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer">
              Start Reviewing
            </CTAButton>
            <button
              onClick={() => onNavigate('landing')}
              className="px-8 py-3 rounded-full border border-border bg-card/20 hover:border-primary/20 text-text-secondary hover:text-white transition-all font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer h-11"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              Back to Home
            </button>
          </motion.div>

        </div>
      </section>

      <section className="relative w-full py-16 select-none bg-background/50 border-t border-border">
        <div className="max-w-5xl mx-auto px-6 w-full text-center space-y-12">
          
          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Engineering Capabilities</h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed font-semibold">Deep analysis frameworks designed to replace superficial template sweeps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left select-none">
            
            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(0, 229, 255, 0.2)" }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between h-72 select-none relative overflow-hidden group"
            >
              <div className="space-y-3 z-10">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-[0_0_15px_rgba(0,229,255,0.05)]">
                  <Code2 className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">AI-Assisted Code Review</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Analyzes semantic code intent to detect architectural flaws and logic inconsistencies rather than mere lint parameters.</p>
              </div>
              <div className="pt-4 border-t border-border/40 font-mono text-[9px] text-text-muted font-bold select-none group-hover:text-primary transition-colors">
                AST SEMANTIC CAPABILITIES
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(0, 229, 255, 0.2)" }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between h-72 select-none relative overflow-hidden group"
            >
              <div className="space-y-3 z-10">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Security Risk Detection</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Checks branches instantly for hardcoded credentials, SQL injection, unsafe commands, and sensitive token exposures.</p>
              </div>
              <div className="pt-4 border-t border-border/40 font-mono text-[9px] text-text-muted font-bold select-none group-hover:text-primary transition-colors">
                OWASP TOP 10 SCANNING
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(0, 229, 255, 0.2)" }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between h-72 select-none relative overflow-hidden group"
            >
              <div className="space-y-3 z-10">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Bug & Error Detection</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Identifies unhandled edge cases, missing error logs, potential memory leaks, and null pointer violations.</p>
              </div>
              <div className="pt-4 border-t border-border/40 font-mono text-[9px] text-text-muted font-bold select-none group-hover:text-primary transition-colors">
                AST COMPILATION ANALYSIS
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(0, 229, 255, 0.2)" }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between h-72 select-none relative overflow-hidden group"
            >
              <div className="space-y-3 z-10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Code Quality Scoring</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Computes exact numerical metrics across maintainability, performance, security, and readability benchmarks.</p>
              </div>
              <div className="pt-4 border-t border-border/40 font-mono text-[9px] text-text-muted font-bold select-none group-hover:text-primary transition-colors">
                METRICS ENGINE FEEDS
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(0, 229, 255, 0.2)" }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between h-72 select-none relative overflow-hidden group"
            >
              <div className="space-y-3 z-10">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Suggested Fixes</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Generates precise, ready-to-merge side-by-side patch blocks showing recommended code revisions.</p>
              </div>
              <div className="pt-4 border-t border-border/40 font-mono text-[9px] text-text-muted font-bold select-none group-hover:text-primary transition-colors">
                SECTOR PATCH RESOLVER
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(0, 229, 255, 0.2)" }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between h-72 select-none relative overflow-hidden group"
            >
              <div className="space-y-3 z-10">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Review History</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Keeps a robust tabular archive of past sweeps to track metrics evolution over active branches.</p>
              </div>
              <div className="pt-4 border-t border-border/40 font-mono text-[9px] text-text-muted font-bold select-none group-hover:text-primary transition-colors">
                HISTORY ARCHIVES PIPELINE
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(0, 229, 255, 0.2)" }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between h-72 select-none relative overflow-hidden group md:col-span-2"
            >
              <div className="space-y-3 z-10">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                  <Layers className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Linear-Style Issue Tracking</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Directly manage security patches and logical issues inside our high-density task manager. Assign ownership, track status changes, and filter commits inside a focused workspace.</p>
              </div>
              <div className="pt-4 border-t border-border/40 font-mono text-[9px] text-text-muted font-bold select-none group-hover:text-primary transition-colors">
                WORKSPACE BOARD WORKFLOW
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(0, 229, 255, 0.2)" }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between h-72 select-none relative overflow-hidden group"
            >
              <div className="space-y-3 z-10">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
                  <Settings className="w-4 h-4 text-pink-400" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">GitHub Workflow Ready</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Designed for friction-free repository mapping to run automated reviews directly at commit push triggers.</p>
              </div>
              <div className="pt-4 border-t border-border/40 font-mono text-[9px] text-text-muted font-bold select-none group-hover:text-primary transition-colors">
                GIT PIPELINE COUPLING
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      <section className="relative w-full py-20 select-none bg-background border-t border-border flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[8px] font-bold uppercase tracking-wider select-none">
              AST Scanning Console
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
              Review code before <br />
              it breaks production.
            </h2>
            <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">
              Kodeye scans source files via dry Abstract Syntax Tree parsing to spot bugs and structure smells. Rather than just flagging issues, it identifies the exact context and prepares ready-to-merge patches in real time.
            </p>
          </div>

          <div className="lg:col-span-7 w-full flex">
            <div className="w-full rounded-2xl border border-border bg-[#0C0C0E] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col h-[340px] relative inner-glow-card">
              
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#070708] select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="font-mono text-[9px] text-text-secondary ml-4">auth-gateway.rs</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#0C0C0E] border border-border font-mono text-[8px] text-primary font-bold uppercase select-none">Rust</span>
              </div>

              <div className="flex-1 font-mono text-[9px] leading-relaxed relative bg-[#0C0C0E] overflow-hidden p-4 dark-grid-bg-fine select-text text-left">
                
                <div 
                  className="absolute left-0 right-0 h-5 bg-primary/5 border-y border-primary/20 pointer-events-none transition-all duration-700" 
                  style={{ top: `${(scanStep * 24) + 36}px` }}
                />

                <div 
                  className="absolute left-0 right-0 h-[1.5px] bg-primary/80 shadow-[0_0_12px_#00e5ff] pointer-events-none transition-all duration-700"
                  style={{ top: `${(scanStep * 24) + 36}px` }}
                />

                <div className="flex gap-4">
                  <div className="text-text-muted/40 font-mono text-right select-none font-bold">
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div>4</div>
                    <div>5</div>
                    <div>6</div>
                    <div>7</div>
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="text-text-muted font-bold">fn validate_session(token: &str) {"->"} bool &#123;</div>
                    <div className="text-text-secondary font-semibold">  let key = "sk_live_51N8..."; <span className="text-red-400 font-mono font-bold select-none ml-2">// ⚠️ Critical API Secret Key Hardcoded</span></div>
                    <div className="text-text-secondary font-semibold">  if token.is_empty() &#123;</div>
                    <div className="text-text-secondary font-semibold">    return false;</div>
                    <div className="text-text-secondary font-semibold">  &#125;</div>
                    <div className="text-text-secondary font-semibold">  verify_signature(token, key)</div>
                    <div className="text-text-muted font-bold">&#125;</div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-4 left-4 right-4 bg-[#070708] border border-border rounded-xl p-3 shadow-2xl flex items-start gap-3 select-none text-left"
                >
                  <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 shrink-0 mt-0.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white block">API Credentials Stored in Plaintext</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-950/20 border border-red-500/30 font-mono text-[7px] text-red-400 font-bold uppercase">Critical</span>
                    </div>
                    <p className="text-[8px] text-text-secondary leading-normal font-semibold">Hardcoded secrets leak immediately if source files are exposed. Abstract the variable.</p>
                  </div>
                </motion.div>

              </div>

            </div>
          </div>

        </div>
      </section>

      <section className="relative w-full py-16 select-none bg-[#0C0C0E]/40 border-t border-border flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full text-center space-y-12">
          
          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Vulnerability Telemetry Scanner</h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed font-semibold">High-risk risks isolated by dry Abstract Syntax Tree scanning blocks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 select-none">
            {[
              { title: "Hardcoded API Keys", type: "Security Risk", severity: "Critical", style: "bg-red-950/15 border-red-500/20 text-red-400" },
              { title: "SQL Injection Vectors", type: "Raw Concatenation", severity: "Critical", style: "bg-red-950/15 border-red-500/20 text-red-400" },
              { title: "Unsafe Eval Execution", type: "Command Smells", severity: "High", style: "bg-orange-950/15 border-orange-500/20 text-orange-400" },
              { title: "Missing Error Handling", type: "Crash smells", severity: "Medium", style: "bg-amber-950/15 border-amber-500/20 text-amber-400" },
              { title: "Exposed Session Token", type: "Leak smell", severity: "Low", style: "bg-blue-950/15 border-blue-500/20 text-blue-400" }
            ].map((vul, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.01 }}
                className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between items-start h-32 select-none text-left"
              >
                <div className="space-y-1">
                  <span className={`px-2 py-0.5 rounded font-mono text-[7px] font-bold uppercase ${vul.style}`}>
                    {vul.severity}
                  </span>
                  <h4 className="text-xs font-bold text-white block pt-2 tracking-tight">{vul.title}</h4>
                </div>
                <span className="text-[8px] font-mono text-text-muted font-bold uppercase tracking-wider">{vul.type}</span>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      <section className="relative w-full py-20 select-none bg-background border-t border-border flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          <div className="lg:col-span-6 w-full flex justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-[#0C0C0E] p-6 relative overflow-hidden text-left flex flex-col justify-between h-[280px] inner-glow-card">
              
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Quality Score Analyzer</span>
                <span className="px-2 py-0.5 rounded bg-[#070708] border border-border font-mono text-[8px] text-emerald-400 font-bold uppercase select-none">Active</span>
              </div>

              <div className="flex items-center gap-8 flex-1">
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="rgba(26,26,30,0.8)" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      stroke="#00e5ff" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="301.6" 
                      strokeDashoffset={301.6 - (301.6 * score) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-bold font-mono text-white leading-none">{score}</span>
                    <span className="text-[7px] font-mono text-text-muted font-bold uppercase block tracking-wider mt-1">Quality Index</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">Review Standing</span>
                  <div className="text-xs font-bold text-white leading-snug">Good, but security improvements needed</div>
                  <p className="text-[8px] text-text-secondary leading-normal font-semibold">Minor logic smells found. Resolve the critical items to lift standard repository scores.</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border/40">
                {[
                  { label: "Maint.", value: "92%" },
                  { label: "Secur.", value: "54%" },
                  { label: "Perf.", value: "88%" },
                  { label: "Read.", value: "94%" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#070708] border border-border rounded-lg p-1.5 text-center">
                    <span className="text-[7px] text-text-muted block font-bold font-mono uppercase">{item.label}</span>
                    <span className="text-[9px] font-bold text-white font-mono block mt-0.5">{item.value}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[8px] font-bold uppercase tracking-wider select-none">
              Metrics Sweeping Engine
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
              A comprehensive view <br />
              of your code health.
            </h2>
            <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">
              Get direct analytical indices covering maintainability standards, OWASP risk checks, execution parameters, and syntax readability. Compare telemetry standing to keep codebases resilient and easy to refactor.
            </p>
          </div>

        </div>
      </section>

      <section className="relative w-full py-16 select-none bg-[#0C0C0E]/40 border-t border-border flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full text-center space-y-12">
          
          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Linear-Style Ticket Pipeline</h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed font-semibold">Track issue transitions reactively from scan sweep to code fix.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[9px] text-text-muted font-bold select-none uppercase tracking-widest pb-4">
            <span>Detected</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            <span>Prioritized</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            <span>Assigned</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-primary">Fixed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full text-left select-none">
            
            <div className="space-y-4">
              <span className="text-[9px] font-mono text-text-muted font-bold uppercase tracking-wider block border-b border-border/50 pb-2">Detected (3)</span>
              <div className="bg-[#070708] border border-border rounded-xl p-3.5 space-y-2">
                <span className="px-1.5 py-0.5 rounded bg-red-950/20 border border-red-500/30 font-mono text-[7px] text-red-400 font-bold uppercase">Critical</span>
                <span className="text-[11px] font-bold text-white block leading-snug">Hardcoded API Secret</span>
                <span className="text-[8px] font-mono text-text-muted block mt-1 font-bold">auth-gateway.rs:L12</span>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[9px] font-mono text-text-muted font-bold uppercase tracking-wider block border-b border-border/50 pb-2">Prioritized (1)</span>
              <div className="bg-[#070708] border border-primary/20 rounded-xl p-3.5 space-y-2 relative overflow-hidden inner-glow-cyan shadow-[0_0_15px_rgba(0,229,255,0.02)]">
                <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-primary" />
                <span className="px-1.5 py-0.5 rounded bg-red-950/20 border border-red-500/30 font-mono text-[7px] text-red-400 font-bold uppercase">Critical</span>
                <span className="text-[11px] font-bold text-white block leading-snug">SQL Injection Threat</span>
                <span className="text-[8px] font-mono text-text-muted block mt-1 font-bold">db-parser.rs:L28</span>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[9px] font-mono text-text-muted font-bold uppercase tracking-wider block border-b border-border/50 pb-2">Assigned (1)</span>
              <div className="bg-[#070708] border border-border rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded bg-orange-950/20 border border-orange-500/30 font-mono text-[7px] text-orange-400 font-bold uppercase">High</span>
                  <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-sans text-[8px] font-bold text-primary shrink-0 select-none">D</div>
                </div>
                <span className="text-[11px] font-bold text-white block leading-snug">Unsafe Eval smells</span>
                <span className="text-[8px] font-mono text-text-muted block mt-1 font-bold">session.js:L94</span>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[9px] font-mono text-text-muted font-bold uppercase tracking-wider block border-b border-border/50 pb-2">Fixed (14)</span>
              <div className="bg-[#070708]/50 border border-border/50 rounded-xl p-3.5 space-y-2 opacity-60">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/20 border border-emerald-500/30 font-mono text-[7px] text-emerald-400 font-bold uppercase flex items-center gap-1 w-fit">
                  <Check className="w-2.5 h-2.5 shrink-0" />
                  Fixed
                </span>
                <span className="text-[11px] font-bold text-white block leading-snug line-through">Missing API Error Log</span>
                <span className="text-[8px] font-mono text-text-muted block mt-1 font-bold">logger.js:L42</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <section className="relative w-full py-20 select-none bg-background border-t border-border flex items-center">
        <div className="max-w-4xl mx-auto px-6 w-full text-center space-y-12">
          
          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Why developers build with Kodeye</h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed font-semibold">Engineered by developers to streamline code checking without pipeline overhead.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left select-none">
            
            <div className="space-y-3">
              <span className="font-mono text-primary font-extrabold text-sm block">01 /</span>
              <h4 className="text-sm font-bold text-white tracking-tight">Fast scan workflow</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Get thorough diagnostic sheets in under 5 seconds. Write, click, patch, and build without waiting for bloated server runs.</p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-primary font-extrabold text-sm block">02 /</span>
              <h4 className="text-sm font-bold text-white tracking-tight">Explainable issue sheets</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Every issue is supplemented with detailed explanations of why it occurred and side-by-side patch comparisons.</p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-primary font-extrabold text-sm block">03 /</span>
              <h4 className="text-sm font-bold text-white tracking-tight">Cleaner coding habits</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">By highlighting syntax smells, API leaks, and unhandled logic dynamically, Kodeye trains developers to write cleaner code.</p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-primary font-extrabold text-sm block">04 /</span>
              <h4 className="text-sm font-bold text-white tracking-tight">Resume-ready structures</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Maintain rigorous standards of cleanliness and security that validate senior-level software architecture.</p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-primary font-extrabold text-sm block">05 /</span>
              <h4 className="text-sm font-bold text-white tracking-tight">Fully standalone shell</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Our sandbox is locally encapsulated in React, meaning zero background process load, zero databases requirements, and zero memory drag.</p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-primary font-extrabold text-sm block">06 /</span>
              <h4 className="text-sm font-bold text-white tracking-tight">Git telemetry hooks</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">Prepared to interface cleanly with repository connection hooks. Future commit pushes will trigger scans automatically.</p>
            </div>

          </div>

        </div>
      </section>

      <section className="relative w-full py-20 select-none bg-[#0C0C0E]/40 border-t border-border flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug">
            Start building cleaner <br />
            software with Kodeye.
          </h2>

          <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed font-semibold">
            Run your first code review and see bugs, risks, and fixes in one focused dashboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 select-none">
            <CTAButton onClick={onStartReview} variant="primary" className="px-8 py-3 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer">
              Start Reviewing
            </CTAButton>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-3 rounded-full border border-border bg-card/20 hover:border-primary/20 text-text-secondary hover:text-white transition-all font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer h-11"
            >
              Go to Dashboard
            </button>
          </div>

        </div>
      </section>

      <Footer />

    </AuroraBackground>
  );
};

export default FeaturesPage;
