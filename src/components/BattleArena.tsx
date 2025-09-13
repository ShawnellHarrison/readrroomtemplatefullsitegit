import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Users, Clock, Trophy, Star, Calendar, Share2 } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { NeonButton } from './UI/NeonButton';
import { CreateBattleModal } from './CreateBattleModal';
import { BattleViewer } from './BattleViewer';
import { useBattles } from '../hooks/useBattles';
import { updateMetaTags, getBattleMetaData } from '../utils/seo';

interface BattleArenaProps {
  battleType: 'movie' | 'book' | 'game' | 'music' | 'food';
  onBack: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ battleType, onBack }) => {
  const [view, setView] = useState<'list' | 'create' | 'battle'>('list');
  const [currentBattleId, setCurrentBattleId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { battles, loading, error, createBattle, getBattle } = useBattles(battleType);

  // Update SEO meta tags
  useEffect(() => {
    if (view === 'list') {
      const metaData = getBattleMetaData(battleType);
      updateMetaTags(metaData);
    } else if (view === 'battle' && currentBattleId) {
      const battle = getBattle(currentBattleId);
      if (battle) {
        const metaData = getBattleMetaData(battleType, battle.title, battle.itemA, battle.itemB);
        updateMetaTags(metaData);
      }
    }
  }, [view, currentBattleId, battleType, getBattle]);

  // Check URL for battle parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const battleId = urlParams.get(`${battleType}-battle`);
    
    if (battleId) {
      setCurrentBattleId(battleId);
      setView('battle');
    }
  }, [battleType]);

  const handleViewBattle = (battleId: string) => {
    setCurrentBattleId(battleId);
    setView('battle');
    
    const url = new URL(window.location.href);
    url.searchParams.set(`${battleType}-battle`, battleId);
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToList = () => {
    setView('list');
    setCurrentBattleId(null);
    
    const url = new URL(window.location.href);
    url.searchParams.delete(`${battleType}-battle`);
    window.history.pushState({}, '', url.toString());
  };

  const handleCreateBattle = async (battleData: any) => {
    try {
      const battleId = await createBattle(battleData);
      setShowCreateModal(false);
      handleViewBattle(battleId);
    } catch (error) {
      console.error('Failed to create battle:', error);
      throw error;
    }
  };

  const getArenaConfig = () => {
    const configs = {
      movie: {
        title: 'Movie Battle Arena',
        icon: '🎬',
        gradient: 'from-purple-900 via-blue-900 to-indigo-900',
        description: 'Epic movie showdowns decided by the crowd'
      },
      book: {
        title: 'Book Battle Arena',
        icon: '📚',
        gradient: 'from-amber-900 via-orange-900 to-red-900',
        description: 'Literary showdowns decided by readers'
      },
      game: {
        title: 'Game Battle Arena',
        icon: '🎮',
        gradient: 'from-purple-900 via-blue-900 to-indigo-900',
        description: 'Gaming showdowns decided by players'
      },
      music: {
        title: 'Music Battle Royale',
        icon: '🎵',
        gradient: 'from-pink-900 via-purple-900 to-blue-900',
        description: 'Musical showdowns decided by fans'
      },
      food: {
        title: 'Food Wars Arena',
        icon: '🍽️',
        gradient: 'from-orange-900 via-red-900 to-pink-900',
        description: 'Culinary showdowns decided by foodies'
      }
    };
    return configs[battleType];
  };

  const config = getArenaConfig();

  if (view === 'battle' && currentBattleId) {
    return (
      <BattleViewer
        battleId={currentBattleId}
        battleType={battleType}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            {config.icon}
          </motion.div>
          <p className="text-white text-xl">Loading epic battles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient} p-4`}>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center text-blue-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          
          <div className="text-center mb-8">
            <motion.h1 
              className="text-6xl font-black text-white mb-4 flex items-center justify-center"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(59,130,246,0.5)',
                  '0 0 40px rgba(147,51,234,0.5)',
                  '0 0 20px rgba(59,130,246,0.5)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-6xl mr-4">{config.icon}</span>
              {config.title}
            </motion.h1>
            <p className="text-2xl text-gray-300 mb-8">{config.description}</p>
            <NeonButton onClick={() => setShowCreateModal(true)} size="lg">
              <Plus className="w-6 h-6 mr-2" />
              Create New Battle
            </NeonButton>
          </div>
        </motion.div>

        {/* Battles Grid */}
        {battles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {battles.map((battle, index) => (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover onClick={() => handleViewBattle(battle.id)} className="p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white truncate pr-2">
                      {battle.title}
                    </h3>
                    {battle.isEnded && (
                      <div className="flex items-center text-yellow-400">
                        <Trophy className="w-4 h-4 mr-1" />
                        <span className="text-xs font-semibold">ENDED</span>
                      </div>
                    )}
                  </div>

                  {battle.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {battle.description}
                    </p>
                  )}

                  {/* Battle Preview */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-2xl">{config.icon}</span>
                      </div>
                      <div className="text-xs text-red-400 font-bold">
                        {battle.itemA?.votes || 0} votes
                      </div>
                    </div>
                    <div className="text-white font-bold text-xl">VS</div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-2xl">{config.icon}</span>
                      </div>
                      <div className="text-xs text-green-400 font-bold">
                        {battle.itemB?.votes || 0} votes
                      </div>
                    </div>
                  </div>

                  {/* Battle Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-white/90">
                      <Users className="w-4 h-4 mr-1" />
                      {battle.totalVotes} votes
                    </div>
                    <div className={`flex items-center font-semibold ${
                      battle.isEnded ? 'text-red-300' : 'text-yellow-300'
                    }`}>
                      <Clock className="w-4 h-4 mr-1" />
                      {battle.timeLeft}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <div className="text-8xl mb-6">{config.icon}</div>
              <h3 className="text-3xl font-bold text-white mb-4">No battles yet</h3>
              <p className="text-gray-300 text-lg mb-8">
                Be the first to create an epic showdown!
              </p>
              <NeonButton onClick={() => setShowCreateModal(true)} size="lg">
                <Plus className="w-6 h-6 mr-2" />
                Create First Battle
              </NeonButton>
            </motion.div>
          </div>
        )}
      </div>

      <CreateBattleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        battleType={battleType}
        onCreateBattle={handleCreateBattle}
      />
    </div>
  );
};