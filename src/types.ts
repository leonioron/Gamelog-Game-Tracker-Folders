export type GameStatus = 'playing' | 'completed' | 'backlog' | 'wishlist' | 'dropped' | 'paused';

export interface Game {
  id: string;
  title: string;
  coverUrl: string;
  releaseYear: number;
  genres: string[];
  platforms: string[];
  developer: string;
  summary?: string;
  bannerUrl?: string;
}

export interface ListGameItem {
  gameId: string;
  order: number;
  notes?: string;
  addedAt: string;
}

export interface GameList {
  id: string;
  folderId?: string | null; // ID da pasta pai (ou null se for lista solta)
  title: string;
  description?: string;
  isRanked: boolean;
  items: ListGameItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string; // Cor de identificação
  createdAt: string;
}

export interface UserGameStatus {
  gameId: string;
  status: GameStatus;
  rating: number; // 0 a 5 com meias estrelas (0.5, 1.0, etc.)
  isFavorite: boolean;
  review?: string;
  hoursPlayed?: number;
  completedAt?: string;
  updatedAt: string;
}

export interface GameLog {
  id: string;
  gameId: string;
  date: string; // YYYY-MM-DD
  status: GameStatus;
  rating?: number;
  review?: string;
  hoursSpent?: number;
}

export interface UserProfile {
  username: string;
  displayName: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  location: string;
  favoriteGameIds: string[];
}

export type ActiveView = 
  | 'overview' 
  | 'folders' 
  | 'playing' 
  | 'backlog' 
  | 'completed' 
  | 'wishlist' 
  | 'logs' 
  | 'catalog';
