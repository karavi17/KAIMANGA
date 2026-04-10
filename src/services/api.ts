import axios from 'axios';
import type { HomeData, MangaDetails, SearchResult, ChapterImages } from '../types';

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
};
