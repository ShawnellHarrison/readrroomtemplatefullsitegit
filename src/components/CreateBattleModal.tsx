import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Clock, Sparkles } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { NeonButton } from './UI/NeonButton';
import { ItemSearch } from './ItemSearch';

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  battleType: 'movie' | 'book' | 'game' | 'music' | 'food';
  onCreateBattle: (battleData: any) => Promise<void>;
}

export const CreateBattleModal: React.FC<CreateBattleModalProps> = ({
  isOpen,
  onClose,
  battleType,
  onCreateBattle
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(24);
  const [itemA, setItemA] = useState<any>(null);
  const [itemB, setItemB] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const durationOptions = [
    { value: 1, label: '1 Hour' },
    { value: 6, label: '6 Hours' },
    { value: 24, label: '1 Day' },
    { value: 72, label: '3 Days' },
    { value: 168, label: '1 Week' }
  ];

  const generateTitle = () => {
    if (itemA && itemB) {
      const nameA = itemA.title || itemA.name;
      const nameB = itemB.title || itemB.name;
      setTitle(`${nameA} vs ${nameB}`);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !itemA || !itemB || creating) return;

    setCreating(true);
    try {
      await onCreateBattle({
        title: title.trim(),
        description: description.trim() || undefined,
        itemA,
        itemB,
        duration
      });
      onClose();
    } catch (error) {
      console.error('Failed to create battle:', error);
    } finally {
      setCreating(false);
    }
  };

  const getItemName = (item: any) => item?.title || item?.name || 'Unknown';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
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
                <h2 className="text-3xl font-bold text-white">
                  Create {battleType.charAt(0).toUpperCase() + battleType.slice(1)} Battle
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Item Selection */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Choose Your Fighters</h3>
                  
                  <div>
                    <ItemSearch
                      battleType={battleType}
                      onSelectItem={setItemA}
                      selectedItem={itemA}
                      placeholder={`Search for first ${battleType}...`}
                      excludeItemId={itemB?.id}
                      label="Fighter A (Red Corner)"
                    />
                  </div>

                  <div className="text-center py-2">
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500/20 to-green-500/20 border border-white/20 rounded-full text-white font-bold">
                      VS
                    </div>
                  </div>

                  <div>
                    <ItemSearch
                      battleType={battleType}
                      onSelectItem={setItemB}
                      selectedItem={itemB}
                      placeholder={`Search for second ${battleType}...`}
                      excludeItemId={itemA?.id}
                      label="Fighter B (Green Corner)"
                    />
                  </div>
                </div>

                {/* Battle Settings */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Battle Settings</h3>
                  
                  <div>
                    <label className="block text-white font-semibold mb-2">Battle Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                      placeholder="Epic Battle Showdown"
                    />
                    {itemA && itemB && (
                      <button
                        onClick={generateTitle}
                        className="mt-2 flex items-center text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Generate title
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
                      rows={3}
                      placeholder="What are we deciding?"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Battle Duration
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {durationOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setDuration(option.value)}
                          className={`
                            p-3 rounded-xl border-2 transition-all duration-300
                            ${duration === option.value
                              ? 'bg-blue-500/30 border-blue-400 text-blue-400'
                              : 'bg-white/10 border-white/20 text-white hover:border-blue-400/50'
                            }
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Battle Preview */}
                  {itemA && itemB && (
                    <div className="p-4 bg-gradient-to-r from-red-500/20 to-green-500/20 border border-white/20 rounded-xl">
                      <h4 className="text-white font-semibold mb-2">Battle Preview</h4>
                      <div className="flex items-center justify-between text-sm text-gray-300">
                        <span>{getItemName(itemA)}</span>
                        <span>VS</span>
                        <span>{getItemName(itemB)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <NeonButton
                  onClick={handleSubmit}
                  disabled={!title.trim() || !itemA || !itemB || creating}
                  className="flex-1"
                >
                  {creating ? 'Creating Battle...' : 'Start the Battle!'}
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};