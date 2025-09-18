import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Calendar, Loader } from 'lucide-react';

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

interface MovieSearchProps {
  onSelectMovie: (movie: TMDBMovie) => void;
  selectedMovie?: TMDBMovie;
  placeholder?: string;
  excludeMovieId?: number;
  label?: string;
}

// Sample movies for fallback when TMDB API is not available
const SAMPLE_MOVIES: TMDBMovie[] = [
  {
    id: 603692,
    title: 'John Wick: Chapter 4',
    poster_path: '/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    release_date: '2023-03-24',
    vote_average: 7.8,
    overview: 'With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table.'
  },
  {
    id: 438631,
    title: 'Dune',
    poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    release_date: '2021-09-15',
    vote_average: 8.0,
    overview: 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding.'
  },
  {
    id: 27205,
    title: 'Inception',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    release_date: '2010-07-16',
    vote_average: 8.8,
    overview: 'Dom Cobb is a skilled thief, the absolute best in the dangerous art of extraction.'
  },
  {
    id: 155,
    title: 'The Dark Knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    release_date: '2008-07-18',
    vote_average: 9.0,
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.'
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    poster_path: '/9cqNxx0GxF0bflyCy3FpPiy3BXg.jpg',
    release_date: '1994-09-23',
    vote_average: 9.3,
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
  },
  {
    id: 238,
    title: 'The Godfather',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    release_date: '1972-03-24',
    vote_average: 9.2,
    overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'
  }
];

export const MovieSearch: React.FC<MovieSearchProps> = ({
  onSelectMovie,
  selectedMovie,
  placeholder = "Search for movies...",
  excludeMovieId,
  label
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [searching, setSearching] = useState(false);
  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        // Show sample movies when no query
        const filtered = SAMPLE_MOVIES.filter(movie => movie.id !== excludeMovieId);
        setResults(filtered.slice(0, 6));
        return;
      }

      setSearching(true);
      try {
        let movies: TMDBMovie[] = [];
        
        if (tmdbApiKey) {
          // Use TMDB API if available
          const url = new URL('https://api.themoviedb.org/3/search/movie');
          url.searchParams.set('api_key', tmdbApiKey);
          url.searchParams.set('query', query);
          url.searchParams.set('include_adult', 'false');
          
          const response = await fetch(url.toString());
          const data = await response.json();
          movies = (data?.results ?? []).filter((movie: any) => movie.poster_path);
        } else {
          // Fallback to sample movies
          movies = SAMPLE_MOVIES.filter(movie =>
            movie.title.toLowerCase().includes(query.toLowerCase())
          );
        }
        
        const filtered = movies.filter(movie => movie.id !== excludeMovieId);
        setResults(filtered.slice(0, 12));
      } catch (error) {
        console.error('Error searching movies:', error);
        // Fallback to sample movies on error
        const filtered = SAMPLE_MOVIES.filter(movie =>
          movie.title.toLowerCase().includes(query.toLowerCase()) && movie.id !== excludeMovieId
        );
        setResults(filtered);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, excludeMovieId, tmdbApiKey]);

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) {
      return 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=🎬';
    }
    return `https://image.tmdb.org/t/p/w300${posterPath}`;
  };

  const getReleaseYear = (releaseDate: string) => {
    if (!releaseDate) return 'Unknown';
    return new Date(releaseDate).getFullYear().toString();
  };

  if (selectedMovie) {
    return (
      <div className="p-4 bg-white/10 border border-white/20 rounded-xl">
        <div className="flex items-center space-x-4">
          <img
            src={getPosterUrl(selectedMovie.poster_path)}
            alt={selectedMovie.title}
            className="w-16 h-24 object-cover rounded-lg border border-white/20"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=🎬';
            }}
          />
          <div className="flex-1">
            <h3 className="text-white font-semibold">{selectedMovie.title}</h3>
            <p className="text-gray-300 text-sm">{getReleaseYear(selectedMovie.release_date)}</p>
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-yellow-400 text-sm">{selectedMovie.vote_average.toFixed(1)}</span>
            </div>
          </div>
          <button
            onClick={() => onSelectMovie(null as any)}
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
          {results.map((movie) => (
            <motion.button
              key={movie.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectMovie(movie)}
              className="text-left p-3 bg-white/5 border border-white/20 rounded-lg hover:border-blue-400/50 transition-all"
            >
              <img
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover rounded mb-2"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=🎬';
                }}
              />
              <h4 className="text-white text-sm font-semibold truncate">
                {movie.title}
              </h4>
              <p className="text-gray-400 text-xs">
                {getReleaseYear(movie.release_date)}
              </p>
              <div className="flex items-center mt-1">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-yellow-400 text-xs">{movie.vote_average.toFixed(1)}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
      
      {!tmdbApiKey && (
        <p className="text-yellow-400 text-xs">
          Using sample movies. Add VITE_TMDB_API_KEY for full movie search.
        </p>
      )}
    </div>
  );
};