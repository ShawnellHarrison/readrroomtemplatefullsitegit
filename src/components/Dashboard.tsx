import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Swords, BookOpen, Gamepad2, Music, UtensilsCrossed, TrendingUp } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { NeonButton } from './UI/NeonButton';

interface DashboardProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack, onNavigate }) => {
  const battleTypes = [
    {
      id: 'vote-creator',
      title: 'Custom Vote Creator',
      description: 'Create custom voting sessions for any topic',
      icon: Vote,
      color: 'from-green-500 to-blue-600',
      bgColor: 'from-green-900 via-blue-900 to-indigo-900'
    },
    {
      id: 'movie-battles',
      title: 'Movie Battle Arena',
      description: 'Epic movie showdowns decided by the crowd',
      icon: Swords,
      color: 'from-red-500 to-purple-600',
      bgColor: 'from-purple-900 via-blue-900 to-indigo-900'
    },
    {
      id: 'book-battles',
      title: 'Book Battle Arena',
      description: 'Literary showdowns decided by readers',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-900 via-orange-900 to-red-900'
    },
    {
      id: 'game-battles',
      title: 'Game Battle Arena',
      description: 'Gaming showdowns decided by players',
      icon: Gamepad2,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'from-purple-900 via-blue-900 to-indigo-900'
    },
    {
      id: 'music-battles',
      title: 'Music Battle Royale',
      description: 'Musical showdowns decided by fans',
      icon: Music,
      color: 'from-pink-500 to-purple-600',
      bgColor: 'from-pink-900 via-purple-900 to-blue-900'
    },
    {
      id: 'food-battles',
      title: 'Food Wars Arena',
      description: 'Culinary showdowns decided by foodies',
      icon: UtensilsCrossed,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-900 via-red-900 to-pink-900'
    },
    {
      id: 'trending',
      title: 'Trending Battles',
      description: 'Vote on what\'s hot right now',
      icon: TrendingUp,
      color: 'from-red-500 to-pink-600',
      bgColor: 'from-red-900 via-pink-900 to-purple-900'
    }
  ];

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
          <h1 className="text-4xl font-bold text-white mb-2">Battle Dashboard</h1>
          <p className="text-gray-300">Choose your arena and start epic showdowns</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {battleTypes.map((battle, index) => {
            const IconComponent = battle.icon;
            
            return (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover onClick={() => onNavigate(battle.id)} className="p-8 text-center h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${battle.color} rounded-full flex items-center justify-center`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">{battle.title}</h3>
                  <p className="text-gray-300">{battle.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};