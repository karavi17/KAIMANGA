import axios from 'axios';
import type { HomeData, MangaDetails, SearchResult, ChapterImages, Manga } from '../types';

/** Override with e.g. VITE_API_BASE=http://127.0.0.1:3000/api/manga in .env (must match your Node server). */
const isProd = import.meta.env.PROD;
const API_BASE_URL = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') || 
                    (isProd ? 'https://kaimanga-production.up.railway.app/api/manga' : 'http://localhost:3000/api/manga');

const api = axios.create({
  baseURL: API_BASE_URL,
});

type CacheEntry<T> = { expiry: number; data: T };
const memCache = new Map<string, CacheEntry<any>>();
const inFlight = new Map<string, Promise<any>>();

function ttlFor(path: string) {
  if (path.startsWith('/home')) return 300_000;
  if (path.startsWith('/genres')) return 86_400_000;
  if (path.startsWith('/details')) return 900_000;
  if (path.startsWith('/read')) return 3_600_000;
  if (path.startsWith('/browse')) return 300_000;
  if (path.startsWith('/search')) return 120_000;
  return 300_000;
}

async function fetchWithCache<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const key = `${path}|${params ? JSON.stringify(params) : ''}`;
  const now = Date.now();
  const cached = memCache.get(key);
  if (cached && cached.expiry > now) return cached.data as T;
  if (inFlight.has(key)) return inFlight.get(key) as Promise<T>;
  const p = (async () => {
    const response = await api.get<T>(path, { params });
    const data = response.data;
    memCache.set(key, { expiry: now + ttlFor(path), data });
    return data;
  })();
  inFlight.set(key, p);
  try {
    return await p;
  } finally {
    inFlight.delete(key);
  }
}

export const mangaService = {
  getHome: async (): Promise<HomeData> => {
    return fetchWithCache<HomeData>('/home');
  },

  searchManga: async (query: string, page: number = 1): Promise<SearchResult> => {
    return fetchWithCache<SearchResult>(`/search/${query}/${page}`);
  },

  getMangaDetails: async (id: string): Promise<MangaDetails> => {
    return fetchWithCache<MangaDetails>(`/details/${id}`);
  },

  getChapterImages: async (mangaId: string, chapterId: string): Promise<ChapterImages> => {
    return fetchWithCache<ChapterImages>(`/read/${mangaId}/${chapterId}`);
  },

  getBrowse: async (
    type: string, 
    page: number = 1, 
    filters?: { category?: string; state?: string; alpha?: string }
  ): Promise<SearchResult> => {
    return fetchWithCache<SearchResult>(`/browse/${type}/${page}`, filters);
  },

  getGenres: async (): Promise<{ id: string; name: string }[]> => {
    return fetchWithCache<{ id: string; name: string }[]>('/genres');
  },

  getLatest: async (page: number = 1, category?: string): Promise<SearchResult> => {
    return mangaService.getBrowse('latest', page, { category });
  },

  getPopular: async (page: number = 1, category?: string): Promise<SearchResult> => {
    return mangaService.getBrowse('hot', page, { category });
  },

  getRecommendations: async (): Promise<Manga[]> => {
    try {
      // 1. Get user's recent history/bookmarks to find favorite genres
      const mHistory = JSON.parse(localStorage.getItem('manga-history') || '[]');
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      
      // Map history and bookmarks together to find interests
      const allInterests = [...mHistory, ...bookmarks];
      if (allInterests.length === 0) {
        // Fallback: get top popular manga
        const popular = await mangaService.getPopular(1);
        return popular.mangas.slice(0, 10);
      }

      // 2. Extract genres from history/bookmarks
      const genreCounts: Record<string, number> = {};
      allInterests.forEach(m => {
        if (m.genres) {
          m.genres.forEach((g: string) => {
            genreCounts[g] = (genreCounts[g] || 0) + 1;
          });
        }
      });

      // 3. Pick top 2 favorite genres
      const favoriteGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(entry => entry[0]);

      if (favoriteGenres.length === 0) {
        const popular = await mangaService.getPopular(1);
        return popular.mangas.slice(0, 10);
      }

      // 4. Fetch manga from these genres
      const results = await Promise.all(
        favoriteGenres.map(genreId => 
          mangaService.getBrowse('hot', 1, { category: genreId })
        )
      );

      // 5. Merge, deduplicate, and filter out already seen
      const recommended = results.flatMap(r => r.mangas);
      const uniqueRecommended = Array.from(new Map(recommended.map(m => [m.id, m])).values());
      
      return uniqueRecommended
        .filter(m => !allInterests.some(i => i.id === m.id))
        .slice(0, 12);
    } catch (err) {
      console.error('Failed to get recommendations', err);
      return [];
    }
  },
};
