const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1';

export interface GoogleBook {
  id: string;
  title: string;
  authors: string[];
  publishedDate: string;
  description: string;
  pageCount: number;
  averageRating: number;
  ratingsCount: number;
  imageLinks: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  categories: string[];
  language: string;
  readingTime: number; // estimated minutes
}

export interface BookBattle {
  id: string;
  title: string;
  description?: string;
  bookA: GoogleBook & { votes: number; arguments: BattleArgument[] };
  bookB: GoogleBook & { votes: number; arguments: BattleArgument[] };
  createdAt: Date;
  endsAt: Date;
  totalVotes: number;
  isActive: boolean;
}

export interface BattleArgument {
  id: string;
  battleId: string;
  bookId: string;
  userId: string;
  username: string;
  content: string;
  likes: number;
  createdAt: Date;
}

async function googleBooksFetch(path: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${GOOGLE_BOOKS_BASE_URL}${path}`);
  
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Google Books API error: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}

const processBookData = (book: any): GoogleBook => {
  const volumeInfo = book.volumeInfo || {};
  
  return {
    id: book.id,
    title: volumeInfo.title || 'Unknown Title',
    authors: volumeInfo.authors || ['Unknown Author'],
    publishedDate: volumeInfo.publishedDate || '',
    description: volumeInfo.description || 'No description available',
    pageCount: volumeInfo.pageCount || 0,
    averageRating: volumeInfo.averageRating || 0,
    ratingsCount: volumeInfo.ratingsCount || 0,
    imageLinks: volumeInfo.imageLinks || {},
    categories: volumeInfo.categories || ['Uncategorized'],
    language: volumeInfo.language || 'en',
    readingTime: Math.ceil((volumeInfo.pageCount || 250) / 250 * 60) // minutes, assuming 250 words/page, 250 words/minute
  };
};

export async function searchBooks(query: string, maxResults: number = 12): Promise<GoogleBook[]> {
  if (!query.trim()) return [];
  
  try {
    const data = await googleBooksFetch('/volumes', { 
      q: query.trim(),
      maxResults,
      startIndex: 0,
      orderBy: 'relevance',
      printType: 'books',
      langRestrict: 'en'
    });
    
    return (data?.items ?? [])
      .filter((book: any) => book.volumeInfo?.imageLinks?.thumbnail) // Only books with covers
      .map(processBookData)
      .slice(0, maxResults);
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

export async function getBookDetails(bookId: string): Promise<GoogleBook | null> {
  try {
    const data = await googleBooksFetch(`/volumes/${bookId}`);
    return processBookData(data);
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}

export async function searchByGenre(genre: string): Promise<GoogleBook[]> {
  try {
    const data = await googleBooksFetch('/volumes', {
      q: `subject:${genre}`,
      maxResults: 20,
      orderBy: 'newest'
    });
    
    return (data?.items ?? [])
      .filter((book: any) => book.volumeInfo?.imageLinks?.thumbnail)
      .map(processBookData);
  } catch (error) {
    console.error('Error searching by genre:', error);
    return [];
  }
}

export async function searchBestsellers(): Promise<GoogleBook[]> {
  try {
    const data = await googleBooksFetch('/volumes', {
      q: 'bestseller',
      maxResults: 40,
      orderBy: 'relevance'
    });
    
    return (data?.items ?? [])
      .filter((book: any) => book.volumeInfo?.imageLinks?.thumbnail)
      .map(processBookData);
  } catch (error) {
    console.error('Error searching bestsellers:', error);
    return [];
  }
}

export function getBookCoverUrl(imageLinks: GoogleBook['imageLinks'], size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string {
  if (!imageLinks?.thumbnail) {
    return 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=📚';
  }
  
  // Google Books provides different zoom levels
  const baseUrl = imageLinks.thumbnail.replace('&zoom=1', '');
  
  switch (size) {
    case 'thumbnail':
      return `${baseUrl}&zoom=0`;
    case 'small':
      return `${baseUrl}&zoom=1`;
    case 'medium':
      return `${baseUrl}&zoom=2`;
    case 'large':
      return `${baseUrl}&zoom=3`;
    default:
      return imageLinks.thumbnail;
  }
}

export function getPublicationYear(publishedDate: string): string {
  if (!publishedDate) return 'Unknown';
  return new Date(publishedDate).getFullYear().toString();
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

export function getGenreColor(category: string): string {
  const genreColors: { [key: string]: string } = {
    'Fiction': 'bg-blue-500/20 text-blue-400',
    'Fantasy': 'bg-purple-500/20 text-purple-400',
    'Science Fiction': 'bg-cyan-500/20 text-cyan-400',
    'Mystery': 'bg-gray-500/20 text-gray-400',
    'Romance': 'bg-pink-500/20 text-pink-400',
    'Thriller': 'bg-red-500/20 text-red-400',
    'Horror': 'bg-orange-500/20 text-orange-400',
    'Biography': 'bg-green-500/20 text-green-400',
    'History': 'bg-yellow-500/20 text-yellow-400',
    'Self-Help': 'bg-indigo-500/20 text-indigo-400',
    'Business': 'bg-emerald-500/20 text-emerald-400',
    'Young Adult': 'bg-violet-500/20 text-violet-400'
  };
  
  return genreColors[category] || 'bg-gray-500/20 text-gray-400';
}

// Sample books for fallback
export const sampleBooks: GoogleBook[] = [
  {
    id: 'nggnmAEACAAJ',
    title: 'The Name of the Wind',
    authors: ['Patrick Rothfuss'],
    publishedDate: '2007-03-27',
    description: 'Told in Kvothe\'s own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.',
    pageCount: 662,
    averageRating: 4.5,
    ratingsCount: 12847,
    imageLinks: {
      thumbnail: 'https://books.google.com/books/content?id=nggnmAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'
    },
    categories: ['Fiction', 'Fantasy'],
    language: 'en',
    readingTime: 397
  },
  {
    id: 'yl4dILkcqm4C',
    title: 'The Way of Kings',
    authors: ['Brandon Sanderson'],
    publishedDate: '2010-08-31',
    description: 'Roshar is a world of stone and storms. Uncanny tempests of incredible power sweep across the rocky terrain.',
    pageCount: 1007,
    averageRating: 4.6,
    ratingsCount: 8932,
    imageLinks: {
      thumbnail: 'https://books.google.com/books/content?id=yl4dILkcqm4C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api'
    },
    categories: ['Fiction', 'Fantasy'],
    language: 'en',
    readingTime: 604
  },
  {
    id: 'wrOQLV6xB-wC',
    title: 'The Hunger Games',
    authors: ['Suzanne Collins'],
    publishedDate: '2008-09-14',
    description: 'Set in a dark vision of the near future, a terrifying reality TV show is taking place.',
    pageCount: 374,
    averageRating: 4.3,
    ratingsCount: 15632,
    imageLinks: {
      thumbnail: 'https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1&source=gbs_api'
    },
    categories: ['Young Adult Fiction', 'Dystopian'],
    language: 'en',
    readingTime: 224
  },
  {
    id: 'PGR2AwAAQBAJ',
    title: 'Dune',
    authors: ['Frank Herbert'],
    publishedDate: '1965-08-01',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.',
    pageCount: 688,
    averageRating: 4.4,
    ratingsCount: 9876,
    imageLinks: {
      thumbnail: 'https://books.google.com/books/content?id=PGR2AwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'
    },
    categories: ['Science Fiction'],
    language: 'en',
    readingTime: 413
  },
  {
    id: 'yxv1LK5gyEYC',
    title: 'The Girl with the Dragon Tattoo',
    authors: ['Stieg Larsson'],
    publishedDate: '2005-08-01',
    description: 'Murder mystery, family saga, love story, and financial intrigue combine into one satisfyingly complex and entertainingly atmospheric novel.',
    pageCount: 590,
    averageRating: 4.1,
    ratingsCount: 7543,
    imageLinks: {
      thumbnail: 'https://books.google.com/books/content?id=yxv1LK5gyEYC&printsec=frontcover&img=1&zoom=1&source=gbs_api'
    },
    categories: ['Mystery', 'Thriller'],
    language: 'en',
    readingTime: 354
  }
];