export type PlazzaTabValue = "all" | "following" | "favorites" | "likes" | "profile";

export interface PlazzaProfileStatistics {
  articles: number;
  likes: number;
  favorites: number;
}

export interface PlazzaRewardSummary {
  today: number;
  total: number;
}

export interface PlazzaProfile {
  id?: number;
  avatarUrl: string;
  nickname: string;
  isAdmin: boolean;
  followers: number;
  bio: string;
  statistics: PlazzaProfileStatistics;
  rewards: PlazzaRewardSummary;
  following?: boolean;
  isSelf?: boolean;
}

export interface PlazzaRecentGame {
  id: string | number;
  name: string;
  coverUrl: string;
  recommended?: boolean;
  favorite?: boolean;
}

export interface PlazzaPostAuthor {
  id: number;
  name: string;
  avatarUrl: string;
  isAdmin: boolean;
  followers: number;
  following: boolean;
  isSelf?: boolean;
}

export interface PlazzaPost {
  id: number;
  author: PlazzaPostAuthor;
  content: string;
  imageUrls: string[];
  createdAt: string;
  liked: boolean;
  likes: number;
  favorited: boolean;
  favorites: number;
}
