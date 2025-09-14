import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, Trophy, Share2, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GlassCard } from './UI/GlassCard';
import { NeonButton } from './UI/NeonButton';
import { SwipeVoting } from './SwipeVoting';
import { useBattles } from '../hooks/useBattles';
import { getSupabase, getSessionId } from '../lib/supabase';

interface BattleViewerProps {
  battleId: string;
  battleType: 'movie' | 'book' | 'game' | 'music' | 'food';
  onBack: () => void;
}

export const BattleViewer: React.FC<BattleViewerProps> = ({ battleId, battleType, onBack }) => {
  const { getBattle, vote } = useBattles(battleType);
  const [battle, setBattle] = useState<any>(null);
  const [userVote, setUserVote] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [voteCounts, setVoteCounts] = useState({ A: 0, B: 0 });
  const confettiTriggered = useRef(false);

  useEffect(() => {
    const loadBattle = async () => {
      try {
        const supabase = await getSupabase();

        // 1) Get battle (can be 0 rows) → maybeSingle()
        const { data: battleData, error: battleError } = await supabase
          .from('battles')
          .select('*')
          .eq('id', battleId)
          .maybeSingle();

        if (battleError) {
          console.error('Battle fetch error:', battleError);
          setBattle(null);
          return;
        }
        if (!battleData) {
          console.warn('Battle not found');
          setBattle(null);
          return;
        }

        // 2) Get ALL votes as a list (never .single())
        const { data: votes, error: votesError } = await supabase
          .from('battle_votes')
          .select('item_choice')
          .eq('battle_id', battleId);

        if (votesError) {
          console.error('Votes fetch error:', votesError);
        }

        // ✅ 3) Define counts OUTSIDE the if-block so it's in scope
        const counts: { A: number; B: number } = (votes ?? []).reduce(
          (acc: { A: number; B: number }, row: { item_choice?: 'A' | 'B' }) => {
            if (row?.item_choice === 'A') acc.A += 1;
            else if (row?.item_choice === 'B') acc.B += 1;
            return acc;
          },
          { A: 0, B: 0 }
        );
        setVoteCounts(counts);

        // 4) Has THIS session voted? (can be 0 rows) → limit(1).maybeSingle()
        const sessionId = getSessionId();
        if (sessionId) {
          const { data: userVoteData, error: userVoteErr } = await supabase
            .from('battle_votes')
            .select('item_choice')
            .eq('battle_id', battleId)
            .eq('session_id', sessionId)
            .limit(1)
            .maybeSingle(); // ← fixes 406

          if (userVoteErr) console.error('User vote fetch error:', userVoteErr);
          setUserVote((userVoteData?.item_choice as 'A' | 'B') ?? null);
        } else {
          setUserVote(null);
        }

        // 5) Normalize items (handles jsonb or text columns)
        const toObj = (raw: any) =>
          raw && typeof raw === 'object'
            ? raw
            : { title: String(raw ?? 'Unknown'), name: String(raw ?? 'Unknown') };

        const formattedBattle = {
          ...battleData,
          itemA: { ...toObj(battleData.item_a), votes: counts.A },
          itemB: { ...toObj(battleData.item_b), votes: counts.B },
          totalVotes: counts.A + counts.B,
          createdAt: battleData.created_at ? new Date(battleData.created_at) : null,
          endsAt: battleData.ends_at ? new Date(battleData.ends_at) : null,
        };

        setBattle(formattedBattle);
      } catch (error) {
        console.error('Error loading battle:', error);
        setBattle(null);
      }
    };
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft('Battle ended');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [battle?.endsAt]);

  const isEnded = timeLeft === 'Battle ended';
  const winner = battle && isEnded ? 
    (battle.itemA.votes > battle.itemB.votes ? battle.itemA : 
     battle.itemB.votes > battle.itemA.votes ? battle.itemB : null) : null;

  // Trigger confetti for winner
  useEffect(() => {
    if (winner && !confettiTriggered.current) {
      confettiTriggered.current = true;
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 1000);
    }
  }, [winner]);

  const handleVote = async (itemId: any) => {
    if (isEnded || userVote) return;
    
    const success = await vote(battleId, itemId);
    if (success) {
      setUserVote(itemId);
    }
  };

  const handleShare = () => {
    const shareText = `🔥 Epic ${battleType} battle!\n\n${battle.title}\n\nVote now and see who wins!`;
    
    if (navigator.share) {
      navigator.share({
        title: battle.title,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
    }
  };

  const getArenaGradient = () => {
    const gradients = {
      movie: 'from-purple-900 via-blue-900 to-indigo-900',
      book: 'from-amber-900 via-orange-900 to-red-900',
      game: 'from-purple-900 via-blue-900 to-indigo-900',
      music: 'from-pink-900 via-purple-900 to-blue-900',
      food: 'from-orange-900 via-red-900 to-pink-900'
    };
    return gradients[battleType];
  };

  if (!battle) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getArenaGradient()} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Battle not found</h2>
          <NeonButton onClick={onBack}>Go Back</NeonButton>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getArenaGradient()} p-4`}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center text-blue-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Arena
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{battle.title}</h1>
              {battle.description && (
                <p className="text-gray-300 mb-2">{battle.description}</p>
              )}
              <div className="flex items-center space-x-6 text-sm">
                <div className={`flex items-center font-semibold ${
                  isEnded ? 'text-red-300' : 'text-yellow-300'
                }`}>
                  <Clock className="w-4 h-4 mr-2" />
                  {timeLeft}
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="w-4 h-4 mr-2" />
                  {battle.totalVotes} votes
                </div>
              </div>
            </div>
            
            <NeonButton onClick={handleShare} variant="secondary">
              <Share2 className="w-4 h-4 mr-2" />
              Share Battle
            </NeonButton>
          </div>
        </motion.div>

        {/* Winner Banner */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <GlassCard className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Crown className="w-16 h-16 text-yellow-400 mr-4" />
                <div>
                  <h2 className="text-4xl font-bold text-white">
                    {winner.title || winner.name} Wins!
                  </h2>
                  <p className="text-gray-300 text-xl">
                    {Math.round((winner.votes / battle.totalVotes) * 100)}% of votes
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Voting Interface */}
        <SwipeVoting
          battle={battle}
          battleType={battleType}
          onVote={handleVote}
          userVote={userVote}
          disabled={isEnded}
        />
      </div>
    </div>
  );
};