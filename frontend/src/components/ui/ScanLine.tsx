import React from 'react';

export const ScanLine: React.FC = () => {
  return (
    <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent shadow-[0_0_12px_3px_rgba(0,229,255,0.4)] pointer-events-none animate-scanline z-10" />
  );
};
