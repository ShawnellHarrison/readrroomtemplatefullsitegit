const RAWG_API_KEY = '7416f6e6d1c8424fbb0b32e5e5278083';
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export interface RAWGGame {
  id: number;
  name: string;
  background_image: string | null;
  released: string;
  rating: number;
  metacritic: number | null;
  platforms: Platform[];
  genres: Genre[];
  description_raw?: string;
  short_screenshots?: Screenshot[];
}

export interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Screenshot {
  id: number;
  image: string;
}

export interface GameBattle {
  id: string;
  title: string;
  description?: string;
  gameA: RAWGGame & { votes: number; arguments: BattleArgument[] };
  gameB: RAWGGame & { votes: number; arguments: BattleArgument[] };
  createdAt: Date;
  endsAt: Date;
  totalVotes: number;
  isActive: boolean;
}

export interface BattleArgument {
  id: string;
  battleId: string;
  gameId: number;
  userId: string;
  username: string;
  content: string;
  likes: number;
  createdAt: Date;
}

async function rawgFetch(path: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${RAWG_BASE_URL}${path}`);
  
  url.searchParams.set('key', RAWG_API_KEY);
  
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`RAWG API error: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}

export async function searchGames(query: string): Promise<RAWGGame[]> {
  if (!query.trim()) return [];
  
  try {
    const data = await rawgFetch('/games', { 
      search: query.trim(),
      page_size: 12,
      ordering: '-rating'
    });
    
    return (data?.results ?? [])
      .filter((game: any) => game.background_image) // Only games with covers
      .map((game: any) => ({
        id: game.id,
        name: game.name,
        background_image: game.background_image,
        released: game.released || '',
        rating: game.rating || 0,
        metacritic: game.metacritic,
        platforms: game.platforms || [],
        genres: game.genres || [],
        description_raw: game.description_raw
      }));
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
}

export async function getGameDetails(gameId: number): Promise<RAWGGame | null> {
  try {
    const data = await rawgFetch(`/games/${gameId}`);
    return {
      id: data.id,
      name: data.name,
      background_image: data.background_image,
      released: data.released || '',
      rating: data.rating || 0,
      metacritic: data.metacritic,
      platforms: data.platforms || [],
      genres: data.genres || [],
      description_raw: data.description_raw
    };
  } catch (error) {
    console.error('Error fetching game details:', error);
    return null;
  }
}

export function getGameCoverUrl(backgroundImage: string | null): string {
  if (!backgroundImage) {
    return 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=🎮';
  }
  return backgroundImage;
}

export function getReleaseYear(releaseDate: string): string {
  if (!releaseDate) return 'Unknown';
  return new Date(releaseDate).getFullYear().toString();
}

export function getPlatformNames(platforms: Platform[]): string[] {
  return platforms.map(p => p.platform.name);
}

export function getGenreNames(genres: Genre[]): string[] {
  return genres.map(g => g.name);
}

export function getMetacriticColor(score: number | null): string {
  if (!score) return 'text-gray-400';
  if (score >= 75) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
}