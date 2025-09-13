// Spotify Web API integration for Music Battle Arena
// Note: This is a simplified implementation - full Spotify integration would require OAuth

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  release_date: string;
  total_tracks: number;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface MusicBattle {
  id: string;
  title: string;
  description?: string;
  itemA: (SpotifyTrack | SpotifyArtist | SpotifyAlbum) & { votes: number; arguments: BattleArgument[] };
  itemB: (SpotifyTrack | SpotifyArtist | SpotifyAlbum) & { votes: number; arguments: BattleArgument[] };
  battleType: 'track' | 'artist' | 'album';
  createdAt: Date;
  endsAt: Date;
  totalVotes: number;
  isActive: boolean;
}

export interface BattleArgument {
  id: string;
  battleId: string;
  itemId: string;
  userId: string;
  username: string;
  content: string;
  likes: number;
  createdAt: Date;
}

// Sample music data for fallback (when Spotify API is not available)
export const sampleTracks: SpotifyTrack[] = [
  {
    id: 'sample-1',
    name: 'Anti-Hero',
    artists: [{ id: 'taylor-swift', name: 'Taylor Swift', genres: ['pop'], popularity: 100, followers: { total: 50000000 }, images: [], external_urls: { spotify: '' } }],
    album: { id: 'midnights', name: 'Midnights', artists: [], release_date: '2022-10-21', total_tracks: 13, images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5', height: 640, width: 640 }], external_urls: { spotify: '' } },
    duration_ms: 200000,
    popularity: 95,
    preview_url: null,
    external_urls: { spotify: 'https://open.spotify.com/track/4Dvkj6JzO9wlsP8CodjuFm' }
  },
  {
    id: 'sample-2',
    name: 'Flowers',
    artists: [{ id: 'miley-cyrus', name: 'Miley Cyrus', genres: ['pop'], popularity: 90, followers: { total: 30000000 }, images: [], external_urls: { spotify: '' } }],
    album: { id: 'endless-summer', name: 'Endless Summer Vacation', artists: [], release_date: '2023-03-10', total_tracks: 12, images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273f4d5f8d5f8d5f8d5f8d5f8d5', height: 640, width: 640 }], external_urls: { spotify: '' } },
    duration_ms: 180000,
    popularity: 92,
    preview_url: null,
    external_urls: { spotify: 'https://open.spotify.com/track/1BxfuPKGuaTgP7aM0Bbdwr' }
  }
];

export const sampleArtists: SpotifyArtist[] = [
  {
    id: 'taylor-swift',
    name: 'Taylor Swift',
    genres: ['pop', 'country'],
    popularity: 100,
    followers: { total: 50000000 },
    images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb859e4c14fa59296c8fe626c1', height: 640, width: 640 }],
    external_urls: { spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02' }
  },
  {
    id: 'beyonce',
    name: 'Beyoncé',
    genres: ['pop', 'r&b'],
    popularity: 98,
    followers: { total: 45000000 },
    images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb12e3f20d2ae4f2c8b0f6b5c1', height: 640, width: 640 }],
    external_urls: { spotify: 'https://open.spotify.com/artist/6vWDO969PvNqNYHIOW5v0m' }
  }
];

// Utility functions
export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getArtistImage = (artist: SpotifyArtist, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!artist.images || artist.images.length === 0) {
    return 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=🎵';
  }
  
  const sizeIndex = size === 'large' ? 0 : size === 'medium' ? 1 : 2;
  return artist.images[sizeIndex]?.url || artist.images[0]?.url || 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=🎵';
};

export const getAlbumImage = (album: SpotifyAlbum, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!album.images || album.images.length === 0) {
    return 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=💿';
  }
  
  const sizeIndex = size === 'large' ? 0 : size === 'medium' ? 1 : 2;
  return album.images[sizeIndex]?.url || album.images[0]?.url || 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=💿';
};

export const getGenreColor = (genre: string): string => {
  const genreColors: { [key: string]: string } = {
    'pop': 'bg-pink-500/20 text-pink-400',
    'rock': 'bg-red-500/20 text-red-400',
    'hip-hop': 'bg-purple-500/20 text-purple-400',
    'rap': 'bg-purple-500/20 text-purple-400',
    'country': 'bg-yellow-500/20 text-yellow-400',
    'jazz': 'bg-blue-500/20 text-blue-400',
    'classical': 'bg-indigo-500/20 text-indigo-400',
    'electronic': 'bg-cyan-500/20 text-cyan-400',
    'r&b': 'bg-orange-500/20 text-orange-400',
    'folk': 'bg-green-500/20 text-green-400',
    'alternative': 'bg-gray-500/20 text-gray-400',
    'indie': 'bg-violet-500/20 text-violet-400'
  };
  
  return genreColors[genre.toLowerCase()] || 'bg-gray-500/20 text-gray-400';
};

// Search functions (would require Spotify API token in production)
export const searchTracks = async (query: string): Promise<SpotifyTrack[]> => {
  // In production, this would use the Spotify Web API
  // For now, return sample data filtered by query
  return sampleTracks.filter(track => 
    track.name.toLowerCase().includes(query.toLowerCase()) ||
    track.artists.some(artist => artist.name.toLowerCase().includes(query.toLowerCase()))
  );
};

export const searchArtists = async (query: string): Promise<SpotifyArtist[]> => {
  return sampleArtists.filter(artist => 
    artist.name.toLowerCase().includes(query.toLowerCase())
  );
};