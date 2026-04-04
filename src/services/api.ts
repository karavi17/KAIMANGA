import axios from 'axios';
import type { HomeData, MangaDetails, SearchResult, ChapterImages } from '../types';

const API_BASE_URL = 'http://localhost:3000/api/manga';

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

  getLatest: async (page: number = 1): Promise<SearchResult> => {
    const response = await api.get(`/latest/${page}`);
    return response.data;
  },

  getPopular: async (page: number = 1): Promise<SearchResult> => {
    const response = await api.get(`/popular/${page}`);
    return response.data;
  },
};
