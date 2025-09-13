import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Cookie, Database } from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-400" />
              Privacy Policy
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6 text-gray-300">
            <section>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-400" />
                Information We Collect
              </h3>
              <p className="mb-3">
                READ THE ROOM is designed with privacy in mind. We collect minimal information to provide our voting service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Anonymous voting data (no personal identification)</li>
                <li>Session identifiers for vote tracking (temporary)</li>
                <li>Basic usage analytics for service improvement</li>
                <li>Device information for optimal user experience</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                <Cookie className="w-5 h-5 mr-2 text-blue-400" />
                Cookies and Tracking
              </h3>
              <p className="mb-3">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your voting sessions</li>
                <li>Prevent duplicate voting</li>
                <li>Analyze site usage and performance</li>
                <li>Serve relevant advertisements through Google AdSense</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-400" />
                Data Storage and Security
              </h3>
              <p className="mb-3">
                Your data security is our priority:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All data is encrypted in transit and at rest</li>
                <li>Voting sessions are automatically deleted after 30 days</li>
                <li>No personal information is stored or shared</li>
                <li>We comply with GDPR, CCPA, and other privacy regulations</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">Third-Party Services</h3>
              <p className="mb-3">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Google AdSense:</strong> For displaying advertisements</li>
                <li><strong>Analytics:</strong> For understanding user behavior</li>
                <li><strong>CDN Services:</strong> For fast content delivery</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">Your Rights</h3>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your data (though we store minimal information)</li>
                <li>Request data deletion</li>
                <li>Opt-out of analytics tracking</li>
                <li>Control cookie preferences</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">Contact Us</h3>
              <p>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@readtheroom.app" className="text-blue-400 hover:text-blue-300">
                  privacy@readtheroom.app
                </a>
              </p>
            </section>

            <div className="text-sm text-gray-400 pt-4 border-t border-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};