import React from 'react';
import logoImg from '../../assets/logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="w-8 h-8 rounded-full overflow-hidden border border-surface-border bg-background flex items-center justify-center inner-glow-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)]">
        <img
          src={logoImg}
          alt="Kodeye Logo"
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <span className="font-sans text-xl font-bold tracking-tight text-on-surface bg-clip-text bg-gradient-to-r from-white to-text-muted">
          Kodeye
        </span>
      )}
    </div>
  );
};
