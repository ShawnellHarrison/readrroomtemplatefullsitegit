import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Calendar, ArrowLeft, Copy, Check, QrCode, Clock, Vote, BarChart3, TrendingUp, Lightbulb } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { NeonButton } from './UI/NeonButton';
import { QRCodeGenerator } from './UI/QRCodeGenerator';
import { BattleCreator } from './BattleSystem/BattleCreator';
import { AdSpace } from './UI/AdSpace';
import { AffiliateAd } from './UI/AffiliateAd';
import { useBattleSystem } from '../hooks/useBattleSystem';
import { trackEvent } from '../utils/analytics';

interface HostDashboardProps {
  onBack: () => void;
  onEnterVote: (battleId: string) => void;
  onMovieBattle: () => void;
  onBookBattle: () => void;
  onGameBattle: () => void;
  onMusicBattle: () => void;
  onFoodBattle: () => void;
  onTrending: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({ onBack, onEnterVote, onMovieBattle, onBookBattle, onGameBattle, onMusicBattle, onFoodBattle, onTrending }) => {
  const { battles, loading, error } = useBattleSystem();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedVoteId, setCopiedVoteId] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  const copyVoteLink = async (battleId: string) => {
    const link = `${window.location.origin}?room=${battleId}`;
    await navigator.clipboard.writeText(link);
    trackEvent('vote_shared', { battle_id: battleId, method: 'copy' });
    setCopiedVoteId(battleId);
    setTimeout(() => setCopiedVoteId(null), 2000);
  };

  const showQRCodeModal = (battleId: string) => {
    setShowQRCode(battleId);
    trackEvent('vote_shared', { battle_id: battleId, method: 'qr' });
  };

  const handleBattleCreated = (battleId: string) => {
    setShowCreateForm(false);
    onEnterVote(battleId);
  };

  const getTimeLeft = (endsAt?: Date) => {
    if (!endsAt) return null;
    
    const now = new Date().getTime();
    const end = new Date(endsAt).getTime();
    const difference = end - now;
    
    if (difference <= 0) return 'Ended';
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const getVotingMethodIcon = (type: string) => {
    switch (type) {
      case 'yes-no': return Vote;
      case 'multiple-choice': return Users;
      case 'scale': return BarChart3;
      case 'ranked-choice': return TrendingUp;
      default: return Vote;
    }
  };

  const getVotingMethodColor = (type: string) => {
    switch (type) {
      case 'yes-no': return 'from-green-500 to-blue-500';
      case 'multiple-choice': return 'from-purple-500 to-pink-500';
      case 'scale': return 'from-blue-500 to-purple-500';
      case 'ranked-choice': return 'from-orange-500 to-red-500';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  if (showCreateForm) {
    return (
      <BattleCreator
        onBack={() => setShowCreateForm(false)}
        onBattleCreated={handleBattleCreated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Voting Dashboard</h1>
          <p className="text-gray-300">Create and manage your group voting sessions</p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
              {error}
            </div>
          )}
          
          {/* Ad Space */}
          <div className="mt-6">
            <AdSpace size="banner" adSlot="dashboard-banner" />
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white mt-2">Loading voting sessions...</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Voting Session */}
          <GlassCard hover onClick={() => setShowCreateForm(true)} className="p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <Plus className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Create Voting Session</h3>
            <p className="text-gray-300">Start a new group vote or decision</p>
          </GlassCard>

          {/* Templates */}
          <GlassCard hover onClick={onMovieBattle} className="p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-500 to-purple-600 rounded-full flex items-center justify-center text-3xl"
            >
              🎬
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Movie Battle Arena</h3>
            <p className="text-gray-300">Epic movie showdowns with swipe voting</p>
          </GlassCard>
          
          <GlassCard hover onClick={onBookBattle} className="p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-3xl"
            >
              📚
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Book Battle Arena</h3>
            <p className="text-gray-300">Literary showdowns with swipe voting</p>
          </GlassCard>
          
          <GlassCard hover onClick={onGameBattle} className="p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -10 }}
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl"
            >
              🎮
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Game Battle Arena</h3>
            <p className="text-gray-300">Gaming showdowns with swipe voting</p>
          </GlassCard>
          
          <GlassCard hover onClick={onMusicBattle} className="p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-3xl"
            >
              🎵
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Music Battle Royale</h3>
            <p className="text-gray-300">Epic music showdowns with swipe voting</p>
          </GlassCard>
          
          <GlassCard hover onClick={onFoodBattle} className="p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -10 }}
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-3xl"
            >
              🍽️
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Food Wars Arena</h3>
            <p className="text-gray-300">Delicious food battles with swipe voting</p>
          </GlassCard>
          
          <GlassCard hover onClick={onTrending} className="p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center text-3xl"
            >
              🔥
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Trending Battles</h3>
            <p className="text-gray-300">Vote on what's hot right now</p>
          </GlassCard>
          
          {/* Display Active Voting Sessions */}
          {battles && battles.map((battle, index) => {
            const timeLeft = getTimeLeft(battle.endsAt);
            const VotingIcon = Vote; // All battles use the same voting icon now
            
            return (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <VotingIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{battle.title}</h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-300">
                          <span>Multiple Choice</span>
                          {battle.votes.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{battle.votes.length} votes</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-xs">Live</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-gray-300 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{battle.votes.length} votes</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {new Date(battle.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {timeLeft && (
                    <div className="mb-4 p-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                      <div className="flex items-center text-yellow-400 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {timeLeft}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <NeonButton
                      onClick={() => onEnterVote(battle.id)}
                      size="sm"
                      className="flex-1 text-sm"
                    >
                      Enter Voting
                    </NeonButton>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => showQRCodeModal(battle.id)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyVoteLink(battle.id)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                    >
                      {copiedVoteId === battle.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Ads */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <AdSpace size="rectangle" />
          <AffiliateAd size="featured" />
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <QRCodeGenerator
          roomId={showQRCode}
          roomTitle={battles?.find(b => b.id === showQRCode)?.title || 'Voting Session'}
          onClose={() => setShowQRCode(null)}
        />
      )}
    </div>
  );
};