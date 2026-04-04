export interface Manga {
  id: string;
  title: string;
  image: string;
  latestChapter?: {
    id: string;
    name: string;
  };
  views?: string | number;
  genres?: string[];
  author?: string;
  status?: string;
  description?: string;
}

export interface MangaDetails extends Manga {
  altTitles?: string;
  chapters: Chapter[];
  anilistId?: number;
  poster?: string;
  banner?: string;
}

export interface Chapter {
  id: string;
  name: string;
  date: string;
}

export interface ChapterImages {
  id: string;
  title: string;
  mangaId: string;
  mangaTitle: string;
  images: string[];
  prevChapter: string | null;
  nextChapter: string | null;
  allChapters: { id: string; name: string }[];
}

export interface HomeData {
  popularManga: {
    title: string;
    mangas: Manga[];
  };
  latestUpdates: {
    title: string;
    mangas: Manga[];
  };
}

export interface SearchResult {
  mangas: Manga[];
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
  totalMangas: number;
}
