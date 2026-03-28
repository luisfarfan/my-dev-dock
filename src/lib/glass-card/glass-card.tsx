import React from 'react';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'green' | 'blue' | 'yellow' | 'red' | 'none';
  onClick?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
  hoverable = false,
  style,
}) => {
  const glowClasses = {
    green: 'hover:border-neon-green/50 hover:shadow-[0_0_20px_-5px_rgba(0,255,136,0.3)]',
    blue: 'hover:border-neon-blue/50 hover:shadow-[0_0_20px_-5px_rgba(0,107,255,0.3)]',
    yellow: 'hover:border-neon-yellow/50 hover:shadow-[0_0_20px_-5px_rgba(255,184,0,0.3)]',
    red: 'hover:border-neon-red/50 hover:shadow-[0_0_20px_-5px_rgba(255,59,48,0.3)]',
    none: '',
  };

  const cursorClass = onClick || hoverable ? 'cursor-pointer' : '';
  const hoverClass = hoverable ? 'hover:scale-[1.01] active:scale-[0.99] transition-transform' : '';

  return (
    <div
      onClick={onClick}
      style={style}
      className={`
        bg-card/50 backdrop-blur-glass border border-border rounded-xl
        p-4 transition-all duration-300
        ${glowClasses[glow]}
        ${cursorClass}
        ${hoverClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
