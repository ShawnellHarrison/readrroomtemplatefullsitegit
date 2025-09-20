import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';

import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { BattleArena } from './components/BattleArena';
import { TrendingBattles } from './components/TrendingBattles';
import { VoteButtonConfigurator, VotePage } from './components/VoteDropIn';
import { initializeAnalytics } from './utils/analytics';

type AppView = 'landing' | 'dashboard' | 'movie-battles' | 'book-battles' | 'game-battles' | 'music-battles' | 'food-battles' | 'trending' | 'vote-creator';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  useEffect(() => {
    initializeAnalytics();
    
    // Check URL parameters for direct navigation
    const urlParams = new URLSearchParams(window.location.search);
    const battleType = urlParams.get('type');
    const trending = urlParams.get('trending');
    const voteRoute = window.location.pathname.match(/^\/vote\/(.+)$/);
    
    if (voteRoute) {
      // Handle vote page routing
      return; // VotePage will handle this
    } else if (trending !== null) {
      setCurrentView('trending');
    } else if (battleType) {
      setCurrentView(`${battleType}-battles` as AppView);
    }
  }, []);

  // Check if we're on a vote route
  const voteRoute = window.location.pathname.match(/^\/vote\/(.+)$/);
  if (voteRoute) {
    return (
      <AuthProvider>
        <VotePage pollId={voteRoute[1]} />
      </AuthProvider>
    );
  }

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    
    // Update URL
    const url = new URL(window.location.href);
    url.search = '';
    
    if (view === 'trending') {
      url.searchParams.set('trending', '1');
    } else if (view.includes('-battles')) {
      url.searchParams.set('type', view.replace('-battles', ''));
    }
    
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => navigateTo('dashboard')}
            onCreateVote={() => navigateTo('vote-creator')}
            onMovieBattles={() => navigateTo('movie-battles')}
            onBookBattles={() => navigateTo('book-battles')}
            onGameBattles={() => navigateTo('game-battles')}
            onMusicBattles={() => navigateTo('music-battles')}
            onFoodBattles={() => navigateTo('food-battles')}
            onTrending={() => navigateTo('trending')}
          />
        )}

        {currentView === 'vote-creator' && (
          <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-4">
            <div className="container mx-auto max-w-4xl">
              <button
                onClick={handleBackToHome}
                className="mb-6 text-blue-400 hover:text-blue-300 transition-colors flex items-center"
              >
                ← Back to Home
              </button>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">Create Your Vote</h1>
                <p className="text-gray-300 text-lg">Set up a custom voting session for your group</p>
              </div>
              <div className="flex justify-center">
                <VoteButtonConfigurator 
                  label="Create Custom Vote"
                  navigateToVote={(id) => {
                    window.history.pushState({}, '', `/vote/${id}`);
                    window.location.reload();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            onBack={handleBackToHome}
            onNavigate={navigateTo}
          />
        )}

        {currentView.includes('-battles') && (
          <BattleArena
            battleType={currentView.replace('-battles', '') as 'movie' | 'book' | 'game' | 'music' | 'food'}
            onBack={handleBackToHome}
          />
        )}

        {currentView === 'trending' && (
          <TrendingBattles onBack={handleBackToHome} />
        )}
      </div>
    </AuthProvider>
  );
};

export default App;