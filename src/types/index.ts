export type VotingType = 'yes-no' | 'multiple-choice' | 'scale' | 'ranked-choice' | 'movie_battle';

export interface UseCaseTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  defaultType: VotingType;
  examples: string[];
  suggestedOptions?: string[];
}

export interface VoteRecord {
  id: string;
  roomId: string;
  value: any; // e.g., {choice:'Yes'} | {optionId:'...'} | {score:number} | {movieId:number}
  timestamp: Date;
  sessionId: string;
}

export interface VoteRoom {
  id: string;
  title: string;
  description?: string;
  category?: string;
  type: VotingType;
  items: any[];           // for movie_battle: [TMDBMovie, TMDBMovie]
  scaleMin?: number;
  scaleMax?: number;
  deadline?: Date;
  createdAt: Date;
  isActive: boolean;
  votes: VoteRecord[];
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
}

export interface BattleLike {
  id: string;
  title: string;
  description?: string;
  movieA: TMDBMovie & { votes: number };
  movieB: TMDBMovie & { votes: number };
  createdAt: Date;
  endsAt?: Date | null;
  totalVotes: number;
  isActive: boolean;
}

export interface VoteResult {
  option: string;
  count: number;
  percentage: number;
}

export interface ScaleResult {
  option: string;
  average: number;
  distribution: { [score: number]: number };
  totalVotes: number;
}

export interface RankedResult {
  option: string;
  points: number;
  averageRank: number;
  totalVotes: number;
}

export interface RankingItem {
  id: string;
  title: string;
  creator: string;
  year: string;
  genre?: string;
  externalLink?: string;
}

export interface Battle {
  id: string;
  created_by: string;
  title: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  options: BattleOption[];
  votes: Vote[];
  arguments: Argument[];
}

export interface BattleOption {
  id: string;
  battle_id: string;
  label: string;
  image_url?: string;
  created_at: string;
  vote_count: number;
}

export interface Argument {
  id: string;
  battle_id: string;
  option_id: string;
  user_id: string;
  content: string;
  likes: number;
  created_at: string;
}

export interface MovieBattle {
  id: string;
  title: string;
  description?: string | null;
  endsAt: string | Date;
  createdAt: string;
  totalVotes: number;
  movieA: MovieWithVotes;
  movieB: MovieWithVotes;
}

export interface MovieWithVotes {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  votes: number;
  arguments: BattleArgument[];
}

export interface BattleArgument {
  id: string;
  battle_id: string;
  movie_slot: 'A' | 'B';
  content: string;
  likes: number;
  author: string | null;
  created_at: string;
}

export interface ShareData {
  type: 'vote' | 'argument' | 'result' | 'battle';
  movie?: MovieWithVotes;
  movieTitle?: string;
  argument?: string;
  author?: string;
  winner?: MovieWithVotes;
  loser?: MovieWithVotes;
  percentage?: number;
  battleUrl: string;
}