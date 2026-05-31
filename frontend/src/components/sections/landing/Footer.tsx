import React from 'react';
import { Logo } from '../../ui/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full border-t border-surface-border bg-background z-10 py-10 select-none">
      <div className="absolute inset-0 dark-grid-bg-fine opacity-20 pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 w-full">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 pb-8">
          <div className="space-y-3 text-left">
            <Logo showText={true} />
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
              AI-powered code review and bug tracking for developers.
            </p>
          </div>
        </div>

        <div className="border-t border-surface-border pt-6 flex items-center">
          <div className="text-[10px] text-text-secondary font-mono">
            &copy; 2026 Kodeye. Built for secure code reviews.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
