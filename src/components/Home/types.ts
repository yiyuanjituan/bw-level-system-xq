export type HomeGameMode = "venue" | "game";

export interface HomeGameRecord {
  id?: string | number;
  type?: string | number;
  venueId?: string | number;
  gameCode?: string | number;
  gameMode?: HomeGameMode | string;
  name?: string;
  image?: string;
  isOpen?: string | number | boolean;
  [key: string]: unknown;
}

export interface HomeGameSectionRecord {
  id?: string | number;
  type?: string | number;
  img?: string;
  name: string;
  pageShowNum?: number;
  children?: HomeGameRecord[];
  [key: string]: unknown;
}
