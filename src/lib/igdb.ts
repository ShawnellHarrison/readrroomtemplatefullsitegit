// IGDB API integration for Game Battle Arena
// Note: This requires a backend proxy due to CORS restrictions
// For now, we'll use sample data and can integrate with your server later

export interface IGDBGame {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  genres?: Array<{
    id: number;
    name: string;
  }>;
  first_release_date?: number;
  platforms?: Array<{
    id: number;
    name: string;
  }>;
  slug: string;
  rating?: number;
  summary?: string;
}

export interface GameBattle {
  id: string;
  title: string;
  description?: string;
  gameA: IGDBGame & { votes: number; arguments: BattleArgument[] };
  gameB: IGDBGame & { votes: number; arguments: BattleArgument[] };
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

// Sample games for fallback when IGDB API is not available
export const sampleGames: IGDBGame[] = [
  {
    id: 1942,
    name: "The Witcher 3: Wild Hunt",
    cover: {
      id: 82419,
      url: "//images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg"
    },
    genres: [
      { id: 12, name: "Role-playing (RPG)" },
      { id: 31, name: "Adventure" }
    ],
    first_release_date: 1431993600,
    platforms: [
      { id: 6, name: "PC (Microsoft Windows)" },
      { id: 48, name: "PlayStation 4" },
      { id: 49, name: "Xbox One" }
    ],
    slug: "the-witcher-3-wild-hunt",
    rating: 94.5,
    summary: "The Witcher 3: Wild Hunt is a story-driven, next-generation open world role-playing game."
  },
  {
    id: 11208,
    name: "Cyberpunk 2077",
    cover: {
      id: 91488,
      url: "//images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg"
    },
    genres: [
      { id: 12, name: "Role-playing (RPG)" },
      { id: 5, name: "Shooter" }
    ],
    first_release_date: 1607558400,
    platforms: [
      { id: 6, name: "PC (Microsoft Windows)" },
      { id: 48, name: "PlayStation 4" },
      { id: 49, name: "Xbox One" }
    ],
    slug: "cyberpunk-2077",
    rating: 78.2,
    summary: "Cyberpunk 2077 is an open-world, action-adventure story set in Night City."
  },
  {
    id: 1877,
    name: "Red Dead Redemption 2",
    cover: {
      id: 76663,
      url: "//images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg"
    },
    genres: [
      { id: 31, name: "Adventure" },
      { id: 5, name: "Shooter" }
    ],
    first_release_date: 1540512000,
    platforms: [
      { id: 6, name: "PC (Microsoft Windows)" },
      { id: 48, name: "PlayStation 4" },
      { id: 49, name: "Xbox One" }
    ],
    slug: "red-dead-redemption-2",
    rating: 93.0,
    summary: "Red Dead Redemption 2 is a Western-themed action-adventure game."
  },
  {
    id: 121,
    name: "Minecraft",
    cover: {
      id: 78,
      url: "//images.igdb.com/igdb/image/upload/t_cover_big/co49g.jpg"
    },
    genres: [
      { id: 31, name: "Adventure" },
      { id: 32, name: "Indie" }
    ],
    first_release_date: 1290470400,
    platforms: [
      { id: 6, name: "PC (Microsoft Windows)" },
      { id: 48, name: "PlayStation 4" },
      { id: 49, name: "Xbox One" }
    ],
    slug: "minecraft",
    rating: 89.5,
    summary: "Minecraft is a sandbox video game originally created by Swedish programmer Markus Persson."
  },
  {
    id: 1905,
    name: "Fortnite",
    cover: {
      id: 81620,
      url: "//images.igdb.com/igdb/image/upload/t_cover_big/co1t9l.jpg"
    },
    genres: [
      { id: 5, name: "Shooter" },
      { id: 25, name: "Arcade" }
    ],
    first_release_date: 1500940800,
    platforms: [
      { id: 6, name: "PC (Microsoft Windows)" },
      { id: 48, name: "PlayStation 4" },
      { id: 49, name: "Xbox One" }
    ],
    slug: "fortnite",
    rating: 83.2,
    summary: "Fortnite is a co-op sandbox survival game developed by Epic Games."
  }
];

// Search games function (fallback to sample data for now)
export async function searchGames(query: string): Promise<IGDBGame[]> {
  // In production, this would call your backend proxy
  // For now, filter sample games
  if (!query.trim()) return sampleGames.slice(0, 6);
  
  return sampleGames.filter(game =>
    game.name.toLowerCase().includes(query.toLowerCase()) ||
    game.genres?.some(genre => genre.name.toLowerCase().includes(query.toLowerCase()))
  );
}

export async function getGameDetails(gameId: number): Promise<IGDBGame | null> {
  return sampleGames.find(game => game.id === gameId) || null;
}

export function getGameCoverUrl(coverUrl: string | undefined, size: 'thumb' | 'cover_small' | 'cover_big' = 'cover_big'): string {
  if (!coverUrl) {
    return 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=🎮';
  }
  
  // Convert IGDB URL format
  const cleanUrl = coverUrl.replace('//', 'https://');
  return cleanUrl.replace('t_thumb', `t_${size}`);
}

export function getReleaseYear(timestamp?: number): string {
  if (!timestamp) return 'Unknown';
  return new Date(timestamp * 1000).getFullYear().toString();
}

export function getPlatformNames(platforms?: Array<{name: string}>): string[] {
  return platforms?.map(p => p.name) || [];
}

export function getGenreNames(genres?: Array<{name: string}>): string[] {
  return genres?.map(g => g.name) || [];
}

export function getRatingColor(rating?: number): string {
  if (!rating) return 'text-gray-400';
  if (rating >= 90) return 'text-green-400';
  if (rating >= 75) return 'text-yellow-400';
  if (rating >= 60) return 'text-orange-400';
  return 'text-red-400';
}