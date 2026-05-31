import React, { useState } from 'react';
import { Sparkles, Terminal, RefreshCw } from 'lucide-react';
import { ScanLine } from '../ui/ScanLine';

export const QuickActionCard: React.FC = () => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [lines, setLines] = useState<string[]>([]);

  const handleStartReview = () => {
    setScanState('scanning');
    setLines([]);

    // Simulate scanner output line streams
    const outputStreams = [
      "Connecting Git repository...",
      "Resolving AST parse trees...",
      "Searching for secret keywords...",
      "Auditing database parameters...",
      "MITIGATION PASSED: 0 Critical Bugs found."
    ];

    outputStreams.forEach((stream, idx) => {
      setTimeout(() => {
        setLines((prev) => [...prev, stream]);
        if (idx === outputStreams.length - 1) {
          setScanState('done');
        }
      }, (idx + 1) * 800);
    });
  };

  return (
    <div className="bg-surface-card/60 backdrop-blur-md border border-surface-border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-primary/25 shadow-lg flex flex-col justify-between h-[280px] inner-glow-card select-none">

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-surface-border/50 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-primary/10 border border-primary/20 text-primary">
            <Terminal className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">Quick Action console</h3>
            <p className="text-[10px] text-text-muted/60 mt-0.5">Audit files or repository branches instantly.</p>
          </div>
        </div>
      </div>

      {/* Main Console Box */}
      <div className="flex-1 w-full bg-[#0A0A0B] border border-surface-border rounded-xl p-3 font-mono text-[9px] text-text-muted leading-relaxed relative overflow-hidden h-32 flex flex-col justify-between">

        {scanState === 'scanning' && <ScanLine />}

        {scanState === 'idle' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 select-none">
            <div className="w-8 h-8 rounded-full bg-surface-card border border-surface-border flex items-center justify-center text-text-muted/40 group-hover:scale-105 transition-transform duration-500">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] text-text-muted/50 leading-relaxed max-w-[200px]">No active scan. Click below to launch a repository code audit.</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {lines.map((line, idx) => {
              const isSuccess = line.includes("PASSED");
              return (
                <div key={idx} className={isSuccess ? 'text-primary font-bold animate-pulse' : 'text-text-muted/80'}>
                  <span className="text-primary/40 mr-1.5 select-none">&gt;</span>
                  <span>{line}</span>
                </div>
              );
            })}
            {scanState === 'scanning' && (
              <div className="text-primary animate-pulse flex items-center gap-1.5 mt-1">
                <span className="text-primary/40 mr-1.5 select-none">&gt;</span>
                <span className="inline-block w-1.5 h-3 bg-primary animate-ping" />
                <span>Scanning engine active...</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Trigger Buttons */}
      <div className="pt-4 border-t border-surface-border/30 mt-3 flex items-center justify-end">
        {scanState === 'scanning' ? (
          <span className="font-mono text-[10px] text-primary animate-pulse flex items-center gap-1.5 uppercase font-bold">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Auditing Codebase
          </span>
        ) : (
          <button
            onClick={handleStartReview}
            className="px-4 py-2 rounded-lg bg-primary text-black font-semibold text-[10px] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-300 cursor-pointer flex items-center gap-1.5 uppercase font-mono tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Run New Code Review
          </button>
        )}
      </div>

    </div>
  );
};
