import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';

import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { BattleArena } from './components/BattleArena';
import { TrendingBattles } from './components/TrendingBattles';
import { initializeAnalytics } from './utils/analytics';

type AppView = 'landing' | 'dashboard' | 'movie-battles' | 'book-battles' | 'game-battles' | 'music-battles' | 'food-battles' | 'trending';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  useEffect(() => {
    initializeAnalytics();
    
    // Check URL parameters for direct navigation
    const urlParams = new URLSearchParams(window.location.search);
    const battleType = urlParams.get('type');
    const trending = urlParams.get('trending');
    
    if (trending !== null) {
      setCurrentView('trending');
    } else if (battleType) {
      setCurrentView(`${battleType}-battles` as AppView);
    }
  }, []);

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
            onMovieBattles={() => navigateTo('movie-battles')}
            onBookBattles={() => navigateTo('book-battles')}
            onGameBattles={() => navigateTo('game-battles')}
            onMusicBattles={() => navigateTo('music-battles')}
            onFoodBattles={() => navigateTo('food-battles')}
            onTrending={() => navigateTo('trending')}
          />
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