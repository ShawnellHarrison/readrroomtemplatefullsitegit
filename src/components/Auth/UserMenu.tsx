import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Trophy, Swords, MessageSquare, ChevronDown } from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';
import { useAuth } from '../../contexts/AuthContext';

export const UserMenu: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user || !profile) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile.display_name || profile.username || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </div>
        <span className="font-semibold hidden sm:block">{displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 z-50"
            >
              <GlassCard className="p-6">
                {/* User Info */}
                <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(displayName)
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{displayName}</h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-lg mx-auto mb-1">
                      <Trophy className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-white font-bold text-lg">{profile.total_votes}</div>
                    <div className="text-gray-400 text-xs">Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-lg mx-auto mb-1">
                      <Swords className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="text-white font-bold text-lg">{profile.total_battles_created}</div>
                    <div className="text-gray-400 text-xs">Battles</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-lg mx-auto mb-1">
                      <MessageSquare className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-white font-bold text-lg">{profile.total_arguments}</div>
                    <div className="text-gray-400 text-xs">Arguments</div>
                  </div>
                </div>

                {/* Reputation */}
                <div className="mb-6 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-semibold">Reputation</span>
                    <span className="text-yellow-400 font-bold">{profile.reputation_score}</span>
                  </div>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                      style={{ width: `${Math.min(100, (profile.reputation_score / 1000) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Preferences</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};