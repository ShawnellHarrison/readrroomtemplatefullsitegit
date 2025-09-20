import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Calendar, Loader, Gamepad2 } from 'lucide-react';
import { searchGames, getGameCoverUrl, getReleaseYear, getGenreNames, getRatingColor } from '../lib/igdb';
import type { IGDBGame } from '../lib/igdb';

interface GameSearchProps {
  onSelectGame: (game: IGDBGame) => void;
  selectedGame?: IGDBGame;
  placeholder?: string;
  excludeGameId?: number;
  label?: string;
}

export const GameSearch: React.FC<GameSearchProps> = ({
  onSelectGame,
  selectedGame,
  placeholder = "Search for games...",
  excludeGameId,
  label
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IGDBGame[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        // Show sample games when no query
        const games = await searchGames('');
        const filtered = games.filter(game => game.id !== excludeGameId);
        setResults(filtered.slice(0, 6));
        return;
      }

      setSearching(true);
      try {
        const games = await searchGames(query);
        const filtered = games.filter(game => game.id !== excludeGameId);
        setResults(filtered.slice(0, 12));
      } catch (error) {
        console.error('Error searching games:', error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, excludeGameId]);

  if (selectedGame) {
    return (
      <div className="p-4 bg-white/10 border border-white/20 rounded-xl">
        <div className="flex items-center space-x-4">
          <img
            src={getGameCoverUrl(selectedGame.cover?.url, 'cover_small')}
            alt={selectedGame.name}
            className="w-16 h-20 object-cover rounded-lg border border-white/20"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=🎮';
            }}
          />
          <div className="flex-1">
            <h3 className="text-white font-semibold">{selectedGame.name}</h3>
            <p className="text-gray-300 text-sm">{getReleaseYear(selectedGame.first_release_date)}</p>
            {selectedGame.rating && (
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className={`text-sm ${getRatingColor(selectedGame.rating)}`}>
                  {selectedGame.rating.toFixed(1)}
                </span>
              </div>
            )}
            {selectedGame.genres && selectedGame.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedGame.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.id}
                    className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onSelectGame(null as any)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-white font-semibold">{label}</label>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          placeholder={placeholder}
        />
        {searching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader className="animate-spin h-5 w-5 text-white" />
          </div>
        )}
      </div>
      
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
          {results.map((game) => (
            <motion.button
              key={game.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectGame(game)}
              className="text-left p-3 bg-white/5 border border-white/20 rounded-lg hover:border-blue-400/50 transition-all"
            >
              <img
                src={getGameCoverUrl(game.cover?.url, 'cover_small')}
                alt={game.name}
                className="w-full aspect-[3/4] object-cover rounded mb-2"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=🎮';
                }}
              />
              <h4 className="text-white text-sm font-semibold truncate">
                {game.name}
              </h4>
              <p className="text-gray-400 text-xs">
                {getReleaseYear(game.first_release_date)}
              </p>
              {game.rating && (
                <div className="flex items-center mt-1">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className={`text-xs ${getRatingColor(game.rating)}`}>
                    {game.rating.toFixed(1)}
                  </span>
                </div>
              )}
              {game.genres && game.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {game.genres.slice(0, 1).map((genre) => (
                    <span
                      key={genre.id}
                      className="px-1 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}
      
      <p className="text-yellow-400 text-xs">
        Using sample games. Connect to IGDB API for full game search.
      </p>
    </div>
  );
};