import React from 'react';
import { motion } from 'framer-motion';

interface CTAButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  if (variant === 'primary') {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/5 bg-[var(--shiny-cta-bg)] px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:ring-2 hover:ring-[var(--shiny-cta-highlight)] hover:ring-offset-2 hover:ring-offset-black cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.15)] ${className}`}
        {...props}
      >
        <span className="absolute inset-0 z-0 h-full w-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="absolute -left-[20%] -top-[20%] -z-10 h-[140%] w-[140%] animate-shiny-cta-bg bg-[radial-gradient(circle_at_50%_50%,_var(--shiny-cta-highlight)_0%,_transparent_50%)] opacity-25 blur-[20px] pointer-events-none" />
        
        <div className="absolute inset-[1px] -z-10 rounded-full bg-[var(--shiny-cta-bg)]" />
        
        <div 
          className="absolute inset-[1px] -z-10 rounded-full opacity-30" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--shiny-cta-highlight-subtle) 1px, transparent 0)', 
            backgroundSize: '8px 8px' 
          }}
        />

        <div className="absolute -top-1/2 left-1/2 h-[200%] w-[20%] -translate-x-1/2 rotate-45 bg-gradient-to-r from-transparent via-[var(--shiny-cta-highlight)]/30 to-transparent blur-[10px] transform -translate-x-[200%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out" />
        
        <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-[var(--shiny-cta-hover-text)]">
          {children}
        </span>
        
        <div className="absolute inset-0 -z-10 rounded-full ring-1 ring-inset ring-white/10 group-hover:ring-[var(--shiny-cta-highlight)]/50 transition-all duration-300" />
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden neon-btn neon-btn-ghost text-sm font-medium tracking-wide cursor-pointer py-3.5 px-8 transition-all duration-300 group ${className}`}
      {...props}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <span className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
