import axios from 'axios';
import type { HomeData, MangaDetails, SearchResult, ChapterImages } from '../types';

/** Override with e.g. VITE_API_BASE=http://127.0.0.1:3000/api/manga in .env (must match your Node server). */
const API_BASE_URL = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3000/api/manga';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const mangaService = {
  getHome: async (): Promise<HomeData> => {
    const response = await api.get('/home');
    return response.data;
  },

  searchManga: async (query: string, page: number = 1): Promise<SearchResult> => {
    const response = await api.get(`/search/${query}/${page}`);
    return response.data;
  },

  getMangaDetails: async (id: string): Promise<MangaDetails> => {
    const response = await api.get(`/details/${id}`);
    return response.data;
  },

  getChapterImages: async (mangaId: string, chapterId: string): Promise<ChapterImages> => {
    const response = await api.get(`/read/${mangaId}/${chapterId}`);
    return response.data;
  },

  getBrowse: async (
    type: string, 
    page: number = 1, 
    filters?: { category?: string; state?: string; alpha?: string }
  ): Promise<SearchResult> => {
    const response = await api.get(`/browse/${type}/${page}`, { params: filters });
    return response.data;
  },

  getGenres: async (): Promise<{ id: string; name: string }[]> => {
    const response = await api.get('/genres');
    return response.data;
  },

  getLatest: async (page: number = 1, category?: string): Promise<SearchResult> => {
    return mangaService.getBrowse('latest', page, { category });
  },

  getPopular: async (page: number = 1, category?: string): Promise<SearchResult> => {
    return mangaService.getBrowse('hot', page, { category });
  },
};
