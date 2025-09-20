import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Users, TrendingUp, LogIn } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { NeonButton } from './UI/NeonButton';
import { SignInModal } from './Auth/SignInModal';
import { UserMenu } from './Auth/UserMenu';
import { Footer } from './Layout/Footer';
import { CookieConsent } from './Legal/CookieConsent';
import { useAuth } from '../contexts/AuthContext';
import { trackPageView, trackEvent } from '../utils/analytics';

interface LandingPageProps {
  onGetStarted: () => void;
  onCreateVote: () => void;
  onMovieBattles: () => void;
  onBookBattles: () => void;
  onGameBattles: () => void;
  onMusicBattles: () => void;
  onFoodBattles: () => void;
  onTrending: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onGetStarted, 
  onCreateVote,
  onMovieBattles, 
  onBookBattles, 
  onGameBattles, 
  onMusicBattles, 
  onFoodBattles, 
  onTrending 
}) => {
  const { user } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  React.useEffect(() => {
    trackPageView('landing', 'READ THE ROOM - Free Group Voting & Decision Making App');
  }, []);

  const battleTypes = [
    {
      title: 'Movie Battle Arena',
      description: 'Epic movie showdowns with swipe voting!',
      icon: '🎬',
      gradient: 'from-red-500 via-purple-600 to-blue-500',
      shadow: 'rgba(239,68,68,0.5)',
      onClick: () => {
        trackEvent('movie_battle_clicked', { source: 'landing_page' });
        onMovieBattles();
      }
    },
    {
      title: 'Book Battle Arena',
      description: 'Literary showdowns with swipe voting!',
      icon: '📚',
      gradient: 'from-amber-500 via-orange-600 to-red-500',
      shadow: 'rgba(245,158,11,0.5)',
      onClick: () => {
        trackEvent('book_battle_clicked', { source: 'landing_page' });
        onBookBattles();
      }
    },
    {
      title: 'Game Battle Arena',
      description: 'Gaming showdowns with swipe voting!',
      icon: '🎮',
      gradient: 'from-purple-500 via-indigo-600 to-blue-500',
      shadow: 'rgba(147,51,234,0.5)',
      onClick: () => {
        trackEvent('game_battle_clicked', { source: 'landing_page' });
        onGameBattles();
      }
    },
    {
      title: 'Music Battle Royale',
      description: 'Epic music showdowns with swipe voting!',
      icon: '🎵',
      gradient: 'from-pink-500 via-purple-600 to-blue-500',
      shadow: 'rgba(236,72,153,0.5)',
      onClick: () => {
        trackEvent('music_battle_clicked', { source: 'landing_page' });
        onMusicBattles();
      }
    },
    {
      title: 'Food Wars Arena',
      description: 'Delicious food battles with swipe voting!',
      icon: '🍽️',
      gradient: 'from-orange-500 via-red-600 to-pink-500',
      shadow: 'rgba(251,146,60,0.5)',
      onClick: () => {
        trackEvent('food_battle_clicked', { source: 'landing_page' });
        onFoodBattles();
      }
    },
    {
      title: 'Trending Battles',
      description: 'Vote on what\'s hot right now!',
      icon: '🔥',
      gradient: 'from-red-500 via-pink-600 to-purple-500',
      shadow: 'rgba(239,68,68,0.5)',
      onClick: () => {
        trackEvent('trending_clicked', { source: 'landing_page' });
        onTrending();
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <p className="text-gray-300 text-sm">
            Developed by{' '}
            <a 
              href="mailto:shawnelldh@gmail.com" 
              className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
            >
              Shawnell Harrison
            </a>
          </p>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <UserMenu />
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSignIn(true)}
                className="flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="mr-4"
            >
              <Vote className="w-12 h-12 text-blue-400" />
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              READ THE ROOM
            </h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2xl text-gray-300 font-light mb-4"
          >
            Get the vibe. Make decisions together.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg text-gray-400"
          >
            Free real-time consensus voting for groups, teams, and communities.
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col md:flex-row gap-6 justify-center mb-12"
        >
          <NeonButton 
            onClick={onCreateVote}
            size="lg" 
            className="text-xl"
          >
            <Vote className="w-6 h-6 mr-3" />
            CREATE A VOTE
          </NeonButton>
          <NeonButton 
            onClick={() => {
              trackEvent('get_started_clicked', { source: 'landing_page' });
              onGetStarted();
            }} 
            size="lg" 
            variant="secondary"
            className="text-xl"
          >
            <Users className="w-6 h-6 mr-3" />
            BATTLE ARENA
          </NeonButton>
        </motion.div>

        {/* Battle Types Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center mb-16 max-w-6xl mx-auto"
        >
          {battleTypes.map((battle, index) => (
            <motion.button
              key={battle.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: `0 0 40px ${battle.shadow}` 
              }}
              whileTap={{ scale: 0.95 }}
              onClick={battle.onClick}
              className={`
                px-6 py-6 text-lg font-bold text-white rounded-xl
                bg-gradient-to-r ${battle.gradient}
                shadow-[0_0_30px_${battle.shadow}]
                border-2 border-white/20
                transition-all duration-300
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-2">{battle.icon}</span>
                <span className="text-lg font-bold mb-1">{battle.title}</span>
                <div className="text-sm opacity-90">
                  {battle.description}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <Footer />
        <CookieConsent />
        
        <SignInModal 
          isOpen={showSignIn} 
          onClose={() => setShowSignIn(false)} 
        />
      </div>
    </div>
  );
};