import React, { useState } from 'react';
import { Sparkles, Terminal, RefreshCw } from 'lucide-react';
import { ScanLine } from '../ui/ScanLine';

export const QuickActionCard: React.FC = () => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [lines, setLines] = useState<string[]>([]);
  
  const handleStartReview = () => {
    setScanState('scanning');
    setLines([]);
    
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
    <div className="bg-[#121215]/80 border border-[#1A1A1E] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-primary/20 shadow-lg flex flex-col justify-between h-[280px] inner-glow-card select-none text-left">
      
      <div className="flex items-center justify-between border-b border-[#1A1A1E]/50 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/5 border border-primary/20 text-primary">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Quick Action Console</h3>
            <p className="text-[10px] text-[#A1A1AA]/60 mt-0.5">Audit files or repository branches instantly.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full bg-[#0C0C0E] border border-[#1A1A1E] rounded-xl p-3 font-mono text-[9px] text-[#A1A1AA] leading-relaxed relative overflow-hidden h-32 flex flex-col justify-between select-text">
        
        {scanState === 'scanning' && <ScanLine />}

        {scanState === 'idle' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 select-none">
            <div className="w-8 h-8 rounded-xl bg-[#070708] border border-[#1A1A1E] flex items-center justify-center text-[#A1A1AA]/40">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] text-[#A1A1AA]/50 leading-relaxed max-w-[200px]">No active scan. Click below to launch a repository code audit.</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {lines.map((line, idx) => {
              const isSuccess = line.includes("PASSED");
              return (
                <div key={idx} className={isSuccess ? 'text-primary font-bold' : 'text-[#A1A1AA]/70'}>
                  <span className="text-primary/40 mr-1.5 select-none">&gt;</span>
                  <span>{line}</span>
                </div>
              );
            })}
            {scanState === 'scanning' && (
              <div className="text-primary flex items-center gap-1.5 mt-1 animate-pulse">
                <span className="text-primary/40 mr-1.5 select-none">&gt;</span>
                <span className="inline-block w-1.5 h-3 bg-primary" />
                <span>Scanning engine active...</span>
              </div>
            )}
          </div>
        )}

      </div>

      <div className="pt-4 border-t border-[#1A1A1E]/50 mt-3 flex items-center justify-end">
        {scanState === 'scanning' ? (
          <span className="font-mono text-[10px] text-primary flex items-center gap-1.5 uppercase font-bold">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Auditing Codebase
          </span>
        ) : (
          <button
            onClick={handleStartReview}
            className="px-4 py-2 rounded-xl bg-primary text-black font-extrabold text-[10px] hover:shadow-[0_0_15px_rgba(0,229,255,0.25)] transition-all duration-300 cursor-pointer flex items-center gap-1.5 uppercase font-mono tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            Run Audit
          </button>
        )}
      </div>

    </div>
  );
};
