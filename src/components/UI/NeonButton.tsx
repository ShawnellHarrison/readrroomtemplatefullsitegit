import React from 'react';
import { motion } from 'framer-motion';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  type?: 'button' | 'submit';
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  disabled = false,
  size = 'md',
  variant = 'primary',
  className = '',
  type = 'button'
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'shadow-[0_0_12px_rgba(0,255,255,0.6)] hover:shadow-[0_0_18px_rgba(0,255,255,0.9)]',
    secondary: 'shadow-[0_0_12px_rgba(139,92,246,0.6)] hover:shadow-[0_0_18px_rgba(139,92,246,0.9)]',
    success: 'shadow-[0_0_12px_rgba(34,197,94,0.6)] hover:shadow-[0_0_18px_rgba(34,197,94,0.9)]',
    danger: 'shadow-[0_0_12px_rgba(239,68,68,0.6)] hover:shadow-[0_0_18px_rgba(239,68,68,0.9)]'
  };

  const gradientClasses = {
    primary: 'from-cyan-400 via-fuchsia-400 to-cyan-400',
    secondary: 'from-purple-400 via-pink-400 to-purple-400',
    success: 'from-green-400 via-blue-400 to-green-400',
    danger: 'from-red-400 via-pink-400 to-red-400'
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={[
        'relative inline-flex items-center justify-center rounded-2xl font-semibold',
        'transition-transform duration-150 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'bg-black/70 text-white',
        'focus:ring-cyan-300 ring-offset-black',
        sizeClasses[size],
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      <span 
        className={`absolute inset-0 rounded-2xl blur-md opacity-60 pointer-events-none bg-gradient-to-r ${gradientClasses[variant]}`} 
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};