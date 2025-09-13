import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Hammer from 'hammerjs';
import { Heart, X, Star, Calendar, Users, Zap } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { getPosterUrl, getReleaseYear } from '../lib/tmdb';
import { getBookCoverUrl, getPublicationYear } from '../lib/googleBooks';
import { getGameCoverUrl } from '../lib/rawg';
import { getArtistImage, getAlbumImage } from '../lib/spotify';

interface SwipeVotingProps {
  battle: any;
  battleType: 'movie' | 'book' | 'game' | 'music' | 'food';
  onVote: (itemId: any) => void;
  userVote?: any;
  disabled?: boolean;
}

export const SwipeVoting: React.FC<SwipeVotingProps> = ({
  battle,
  battleType,
  onVote,
  userVote,
  disabled = false
}) => {
  const [showFeedback, setShowFeedback] = useState<'left' | 'right' | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0.5, 0.8, 1, 0.8, 0.5]);

  // Initialize Hammer.js for touch gestures
  useEffect(() => {
    if (!cardRef.current) return;

    const hammer = new Hammer(cardRef.current);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    hammer.on('panmove', (e) => {
      x.set(e.deltaX);
      setSwipeDirection(Math.abs(e.deltaX) > 50 ? (e.deltaX > 0 ? 'right' : 'left') : null);
    });

    hammer.on('panend', (e) => {
      setSwipeDirection(null);
      
      const threshold = 120;
      if (Math.abs(e.deltaX) > threshold && !disabled) {
        const votedItem = e.deltaX > 0 ? battle.itemB : battle.itemA;
        handleVote(votedItem.id || votedItem.tmdb_id, e.deltaX > 0 ? 'right' : 'left');
      } else {
        x.set(0);
      }
    });

    return () => hammer.destroy();
  }, [disabled, battle, x]);

  const handleVote = (itemId: any, direction: 'left' | 'right') => {
    onVote(itemId);
    setShowFeedback(direction);
    setTimeout(() => setShowFeedback(null), 2000);
    x.set(0);
  };

  const handleDirectVote = (itemId: any) => {
    if (disabled) return;
    const direction = itemId === (battle.itemA.id || battle.itemA.tmdb_id) ? 'left' : 'right';
    handleVote(itemId, direction);
  };

  const getVotePercentage = (votes: number) => {
    return battle.totalVotes > 0 ? Math.round((votes / battle.totalVotes) * 100) : 0;
  };

  const getItemImage = (item: any) => {
    switch (battleType) {
      case 'movie':
        return getPosterUrl(item.poster_path, 'w500');
      case 'book':
        return getBookCoverUrl(item.imageLinks, 'medium');
      case 'game':
        return getGameCoverUrl(item.background_image);
      case 'music':
        return item.artists ? getAlbumImage(item.album, 'large') : getArtistImage(item, 'large');
      case 'food':
        return item.image;
      default:
        return '';
    }
  };

  const getItemTitle = (item: any) => item.title || item.name;

  const getItemSubtitle = (item: any) => {
    switch (battleType) {
      case 'movie':
        return getReleaseYear(item.release_date);
      case 'book':
        return `by ${item.authors?.join(', ') || 'Unknown'}`;
      case 'game':
        return getReleaseYear(item.released);
      case 'music':
        return item.artists ? `by ${item.artists[0]?.name}` : 'Artist';
      case 'food':
        return item.cuisine;
      default:
        return '';
    }
  };

  return (
    <div className="relative" ref={constraintsRef}>
      {/* Swipe Indicators */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-10">
        <motion.div
          className="flex items-center justify-center w-20 h-20 bg-red-500/20 border-2 border-red-400 rounded-full ml-8"
          animate={{ 
            scale: swipeDirection === 'left' || showFeedback === 'left' ? 1.2 : 1,
            opacity: swipeDirection === 'left' || showFeedback === 'left' ? 1 : 0.6
          }}
        >
          <X className="w-8 h-8 text-red-400" />
        </motion.div>
        
        <motion.div
          className="flex items-center justify-center w-20 h-20 bg-green-500/20 border-2 border-green-400 rounded-full mr-8"
          animate={{ 
            scale: swipeDirection === 'right' || showFeedback === 'right' ? 1.2 : 1,
            opacity: swipeDirection === 'right' || showFeedback === 'right' ? 1 : 0.6
          }}
        >
          <Heart className="w-8 h-8 text-green-400" />
        </motion.div>
      </div>

      {/* Swipeable Card */}
      <motion.div
        ref={cardRef}
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        style={{ x, rotate, opacity }}
        className="cursor-grab active:cursor-grabbing select-none"
        whileTap={{ scale: 0.95 }}
      >
        <GlassCard className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Item A */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => handleDirectVote(battle.itemA.id || battle.itemA.tmdb_id)}
              className={`
                relative cursor-pointer rounded-xl overflow-hidden group
                ${userVote === (battle.itemA.id || battle.itemA.tmdb_id) ? 'ring-2 ring-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''}
              `}
            >
              <img
                src={getItemImage(battle.itemA)}
                alt={getItemTitle(battle.itemA)}
                className="w-full h-80 object-cover rounded-xl shadow-2xl border border-white/20"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=❓';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-bold text-white mb-2">{getItemTitle(battle.itemA)}</h3>
                <p className="text-gray-300 text-sm mb-2">{getItemSubtitle(battle.itemA)}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-red-400 font-bold">
                    <Users className="w-4 h-4 mr-1" />
                    {battle.itemA.votes} votes
                  </span>
                  <span className="text-red-400 font-bold text-lg">
                    {getVotePercentage(battle.itemA.votes)}%
                  </span>
                </div>
              </div>

              {userVote === (battle.itemA.id || battle.itemA.tmdb_id) && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Your Pick!
                </div>
              )}
            </motion.div>

            {/* VS Divider */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
              <div className="bg-gradient-to-r from-red-500 to-green-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg border-2 border-white/20">
                VS
              </div>
            </div>

            {/* Item B */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => handleDirectVote(battle.itemB.id || battle.itemB.tmdb_id)}
              className={`
                relative cursor-pointer rounded-xl overflow-hidden group
                ${userVote === (battle.itemB.id || battle.itemB.tmdb_id) ? 'ring-2 ring-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : ''}
              `}
            >
              <img
                src={getItemImage(battle.itemB)}
                alt={getItemTitle(battle.itemB)}
                className="w-full h-80 object-cover rounded-xl shadow-2xl border border-white/20"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=❓';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-bold text-white mb-2">{getItemTitle(battle.itemB)}</h3>
                <p className="text-gray-300 text-sm mb-2">{getItemSubtitle(battle.itemB)}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-green-400 font-bold">
                    <Users className="w-4 h-4 mr-1" />
                    {battle.itemB.votes} votes
                  </span>
                  <span className="text-green-400 font-bold text-lg">
                    {getVotePercentage(battle.itemB.votes)}%
                  </span>
                </div>
              </div>

              {userVote === (battle.itemB.id || battle.itemB.tmdb_id) && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Your Pick!
                </div>
              )}
            </motion.div>
          </div>

          {/* Vote Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-sm text-white/90 mb-2">
              <span>{getItemTitle(battle.itemA)}: {getVotePercentage(battle.itemA.votes)}%</span>
              <span>{getItemTitle(battle.itemB)}: {getVotePercentage(battle.itemB.votes)}%</span>
            </div>
            <div className="w-full h-4 rounded-full bg-white/20 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-1000"
                style={{ width: `${getVotePercentage(battle.itemA.votes)}%` }}
                animate={{ width: `${getVotePercentage(battle.itemA.votes)}%` }}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <div className="md:hidden">
              <p className="text-gray-300 text-sm mb-2">
                <Zap className="w-4 h-4 inline mr-1" />
                Swipe left or right to vote
              </p>
            </div>
            <div className="hidden md:block">
              <p className="text-gray-300 text-sm">
                Click on an item to cast your vote
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Vote Feedback */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className={`
            px-8 py-4 rounded-full text-white font-bold text-xl shadow-lg border-2
            ${showFeedback === 'left' 
              ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-400' 
              : 'bg-gradient-to-r from-green-500 to-green-600 border-green-400'
            }
          `}>
            <div className="flex items-center">
              {showFeedback === 'left' ? (
                <X className="w-6 h-6 mr-2" />
              ) : (
                <Heart className="w-6 h-6 mr-2" />
              )}
              Vote cast!
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};