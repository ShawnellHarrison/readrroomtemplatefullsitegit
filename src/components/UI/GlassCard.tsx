import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  onClick 
}) => {
  const Component = onClick ? motion.div : 'div';
  
  return (
    <Component
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        glass-card rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-xl
        ${hover ? 'hover:bg-white/15 hover:border-white/25 transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
};