import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { CTAButton } from '../ui/CTAButton';

interface NavHeaderProps {
  navItems?: string[];
  onStartReview?: () => void;
}

export const NavHeader: React.FC<NavHeaderProps> = ({
  navItems = ['Home', 'Features'],
  onStartReview
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 mt-6 pointer-events-none"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-2.5 rounded-full bg-[#131314]/80 backdrop-blur-xl border border-surface-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] inner-glow-cyan pointer-events-auto w-full md:w-fit md:gap-12">
        <Link to="/" className="cursor-pointer flex-shrink-0">
          <Logo showText={true} />
        </Link>

        <nav className="hidden md:flex items-center gap-1 relative z-10">
          {navItems.map((item, idx) => {
            return (
              <NavLink
                key={item}
                to={item === 'Home' ? '/' : '/features'}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={({ isActive }) => 
                  `relative z-10 px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full select-none cursor-pointer block ${
                    isActive ? 'text-primary' : 'text-text-muted hover:text-white'
                  }`
                }
              >
                <AnimatePresence>
                  {hoveredIdx === idx && (
                    <motion.span
                      layoutId="navHoverBackground"
                      className="absolute inset-0 bg-[#3a393a]/40 rounded-full -z-20 border border-white/5 pointer-events-none"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30
                      }}
                    />
                  )}
                </AnimatePresence>
                {item}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex-shrink-0 hidden md:block">
          <CTAButton onClick={onStartReview} variant="primary" className="py-2.5 px-6 !text-xs">
            Start Reviewing
          </CTAButton>
        </div>

        <div className="md:hidden flex items-center">
          <button className="text-text-muted hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default NavHeader;
