import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Siren as Fire, Clock, Users, Star, ArrowLeft, Share2, Trophy } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { NeonButton } from './UI/NeonButton';
import { AdSpace } from './UI/AdSpace';
import { useMovieBattles } from '../hooks/useMovieBattles';
import { useBookBattles } from '../hooks/useBookBattles';
import { useGameBattles } from '../hooks/useGameBattles';
import { useMusicBattles } from '../hooks/useMusicBattles';
import { useFoodBattles } from '../hooks/useFoodBattles';
import { updateMetaTags, getTrendingMetaData } from '../utils/seo';

interface TrendingBattlesProps {
  onBack: () => void;
  onViewBattle: (battleType: string, battleId: string) => void;
}

export const TrendingBattles: React.FC<TrendingBattlesProps> = ({ onBack, onViewBattle }) => {
  const [timeFilter, setTimeFilter] = useState<'1h' | '24h' | '7d' | 'all'>('24h');
  
  const movieBattles = useMovieBattles();
  const bookBattles = useBookBattles();
  const gameBattles = useGameBattles();
  const musicBattles = useMusicBattles();
  const foodBattles = useFoodBattles();

  // Update SEO meta tags
  useEffect(() => {
    const metaData = getTrendingMetaData();
    updateMetaTags(metaData);
  }, []);

  const getAllBattles = () => {
    const allBattles = [
      ...movieBattles.battles.map(b => ({ ...b, type: 'movie', icon: '🎬', color: 'from-purple-500 to-blue-500' })),
      ...bookBattles.battles.map(b => ({ ...b, type: 'book', icon: '📚', color: 'from-amber-500 to-orange-500' })),
      ...gameBattles.battles.map(b => ({ ...b, type: 'game', icon: '🎮', color: 'from-purple-500 to-indigo-500' })),
      ...musicBattles.battles.map(b => ({ ...b, type: 'music', icon: '🎵', color: 'from-pink-500 to-purple-500' })),
      ...foodBattles.battles.map(b => ({ ...b, type: 'food', icon: '🍽️', color: 'from-orange-500 to-red-500' }))
    ];

    // Sort by activity (votes + arguments + recency)
    return allBattles
      .map(battle => ({
        ...battle,
        activity: battle.totalVotes + (battle.arguments?.length || 0) + 
                 (Date.now() - new Date(battle.createdAt).getTime() < 24 * 60 * 60 * 1000 ? 10 : 0)
      }))
      .sort((a, b) => b.activity - a.activity)
      .slice(0, 12);
  };

  const trendingBattles = getAllBattles();
  const loading = movieBattles.loading || bookBattles.loading || gameBattles.loading || musicBattles.loading || foodBattles.loading;

  const getTimeLeft = (endsAt: Date) => {
    const now = new Date().getTime();
    const end = new Date(endsAt).getTime();
    const difference = end - now;
    
    if (difference <= 0) return { label: 'Ended', ended: true };
    
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return { label: `${days}d ${hours % 24}h`, ended: false };
    if (hours > 0) return { label: `${hours}h`, ended: false };
    
    return { label: 'Ending soon', ended: false };
  };

  const getVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const getBattleTitle = (battle: any) => {
    if (battle.type === 'movie') return `${battle.movieA.title} vs ${battle.movieB.title}`;
    if (battle.type === 'book') return `${battle.bookA.title} vs ${battle.bookB.title}`;
    if (battle.type === 'game') return `${battle.gameA.name} vs ${battle.gameB.name}`;
    if (battle.type === 'music') return `${battle.itemA.name} vs ${battle.itemB.name}`;
    if (battle.type === 'food') return `${battle.foodA.name} vs ${battle.foodB.name}`;
    return battle.title;
  };

  const handleShareBattle = (battle: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareText = `🔥 TRENDING BATTLE!\n\n${getBattleTitle(battle)}\n\n${battle.totalVotes} votes and counting!\n\nJoin the hottest debate right now!`;
    
    if (navigator.share) {
      navigator.share({
        title: battle.title,
        text: shareText,
        url: `${window.location.origin}?${battle.type}-battle=${battle.id}`
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}?${battle.type}-battle=${battle.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <TrendingUp className="w-16 h-16 text-red-400" />
          </motion.div>
          <p className="text-white text-xl">Loading trending battles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 p-4">
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
                  '0 0 20px rgba(239,68,68,0.5)',
                  '0 0 40px rgba(236,72,153,0.5)',
                  '0 0 20px rgba(239,68,68,0.5)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Fire className="w-16 h-16 mr-4 text-red-400" />
              </motion.div>
              Trending Battles
            </motion.h1>
            <p className="text-2xl text-gray-300 mb-8">Vote on what's hot right now</p>
          </div>

          {/* Time Filters */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white/10 rounded-xl p-1">
              {[
                { value: '1h', label: 'Last Hour' },
                { value: '24h', label: 'Today' },
                { value: '7d', label: 'This Week' },
                { value: 'all', label: 'All Time' }
              ].map((filter) => (
                <motion.button
                  key={filter.value}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setTimeFilter(filter.value as any)}
                  className={`
                    px-4 py-2 rounded-lg transition-all duration-300 font-semibold
                    ${timeFilter === filter.value
                      ? 'bg-red-500/30 text-red-400 shadow-lg'
                      : 'text-gray-300 hover:text-white'
                    }
                  `}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Ad Space */}
        <div className="mb-12 flex justify-center">
          <AdSpace size="banner" adSlot="trending-battles-banner" />
        </div>

        {/* Trending Battles Grid */}
        {trendingBattles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingBattles.map((battle, index) => {
              const countdown = getTimeLeft(battle.endsAt);
              
              return (
                <motion.div
                  key={`${battle.type}-${battle.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard hover onClick={() => onViewBattle(battle.type, battle.id)} className="p-6 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{battle.icon}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${battle.color} text-white`}>
                          {battle.type.toUpperCase()}
                        </div>
                        {index < 3 && (
                          <div className="flex items-center text-red-400">
                            <Fire className="w-4 h-4 mr-1" />
                            <span className="text-xs font-semibold">HOT</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">#{index + 1}</div>
                        <div className="text-xs text-gray-400">trending</div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {getBattleTitle(battle)}
                    </h3>

                    {battle.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {battle.description}
                      </p>
                    )}

                    {/* Battle Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-white">{battle.totalVotes}</div>
                        <div className="text-xs text-gray-400">votes</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{battle.arguments?.length || 0}</div>
                        <div className="text-xs text-gray-400">arguments</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{battle.activity}</div>
                        <div className="text-xs text-gray-400">activity</div>
                      </div>
                    </div>

                    {/* Time Left */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center text-gray-300">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>Trending #{index + 1}</span>
                      </div>
                      <div className={`flex items-center font-semibold ${
                        countdown.ended ? 'text-red-300' : 'text-yellow-300'
                      }`}>
                        <Clock className="w-4 h-4 mr-1" />
                        {countdown.label}
                      </div>
                    </div>

                    {/* Share Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleShareBattle(battle, e)}
                      className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-lg text-red-400 hover:text-red-300 transition-all"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Trending Battle
                    </motion.button>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <TrendingUp className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">No trending battles yet</h3>
              <p className="text-gray-300 text-lg mb-8">
                Create some battles to see what's trending!
              </p>
            </motion.div>
          </div>
        )}

        {/* Bottom Ad Space */}
        <div className="mt-16 flex justify-center">
          <AdSpace size="rectangle" adSlot="trending-battles-bottom" />
        </div>
      </div>
    </div>
  );
};