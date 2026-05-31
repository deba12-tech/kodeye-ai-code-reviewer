import React from 'react';
import { CodeEditorPreview } from './CodeEditorPreview';
import { 
  LayoutDashboard, 
  Terminal, 
  ShieldAlert, 
  Settings, 
  Layers, 
  FileCode2,
  CheckCircle,
  Activity,
  History
} from 'lucide-react';

export const ProductPreview: React.FC = () => {
  return (
    <div className="w-full bg-[#080809] border border-surface-border rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.03)] flex">
      <div className="w-16 border-r border-surface-border bg-background flex flex-col items-center py-6 justify-between select-none shrink-0">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,229,255,0.1)]">
            <span className="font-sans font-bold text-sm">K</span>
          </div>

          <div className="h-[1px] w-8 bg-surface-border/80 my-2" />

          <div className="flex flex-col gap-4 w-full px-2">
            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-primary bg-primary/5 border border-primary/20 shadow-[0_0_10px_rgba(0,229,255,0.05)] cursor-pointer">
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer">
              <Terminal className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer">
              <ShieldAlert className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer">
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 border-b border-surface-border bg-background/50 px-6 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <FileCode2 className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs font-semibold text-white">auth-service</span>
            <span className="text-text-muted/30">/</span>
            <span className="font-mono text-xs text-text-muted">src</span>
            <span className="text-text-muted/30">/</span>
            <span className="font-mono text-xs text-text-muted">auth.ts</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              <span className="font-mono text-[10px] text-green-400 tracking-wider font-semibold uppercase">Engine Active</span>
            </div>
            <div className="h-4 w-[1px] bg-surface-border/80" />
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-[10px] text-text-muted uppercase">Latency: <span className="text-primary font-semibold">12ms</span></span>
            </div>
            <div className="h-4 w-[1px] bg-surface-border/80" />
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-secondary" />
              <span className="font-mono text-[10px] text-text-muted uppercase">Latest Scan: <span className="text-secondary font-semibold">Just Now</span></span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-background/30">
          <CodeEditorPreview />
        </div>
      </div>
    </div>
  );
};
