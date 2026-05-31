import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { ScanLine } from '../../ui/ScanLine';

export const CodeScannerSection: React.FC = () => {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found' | 'fixing' | 'fixed'>('idle');
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(72);

  useEffect(() => {
    let interval: any;
    if (scanStatus === 'scanning') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanStatus('found');
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [scanStatus]);

  const handleStartScan = () => {
    setProgress(0);
    setScore(72);
    setScanStatus('scanning');
  };

  const handleApplyFix = () => {
    setScanStatus('fixing');
    setTimeout(() => {
      setScanStatus('fixed');
      setScore(99);
    }, 1500);
  };

  return (
    <section className="relative py-24 md:py-32 w-full bg-surface-card overflow-hidden z-10 border-y border-surface-border">
      <div className="absolute inset-0 dark-grid-bg opacity-20 pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] bg-secondary/3 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-border bg-surface text-xs font-mono font-semibold text-primary">
              <Activity className="w-3.5 h-3.5" />
              Live Interactive Sandbox
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight">
              Instant analysis in the sandbox.
            </h2>
            
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              Test Kodeye's active engine directly. See how our parser isolates vulnerable functions, calculates a structural safety index, and delivers instant diff patches in sub-100ms speeds.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-border select-none">
              <div className="bg-surface border border-surface-border rounded-xl p-3.5">
                <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Engine Speed</div>
                <div className="text-lg font-bold text-text-primary font-mono mt-1">92.4ms</div>
              </div>
              <div className="bg-surface border border-surface-border rounded-xl p-3.5">
                <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Vulnerability Score</div>
                <div className="text-lg font-bold text-primary font-mono mt-1">
                  {score}/100
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              {scanStatus === 'idle' && (
                <button
                  onClick={handleStartScan}
                  className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer hover:opacity-90"
                >
                  Trigger Security Scan
                </button>
              )}
              {scanStatus === 'scanning' && (
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-surface-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="font-mono text-xs text-primary animate-pulse">{progress}%</span>
                </div>
              )}
              {scanStatus === 'found' && (
                <button
                  onClick={handleApplyFix}
                  className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 hover:opacity-90"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Apply Suggested Patch
                </button>
              )}
              {scanStatus === 'fixing' && (
                <span className="font-mono text-xs text-primary animate-pulse uppercase tracking-wider font-bold">Applying Patch...</span>
              )}
              {scanStatus === 'fixed' && (
                <div className="flex items-center gap-2 text-primary text-xs font-mono font-bold bg-primary/5 border border-primary/20 px-4 py-2.5 rounded-xl">
                  <CheckCircle className="w-4 h-4" />
                  Code Repaired & Audited
                </div>
              )}
              {scanStatus !== 'idle' && scanStatus !== 'scanning' && scanStatus !== 'fixing' && (
                <button
                  onClick={handleStartScan}
                  className="px-4 py-2.5 rounded-xl border border-surface-border bg-surface hover:border-surface-bright text-text-secondary hover:text-text-primary transition-all text-xs font-mono uppercase font-bold cursor-pointer"
                >
                  Scan Again
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="relative w-full rounded-2xl border border-surface-border bg-surface shadow-2xl overflow-hidden z-10">
              <div className="h-10 border-b border-surface-border bg-surface-card flex items-center px-4 justify-between select-none">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-critical/40" />
                  <div className="w-2 h-2 rounded-full bg-high/40" />
                  <div className="w-2 h-2 rounded-full bg-success/40" />
                </div>
                <div className="font-mono text-[10px] text-text-muted">app_router.py</div>
                <div className="w-10" />
              </div>

              <div className="p-4 relative font-mono text-[10px] leading-relaxed text-text-secondary h-[240px] overflow-hidden text-left">
                {scanStatus === 'scanning' && <ScanLine />}

                <pre className="select-none">
                  <div><span className="text-secondary">from</span> flask <span className="text-secondary">import</span> Flask, request, jsonify</div>
                  <div>app = Flask(__name__)</div>
                  <div className="h-1.5" />
                  <div>@app.route(<span className="text-primary">"/api/user"</span>)</div>
                  <div><span className="text-secondary">def</span> <span className="text-text-primary">get_user</span>():</div>
                  
                  <AnimatePresence mode="wait">
                    {scanStatus === 'found' || scanStatus === 'fixing' ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-critical/10 border-l-2 border-critical/60 px-2 py-0.5 text-critical font-bold"
                      >
                        {'  '}query = <span className="text-primary">f"SELECT * FROM users WHERE id = '{'{'}request.args.get('id'){'}'}'"</span>
                      </motion.div>
                    ) : scanStatus === 'fixed' ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-primary/10 border-l-2 border-primary/60 px-2 py-0.5 text-primary font-bold"
                      >
                        {'  '}query = <span className="text-primary">"SELECT * FROM users WHERE id = %s"</span>
                      </motion.div>
                    ) : (
                      <div>{'  '}query = <span className="text-primary">f"SELECT * FROM users WHERE id = '{'{'}request.args.get('id'){'}'}'"</span></div>
                    )}
                  </AnimatePresence>
                  
                  <div>{'  '}cursor = db.execute(query)</div>
                  <div>{'  '}<span className="text-secondary">return</span> jsonify(cursor.fetchone())</div>
                </pre>

                <AnimatePresence>
                  {scanStatus === 'found' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 10 }}
                      className="absolute bottom-4 left-4 right-4 bg-surface-card border border-critical/20 rounded-xl p-3 flex gap-3 shadow-2xl z-20 hover:border-critical/40 transition-colors select-none text-left"
                    >
                      <div className="p-1 rounded-lg bg-critical/20 border border-critical/30 text-critical shrink-0 self-start">
                        <AlertCircle className="w-4 h-4 animate-bounce" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-mono text-[9px] tracking-widest text-critical font-bold uppercase">Security Vulnerability</div>
                        <div className="text-[10px] text-text-secondary leading-normal">
                          SQL Injection vector discovered. User input is directly interpolated in database query strings.
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {scanStatus === 'fixed' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 10 }}
                      className="absolute bottom-4 left-4 right-4 bg-surface-card border border-primary/20 rounded-xl p-3 flex gap-3 shadow-2xl z-20 hover:border-primary/40 transition-colors select-none text-left"
                    >
                      <div className="p-1 rounded-lg bg-primary/20 border border-primary/30 text-primary shrink-0 self-start">
                        <Shield className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-mono text-[9px] tracking-widest text-primary font-bold uppercase">Patched & Verified</div>
                        <div className="text-[10px] text-text-secondary leading-normal">
                          Parameterized query introduced. SQL injection vulnerability successfully mitigated and passed.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodeScannerSection;
