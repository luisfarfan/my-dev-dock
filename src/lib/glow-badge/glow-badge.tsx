import React from 'react';

export interface GlowBadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'blue' | 'yellow' | 'red';
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const GlowBadge: React.FC<GlowBadgeProps> = ({
  children,
  color = 'green',
  size = 'sm',
  pulse = false,
  className = '',
}) => {
  const colors = {
    green: 'bg-neon-green/15 text-neon-green border-neon-green/40 shadow-[0_0_12px_-2px_rgba(0,255,136,0.35)]',
    blue: 'bg-neon-blue/15 text-neon-blue border-neon-blue/40 shadow-[0_0_12px_-2px_rgba(0,107,255,0.35)]',
    yellow: 'bg-neon-yellow/15 text-neon-yellow border-neon-yellow/40 shadow-[0_0_12px_-2px_rgba(255,184,0,0.35)]',
    red: 'bg-neon-red/15 text-neon-red border-neon-red/40 shadow-[0_0_12px_-2px_rgba(255,59,48,0.35)]',

  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider',
    sm: 'px-2 py-1 text-xs font-semibold',
    md: 'px-3 py-1.5 text-sm font-semibold',
  };

  const pulseClass = pulse ? 'animate-glow-pulse' : '';

  return (
    <span
      className={`
        inline-flex items-center justify-center border rounded-full transition-all duration-300
        ${colors[color]}
        ${sizes[size]}
        ${pulseClass}
        ${className}
      `}
    >
      {pulse && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full mr-1.5
            ${color === 'green' ? 'bg-neon-green' : ''}
            ${color === 'blue' ? 'bg-neon-blue' : ''}
            ${color === 'yellow' ? 'bg-neon-yellow' : ''}
            ${color === 'red' ? 'bg-neon-red' : ''}
          `}
        />
      )}
      {children}
    </span>
  );
};
