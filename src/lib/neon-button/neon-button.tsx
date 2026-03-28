import React from 'react';

export interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  glow?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  glow = true,
  ...props
}) => {
  const variants = {
    primary: 'bg-neon-green text-black hover:bg-neon-green/90 shadow-[0_0_15px_-5px_rgba(0,255,136,0.5)]',
    secondary: 'bg-neon-blue text-white hover:bg-neon-blue/90 shadow-[0_0_15px_-5px_rgba(0,107,255,0.5)]',
    outline: 'bg-transparent border border-border text-foreground hover:bg-accent hover:text-accent-foreground',
    ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent',
    danger: 'bg-neon-red text-white hover:bg-neon-red/90 shadow-[0_0_15px_-5px_rgba(255,59,48,0.5)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-medium',
    md: 'px-4 py-2 text-sm font-semibold',
    lg: 'px-6 py-3 text-base font-bold',
    icon: 'p-2',
  };

  const glowClass = glow && variant !== 'ghost' && variant !== 'outline' ? 'active:scale-95' : '';

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${glowClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
