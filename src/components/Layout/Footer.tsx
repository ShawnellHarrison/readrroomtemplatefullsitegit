import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Mail, Heart } from 'lucide-react';
import { PrivacyPolicy } from '../Legal/PrivacyPolicy';
import { TermsOfService } from '../Legal/TermsOfService';
import { AffiliateAd } from '../UI/AffiliateAd';

export const Footer: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer className="mt-16 py-8 border-t border-white/10">
        <div className="container mx-auto px-4" role="contentinfo">
          {/* Affiliate Product in Footer */}
          <div className="mb-8 flex justify-center">
            <AffiliateAd size="standard" className="max-w-md" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold text-white mb-4" itemProp="name">READ THE ROOM</h3>
              <p className="text-gray-300 text-sm">
                Free group voting and decision making app. Get the vibe. Make decisions together.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Making group decisions fun, fair, and easy since 2024. Trusted by thousands of groups worldwide.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal & Privacy</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
                  aria-label="View Privacy Policy"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </button>
                <button
                  onClick={() => setShowTerms(true)}
                  className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
                  aria-label="View Terms of Service"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Terms of Service
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact & Support</h4>
              <div className="space-y-2">
                <a
                  href="mailto:hello@readtheroom.app"
                  className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
                  aria-label="Email us for support"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  hello@readtheroom.app
                </a>
                <div className="flex items-center text-gray-300 text-sm">
                  <Heart className="w-4 h-4 mr-2 text-red-400" />
                  Made with love for better decisions
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} READ THE ROOM. All rights reserved. Free group voting app.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              This site uses cookies and displays ads to support our free group voting service. GDPR compliant.
            </p>
            <p className="text-gray-500 text-xs mt-3">
              Powered by{' '}
              <a 
                href="mailto:shawnelldh@gmail.com" 
                className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
              >
                Nuclear Cat Dev Company
              </a>
            </p>
            
            {/* Pulsing Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="flex justify-center gap-4 mt-8 pt-6 border-t border-white/10"
            >
              <motion.a
                href="https://life-goals.me/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
              >
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(139, 92, 246, 0.5)',
                      '0 0 40px rgba(139, 92, 246, 0.8)',
                      '0 0 20px rgba(139, 92, 246, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white font-bold text-sm shadow-lg"
                >
                  🎯 Vision Board
                </motion.div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.3, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full -z-10"
                />
              </motion.a>

              <motion.a
                href="https://candle-game.com/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
              >
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(34, 197, 94, 0.5)',
                      '0 0 40px rgba(34, 197, 94, 0.8)',
                      '0 0 20px rgba(34, 197, 94, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full text-white font-bold text-sm shadow-lg"
                >
                  🕯️ Unbeatable Game
                </motion.div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.3, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full -z-10"
                />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showPrivacy && (
          <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
        )}
        {showTerms && (
          <TermsOfService onClose={() => setShowTerms(false)} />
        )}
      </AnimatePresence>
    </>
  );
};