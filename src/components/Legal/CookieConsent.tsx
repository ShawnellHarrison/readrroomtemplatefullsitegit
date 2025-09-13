import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, Check, X } from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';
import { NeonButton } from '../UI/NeonButton';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    advertising: false,
    functional: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      advertising: true,
      functional: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    
    // Reinitialize analytics and ads with consent
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
      });
    }
    
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const minimal = {
      necessary: true,
      analytics: false,
      advertising: false,
      functional: false
    };
    setPreferences(minimal);
    localStorage.setItem('cookie-consent', JSON.stringify(minimal));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'necessary') return; // Always required
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <GlassCard className="p-6">
            <div className="flex items-start mb-4">
              <Cookie className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Cookie Preferences</h3>
                <p className="text-gray-300 text-sm mb-4">
                  We use cookies to enhance your experience, analyze site usage, and serve personalized ads. 
                  Choose your preferences below.
                </p>
              </div>
            </div>

            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 space-y-3"
              >
                {Object.entries({
                  necessary: 'Necessary (Required)',
                  functional: 'Functional',
                  analytics: 'Analytics',
                  advertising: 'Advertising'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-white text-sm">{label}</span>
                    <button
                      onClick={() => togglePreference(key as keyof typeof preferences)}
                      disabled={key === 'necessary'}
                      className={`
                        w-12 h-6 rounded-full transition-all duration-300 flex items-center
                        ${preferences[key as keyof typeof preferences] 
                          ? 'bg-blue-500' 
                          : 'bg-gray-600'
                        }
                        ${key === 'necessary' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div
                        className={`
                          w-5 h-5 bg-white rounded-full transition-transform duration-300
                          ${preferences[key as keyof typeof preferences] 
                            ? 'translate-x-6' 
                            : 'translate-x-0.5'
                          }
                        `}
                      />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="flex flex-wrap gap-2">
              <NeonButton onClick={handleAcceptAll} size="sm">
                <Check className="w-4 h-4 mr-1" />
                Accept All
              </NeonButton>
              <button
                onClick={handleRejectAll}
                className="px-3 py-2 text-gray-300 hover:text-white transition-colors text-sm"
              >
                <X className="w-4 h-4 mr-1 inline" />
                Reject All
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                <Settings className="w-4 h-4 mr-1 inline" />
                {showSettings ? 'Hide' : 'Settings'}
              </button>
              {showSettings && (
                <NeonButton onClick={handleSavePreferences} size="sm" variant="secondary">
                  Save Preferences
                </NeonButton>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};