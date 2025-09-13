import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { NeonButton } from './UI/NeonButton';

interface JoinRoomModalProps {
  onClose: () => void;
  onJoinRoom: (roomId: string) => Promise<void>;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ onClose, onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    
    setLoading(true);
    try {
      await onJoinRoom(roomId.trim());
    } catch (error) {
      alert('Error finding room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Join Room</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Room ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                placeholder="Enter room ID"
                autoFocus
              />
            </div>

            <div className="flex gap-4">
              <NeonButton
                type="submit"
                disabled={!roomId.trim() || loading}
                className="flex-1"
              >
                <Users className="w-5 h-5 mr-2" />
                {loading ? 'Finding...' : 'Join Room'}
              </NeonButton>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};