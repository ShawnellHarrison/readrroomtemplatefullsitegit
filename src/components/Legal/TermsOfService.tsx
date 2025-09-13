import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Users, Gavel } from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';

interface TermsOfServiceProps {
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
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
              <FileText className="w-8 h-8 mr-3 text-blue-400" />
              Terms of Service
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
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Acceptable Use
              </h3>
              <p className="mb-3">
                READ THE ROOM is designed for legitimate group decision-making. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the service for lawful purposes only</li>
                <li>Not create voting sessions with harmful, offensive, or illegal content</li>
                <li>Respect other users' privacy and voting choices</li>
                <li>Not attempt to manipulate voting results through technical means</li>
                <li>Not use the service for spam, harassment, or malicious activities</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                Prohibited Content
              </h3>
              <p className="mb-3">
                The following types of content are strictly prohibited:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Hate speech, discrimination, or harassment</li>
                <li>Violence, threats, or illegal activities</li>
                <li>Adult content or sexually explicit material</li>
                <li>Copyrighted material without permission</li>
                <li>Misleading or fraudulent information</li>
                <li>Content that violates others' privacy</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">Service Availability</h3>
              <p className="mb-3">
                We strive to provide reliable service, but:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Service may be temporarily unavailable for maintenance</li>
                <li>We reserve the right to modify or discontinue features</li>
                <li>Voting sessions may be automatically deleted after 30 days</li>
                <li>We may suspend accounts that violate these terms</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                <Gavel className="w-5 h-5 mr-2 text-blue-400" />
                Limitation of Liability
              </h3>
              <p className="mb-3">
                READ THE ROOM is provided "as is" without warranties. We are not liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Decisions made based on voting results</li>
                <li>Technical issues or service interruptions</li>
                <li>Loss of data or voting sessions</li>
                <li>Actions of other users</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">Intellectual Property</h3>
              <p className="mb-3">
                READ THE ROOM and its features are protected by intellectual property laws. You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Copy, modify, or distribute our software</li>
                <li>Reverse engineer our systems</li>
                <li>Use our branding without permission</li>
                <li>Create derivative works</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">Changes to Terms</h3>
              <p>
                We may update these terms periodically. Continued use of the service constitutes 
                acceptance of any changes. We will notify users of significant changes.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">Contact Information</h3>
              <p>
                For questions about these Terms of Service, contact us at{' '}
                <a href="mailto:legal@readtheroom.app" className="text-blue-400 hover:text-blue-300">
                  legal@readtheroom.app
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