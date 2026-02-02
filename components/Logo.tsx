import React from 'react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg', className?: string }> = ({ size = 'md', className = '' }) => {
  const dim = size === 'sm' ? 24 : size === 'md' ? 48 : 80;
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
        <svg width={dim} height={dim} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* The Fork Handle / Lightning Bolt */}
            <path d="M45 90V60C45 55 35 55 35 45V20" stroke="#F97316" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M55 90V60C55 55 65 55 65 45V20" stroke="#F97316" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M50 90V55" stroke="#F97316" strokeWidth="8" strokeLinecap="round"/>
            {/* The Spark */}
            <path d="M50 10L60 25L40 25L50 40" fill="#EAB308" stroke="#EAB308" strokeWidth="4" strokeLinejoin="round"/>
        </svg>
        <span className={`font-bold tracking-tighter text-slate-900 ml-2 ${size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-5xl'}`}>
            Fork<span className="text-orange-500">It</span>
        </span>
    </div>
  );
};
