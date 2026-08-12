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
  avatarUrl: string;
  nickname: string;
  followers: number;
  bio: string;
  statistics: PlazzaProfileStatistics;
  rewards: PlazzaRewardSummary;
}

export interface PlazzaRecentGame {
  id: string | number;
  name: string;
  coverUrl: string;
  recommended?: boolean;
  favorite?: boolean;
}

export interface PlazzaPostAuthor {
  name: string;
  avatarUrl: string;
  followers: number;
  following: boolean;
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
