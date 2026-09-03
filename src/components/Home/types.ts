export type HomeGameMode = "venue" | "game";

export interface HomeGameRecord {
  id?: string | number;
  type?: string | number;
  venueId?: string | number;
  gameCode?: string | number;
  gameMode?: HomeGameMode | string;
  entryKey?: string;
  entryMode?: HomeGameMode | string;
  entryVenueId?: string | number;
  entryGameId?: string | number | null;
  name?: string;
  image?: string;
  square_image?: string;
  short_image?: string;
  isShowName?: string | number | boolean | null;
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

export function getHomeGameImage(game: HomeGameRecord, imageDisplay: "square" | "long") {
  const longImage = typeof game.image === "string" ? game.image.trim() : "";
  const venueSquareImage = typeof game.square_image === "string" ? game.square_image.trim() : "";
  const gameSquareImage = typeof game.short_image === "string" ? game.short_image.trim() : "";
  const isVenue = game.entryMode === "venue" || game.gameMode === "venue";
  const squareImage = isVenue ? venueSquareImage : gameSquareImage;

  return imageDisplay === "square"
    ? squareImage || longImage
    : longImage || squareImage;
}

export function shouldShowHomeGameName(game: HomeGameRecord) {
  if (game.isShowName === null || game.isShowName === undefined || game.isShowName === "") {
    // 兼容未携带新字段的旧缓存：场馆默认隐藏名称，游戏默认展示名称。
    return game.entryMode !== "venue" && game.gameMode !== "venue";
  }

  return game.isShowName === true || game.isShowName === 1 || game.isShowName === "1";
}
