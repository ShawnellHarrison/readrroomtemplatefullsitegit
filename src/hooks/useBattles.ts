import { useState, useEffect } from 'react';
import { getSupabase, getSessionId } from '../lib/supabase';

export interface Battle {
  id: string;
  title: string;
  description?: string;
  battle_type: string;
  item_a: any;
  item_b: any;
  totalVotes: number;
  createdAt: Date;
  endsAt: Date;
  isActive: boolean;
  timeLeft: string;
  isEnded: boolean;
}

export const useBattles = (battleType: string) => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBattles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = await getSupabase();
      const { data, error: fetchError } = await supabase
        .from('battles')
        .select('*')
        .eq('battle_type', battleType)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedBattles = (data || []).map(battle => ({
        id: battle.id,
        title: battle.title,
        description: battle.description,
        battle_type: battle.battle_type,
        item_a: battle.item_a,
        item_b: battle.item_b,
        totalVotes: battle.total_votes || 0,
        createdAt: new Date(battle.created_at),
        endsAt: battle.ends_at ? new Date(battle.ends_at) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: battle.is_active,
        timeLeft: getTimeLeft(battle.ends_at),
        isEnded: battle.ends_at ? new Date(battle.ends_at) < new Date() : false
      }));

      setBattles(formattedBattles);
    } catch (err) {
      console.error('Error loading battles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load battles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBattles();
  }, [battleType]);

  const createBattle = async (battleData: any): Promise<string> => {
    try {
      const supabase = await getSupabase();
      
      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + (battleData.duration || 24));

      const { data, error } = await supabase
        .from('battles')
        .insert({
          title: battleData.title,
          description: battleData.description,
          battle_type: battleType,
          item_a: battleData.itemA,
          item_b: battleData.itemB,
          ends_at: endsAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh battles list
      await loadBattles();
      
      return data.id;
    } catch (err) {
      console.error('Error creating battle:', err);
      throw err;
    }
  };

  const getBattle = (battleId: string): Battle | undefined => {
    return battles.find(battle => battle.id === battleId);
  };

  const vote = async (battleId: string, itemChoice: 'A' | 'B'): Promise<boolean> => {
    try {
      const supabase = await getSupabase();
      const sessionId = getSessionId();

      const { error } = await supabase
        .from('battle_votes')
        .insert({
          battle_id: battleId,
          item_choice: itemChoice,
          session_id: sessionId
        });

      if (error) {
        // If it's a duplicate vote error, that's expected
        if (error.code === '23505') {
          console.log('User has already voted in this battle');
          return false;
        }
        throw error;
      }

      // Refresh battles to get updated vote counts
      await loadBattles();
      
      return true;
    } catch (err) {
      console.error('Error voting:', err);
      return false;
    }
  };

  const getTimeLeft = (endsAt: string | null): string => {
    if (!endsAt) return 'No time limit';
    
    const now = new Date().getTime();
    const end = new Date(endsAt).getTime();
    const difference = end - now;
    
    if (difference <= 0) return 'Ended';
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return {
    battles,
    loading,
    error,
    createBattle,
    getBattle,
    vote,
    refresh: loadBattles
  };
};