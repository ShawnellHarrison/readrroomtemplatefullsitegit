const TMDB_API_KEY = 'b9dc66eceb6f00734b92daa276f73293';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOWRjNjZlY2ViNmYwMDczNGI5MmRhYTI3NmY3MzI5MyIsIm5iZiI6MTc1NzEzMjUzNS43Nywic3ViIjoiNjhiYmI2ZjdiNGI0NzQwMDBjMWY0YjY0Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.ZCQLYOqZ2-QqD8CKWJ91MEn4eXjEbkZQBD-omXmhXU8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export interface MovieBattle {
  id: string;
  title: string;
  description?: string;
  movieA: TMDBMovie & { votes: number; arguments: BattleArgument[] };
  movieB: TMDBMovie & { votes: number; arguments: BattleArgument[] };
  createdAt: Date;
  endsAt: Date;
  totalVotes: number;
  isActive: boolean;
}

export interface BattleArgument {
  id: string;
  battleId: string;
  movieId: number;
  userId: string;
  username: string;
  content: string;
  likes: number;
  createdAt: Date;
}

async function tmdbFetch(path: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  
  // Use API key for requests
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  if (!query.trim()) return [];
  
  try {
    const data = await tmdbFetch('/search/movie', { 
      query: query.trim(), 
      include_adult: false, 
      page: 1 
    });
    
    return (data?.results ?? [])
      .filter((movie: any) => movie.poster_path) // Only movies with posters
      .slice(0, 12);
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
  try {
    const data = await tmdbFetch(`/movie/${movieId}`);
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

export function getPosterUrl(posterPath: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!posterPath) {
    return 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=🎬';
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}

export function getReleaseYear(releaseDate: string): string {
  if (!releaseDate) return 'Unknown';
  return new Date(releaseDate).getFullYear().toString();
}