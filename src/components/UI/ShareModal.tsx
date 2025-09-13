import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';
import { SharePromptData, getShareMessage, handleShare } from '../../utils/threadsSharing';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  data: SharePromptData;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, type, data }) => {
  const handleShareClick = () => {
    handleShare(type, data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 text-center">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{getShareMessage(type)}</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <NeonButton
                  onClick={handleShareClick}
                  className="w-full bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.78c0-4.725 1.76-8.22 5.101-10.124C8.5 1.485 10.6 1.02 12.86 1.02c3.581.024 6.334 1.205 8.184 3.509C22.65 6.56 23.5 9.414 23.5 12.22c0 4.725-1.76 8.22-5.101 10.124C16.5 23.515 14.4 23.98 12.186 24z"/>
                  </svg>
                  Share on Threads
                </NeonButton>
                
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};