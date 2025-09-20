import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Calendar, Loader } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { searchMovies, getPosterUrl, getReleaseYear } from '../lib/tmdb';
import { searchBooks, getBookCoverUrl, getPublicationYear } from '../lib/googleBooks';
import { searchGames, getGameCoverUrl, getReleaseYear as getGameReleaseYear } from '../lib/igdb';
import { sampleTracks, sampleArtists, getArtistImage, getAlbumImage } from '../lib/spotify';
import { sampleFoods } from '../lib/foodData';

interface ItemSearchProps {
  battleType: 'movie' | 'book' | 'game' | 'music' | 'food';
  onSelectItem: (item: any) => void;
  selectedItem?: any;
  placeholder?: string;
  excludeItemId?: any;
  label?: string;
}

export const ItemSearch: React.FC<ItemSearchProps> = ({
  battleType,
  onSelectItem,
  selectedItem,
  placeholder = "Search...",
  excludeItemId,
  label
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        // Show sample data for some types
        if (battleType === 'music') {
          setResults([...sampleTracks, ...sampleArtists]);
        } else if (battleType === 'food') {
          setResults(sampleFoods);
        } else {
          setResults([]);
        }
        return;
      }

      setSearching(true);
      try {
        let items: any[] = [];
        
        switch (battleType) {
          case 'movie':
            items = await searchMovies(query);
            break;
          case 'book':
            items = await searchBooks(query);
            break;
          case 'game':
            items = await searchGames(query);
            break;
          case 'music':
            items = [...sampleTracks, ...sampleArtists].filter(item =>
              item.name.toLowerCase().includes(query.toLowerCase())
            );
            break;
          case 'food':
            items = sampleFoods.filter(item =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              item.cuisine.toLowerCase().includes(query.toLowerCase())
            );
            break;
        }
        
        const filtered = items.filter(item => {
          const itemId = item.id || item.tmdb_id;
          return itemId !== excludeItemId;
        });
        setResults(filtered);
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, excludeItemId, battleType]);

  const getItemImage = (item: any) => {
    switch (battleType) {
      case 'movie':
        return getPosterUrl(item.poster_path, 'w342');
      case 'book':
        return getBookCoverUrl(item.imageLinks, 'small');
      case 'game':
        return getGameCoverUrl(item.background_image);
      case 'music':
        return item.artists ? getAlbumImage(item.album, 'medium') : getArtistImage(item, 'medium');
      case 'food':
        return item.image;
      default:
        return '';
    }
  };

  const getItemTitle = (item: any) => {
    return item.title || item.name;
  };

  const getItemSubtitle = (item: any) => {
    switch (battleType) {
      case 'movie':
        return getReleaseYear(item.release_date);
      case 'book':
        return `by ${item.authors?.join(', ') || 'Unknown'}`;
      case 'game':
        return getGameReleaseYear(item.first_release_date);
      case 'music':
        return item.artists ? `by ${item.artists[0]?.name}` : `${item.followers?.total?.toLocaleString()} followers`;
      case 'food':
        return item.cuisine;
      default:
        return '';
    }
  };

  if (selectedItem) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center space-x-4">
          <img
            src={getItemImage(selectedItem)}
            alt={getItemTitle(selectedItem)}
            className="w-16 h-16 object-cover rounded-lg border border-white/20"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=❓';
            }}
          />
          <div className="flex-1">
            <h3 className="text-white font-semibold">{getItemTitle(selectedItem)}</h3>
            <p className="text-gray-300 text-sm">{getItemSubtitle(selectedItem)}</p>
          </div>
          <button
            onClick={() => onSelectItem(null)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </GlassCard>
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
          {results.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectItem(item)}
              className="text-left p-3 bg-white/5 border border-white/20 rounded-lg hover:border-blue-400/50 transition-all"
            >
              <img
                src={getItemImage(item)}
                alt={getItemTitle(item)}
                className="w-full aspect-square object-cover rounded mb-2"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=❓';
                }}
              />
              <h4 className="text-white text-sm font-semibold truncate">
                {getItemTitle(item)}
              </h4>
              <p className="text-gray-400 text-xs truncate">
                {getItemSubtitle(item)}
              </p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};