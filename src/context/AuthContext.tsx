import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isProd = import.meta.env.PROD;
const API_BASE_URL = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/manga\/?$/, '').replace(/\/$/, '') || 
                    (isProd ? 'https://kaimanga-production.up.railway.app/api' : 'http://localhost:3000/api');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchBookmarksFromDB(savedToken);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    
    // Sync and fetch bookmarks
    syncAndFetchBookmarks(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('bookmarks');
    window.dispatchEvent(new Event('bookmarksUpdated'));
  };

  const fetchBookmarksFromDB = async (authToken: string) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/sync/bookmarks`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const localBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const mergedMap = new Map();
      localBookmarks.forEach((b: any) => mergedMap.set(b.id, b));
      data.forEach((b: any) => mergedMap.set(b.id, b));
      
      const merged = Array.from(mergedMap.values());
      localStorage.setItem('bookmarks', JSON.stringify(merged));
      window.dispatchEvent(new Event('bookmarksUpdated'));
    } catch (err) {
      console.error('Failed to fetch bookmarks from DB:', err);
    }
  };

  const syncAndFetchBookmarks = async (authToken: string) => {
    const localBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    try {
      // 1. Push local bookmarks to DB
      if (localBookmarks.length > 0) {
        await axios.post(`${API_BASE_URL}/sync/bookmarks`, 
          { bookmarks: localBookmarks },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }
      
      // 2. Fetch all bookmarks from DB (including merged ones)
      await fetchBookmarksFromDB(authToken);
    } catch (err) {
      console.error('Failed to sync/fetch bookmarks:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
