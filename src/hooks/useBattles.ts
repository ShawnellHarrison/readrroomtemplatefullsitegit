import { useState, useEffect, useCallback } from 'react';
import { getSupabase, getSessionId } from '../lib/supabase';
import { trackEvent } from '../utils/analytics';

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
      
      // Use vote_rooms table with movie_battle type instead of battles table
      const { data, error: fetchError } = await supabase
        .from('vote_rooms')
        .select('*')
        .eq('type', 'movie_battle')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedBattles = (data || []).map(room => ({
        id: room.id,
        title: room.title,
        description: room.description,
        battle_type: 'movie',
        item_a: room.items?.[0] || { title: 'Movie A', name: 'Movie A' },
        item_b: room.items?.[1] || { title: 'Movie B', name: 'Movie B' },
        totalVotes: room.total_votes || 0,
        createdAt: new Date(room.created_at),
        endsAt: room.deadline ? new Date(room.deadline) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: room.is_active,
        timeLeft: getTimeLeft(room.deadline),
        isEnded: room.deadline ? new Date(room.deadline) < new Date() : false
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
        .from('vote_rooms')
        .insert({
          title: battleData.title,
          description: battleData.description,
          type: 'movie_battle',
          items: [battleData.itemA, battleData.itemB],
          deadline: endsAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      trackEvent('battle_created', { type: battleType, id: data.id });
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

      // Get the battle to find the movie IDs
      const battle = getBattle(battleId);
      if (!battle) {
        console.error('Battle not found');
        return false;
      }

      const movieId = itemChoice === 'A' ? battle.item_a.id : battle.item_b.id;

      const { error } = await supabase
        .from('votes')
        .upsert({
          room_id: battleId,
          session_id: sessionId,
          value: { movieId, choice: itemChoice }
        }, { 
          onConflict: 'room_id,session_id' 
        });

      if (error) {
        console.error('Vote error:', error);
        return false;
      }

      trackEvent('vote_cast', { battleId, choice: itemChoice });
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