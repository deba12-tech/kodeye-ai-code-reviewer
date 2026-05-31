import React from 'react';
import { ScanLine } from './ScanLine';
import { ScoreCardMini, SecurityCardMini, SuggestedFixCardMini } from './IssueCardMini';
import { Lock } from 'lucide-react';

export const CodeEditorPreview: React.FC = () => {
  return (
    <div className="relative w-full rounded-2xl border border-surface-border bg-[#0A0A0B]/85 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden z-10 inner-glow-card">
      <div className="h-12 border-b border-surface-border bg-surface/30 flex items-center px-5 gap-2 select-none">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500/20" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50 border border-yellow-500/20" />
          <div className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500/20" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-background border border-surface-border/40">
            <Lock className="w-3 h-3 text-text-muted" />
            <span className="font-mono text-xs text-text-muted">auth.ts — Kodeye Engine</span>
          </div>
        </div>
        <div className="w-16" />
      </div>

      <div className="flex flex-col md:flex-row h-[360px] relative overflow-hidden bg-background">
        <div className="hidden md:flex flex-col py-4 px-4 border-r border-surface-border/30 bg-background/50 font-mono text-[11px] text-text-muted/40 text-right select-none gap-2">
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>

        <div className="flex-1 p-4 relative overflow-hidden dark-grid-bg-fine">
          <ScanLine />

          <pre className="font-mono text-[11px] leading-relaxed text-text-muted overflow-x-auto select-none mt-1">
            <div><span className="text-secondary font-semibold">import</span> {'{'} verifyToken {'}'} <span className="text-secondary font-semibold">from</span> <span className="text-primary">'@kodeye/auth'</span>;</div>
            <div className="h-1.5" />
            <div><span className="text-secondary font-semibold">export async function</span> <span className="text-white font-semibold">handleRequest</span>(req, res) {'{'}</div>
            <div>  <span className="text-secondary font-semibold">const</span> token = req.headers.authorization;</div>
            <div className="h-1.5" />
            <div className="text-text-muted/40">  <span className="text-text-muted/40 font-semibold">// TODO: Implement proper caching</span></div>
            <div>  <span className="text-secondary font-semibold">if</span> (!token) {'{'}</div>
            <div>    <span className="text-secondary font-semibold">return</span> res.status(<span className="text-white font-semibold">401</span>).json({'{'} error: <span className="text-primary">'Unauthorized'</span> {'}'});</div>
            <div>  {'}'}</div>
            <div className="h-1.5" />
            <div>  <span className="text-secondary font-semibold">try</span> {'{'}</div>
            <div>    <span className="text-secondary font-semibold">const</span> user = <span className="text-secondary font-semibold">await</span> verifyToken(token);</div>
            <div>    <span className="text-secondary font-semibold">return</span> res.status(<span className="text-white font-semibold">200</span>).json({'{'} data: user {'}'});</div>
            <div>  {'}'} <span className="text-secondary font-semibold">catch</span> (err) {'{'}</div>
            <div>    <span className="text-secondary font-semibold">return</span> res.status(<span className="text-white font-semibold">500</span>).json({'{'} error: <span className="text-primary">'Internal'</span> {'}'});</div>
            <div>  {'}'}</div>
            <div>{'}'}</div>
          </pre>

          <div className="hidden lg:block">
            <ScoreCardMini />
            <SecurityCardMini />
            <SuggestedFixCardMini />
          </div>
        </div>
      </div>
    </div>
  );
};
