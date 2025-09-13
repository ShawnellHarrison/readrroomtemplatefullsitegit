import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface AffiliateAdProps {
  className?: string;
  size?: 'compact' | 'standard' | 'featured';
}

export const AffiliateAd: React.FC<AffiliateAdProps> = ({ 
  className = '', 
  size = 'standard' 
}) => {
  const handleClick = () => {
    // Track affiliate click
    if (window.gtag) {
      window.gtag('event', 'affiliate_click', {
        event_category: 'affiliate',
        event_label: 'kitchenaid_can_opener',
        value: 1
      });
    }
    window.open('https://amzn.to/412wEqf', '_blank', 'noopener,noreferrer');
  };

  if (size === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`${className}`}
      >
        <GlassCard hover onClick={handleClick} className="p-4 cursor-pointer">
          <div className="flex items-center space-x-3">
            <img
              src="https://m.media-amazon.com/images/I/51yO+bt+mqL._AC_SX679_.jpg"
              alt="KitchenAid Classic Multifunction Can Opener"
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">
                KitchenAid Can Opener
              </h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                ))}
                <span className="text-xs text-gray-300 ml-1">4.5/5</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-400 flex-shrink-0" />
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  if (size === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className={`${className}`}
      >
        <GlassCard hover onClick={handleClick} className="p-6 cursor-pointer">
          <div className="text-center">
            <div className="mb-4">
              <img
                src="https://m.media-amazon.com/images/I/51yO+bt+mqL._AC_SX679_.jpg"
                alt="KitchenAid Classic Multifunction Can Opener"
                className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg"
              />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              KitchenAid Classic Can Opener
            </h3>
            <div className="flex items-center justify-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
              <span className="text-sm text-gray-300 ml-2">4.5/5 (2,847 reviews)</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Essential kitchen tool with comfortable grip and sharp cutting wheel
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
              <span className="font-semibold">View on Amazon</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  // Standard size
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${className}`}
    >
      <GlassCard hover onClick={handleClick} className="p-5 cursor-pointer">
        <div className="flex items-center space-x-4">
          <img
            src="https://m.media-amazon.com/images/I/51yO+bt+mqL._AC_SX679_.jpg"
            alt="KitchenAid Classic Multifunction Can Opener"
            className="w-16 h-16 object-cover rounded-lg shadow-md"
          />
          <div className="flex-1">
            <h4 className="text-base font-semibold text-white mb-1">
              KitchenAid Classic Can Opener
            </h4>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
              ))}
              <span className="text-xs text-gray-300 ml-1">4.5/5</span>
            </div>
            <p className="text-xs text-gray-300">
              Multifunction kitchen essential
            </p>
          </div>
          <div className="flex items-center text-blue-400">
            <ExternalLink className="w-5 h-5" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};