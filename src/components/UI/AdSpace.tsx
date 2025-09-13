import React from 'react';

interface AdSpaceProps {
  size: 'banner' | 'rectangle' | 'leaderboard';
  adSlot?: string;
  className?: string;
}

export const AdSpace: React.FC<AdSpaceProps> = ({ size, adSlot, className = '' }) => {
  const sizeClasses = {
    banner: 'w-full h-24',
    rectangle: 'w-full h-40',
    leaderboard: 'w-full h-24'
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      bg-black/20 border border-white/15 rounded-xl 
      flex items-center justify-center text-white/70 text-sm
      ${className}
    `}>
      Ad Space ({size})
      {adSlot && <span className="ml-2 text-xs opacity-50">#{adSlot}</span>}
    </div>
  );
};