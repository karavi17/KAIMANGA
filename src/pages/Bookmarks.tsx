import { useState, useEffect } from 'react';
import { MangaCard } from '../components/MangaCard';
import { Bookmark, Trash2, CloudSync } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const isProd = import.meta.env.PROD;
const API_BASE_URL = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/manga\/?$/, '').replace(/\/$/, '') || 
                    (isProd ? 'https://kaimanga-production.up.railway.app/api' : 'http://localhost:3000/api');

export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { isAuthenticated, token } = useAuth();

  const loadBookmarks = () => {
    const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setBookmarks(saved);
  };

  useEffect(() => {
    loadBookmarks();
    
    const handleUpdate = () => loadBookmarks();
    window.addEventListener('bookmarksUpdated', handleUpdate);
    return () => window.removeEventListener('bookmarksUpdated', handleUpdate);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      syncWithDB();
    }
  }, [isAuthenticated]);

  const syncWithDB = async () => {
    setSyncing(true);
    try {
      // 1. Get DB bookmarks
      const { data: dbBookmarks } = await axios.get(`${API_BASE_URL}/sync/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 2. Merge with local
      const localBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      
      // Use Map for deduplication by ID
      const mergedMap = new Map();
      localBookmarks.forEach((b: any) => mergedMap.set(b.id, b));
      dbBookmarks.forEach((b: any) => mergedMap.set(b.id, b));
      
      const merged = Array.from(mergedMap.values());
      
      // 3. Update both
      localStorage.setItem('bookmarks', JSON.stringify(merged));
      setBookmarks(merged);
      
      // Push back to DB to ensure DB is complete
      await axios.post(`${API_BASE_URL}/sync/bookmarks`, 
        { bookmarks: merged },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to sync with DB', err);
    } finally {
      setSyncing(false);
    }
  };

  const clearBookmarks = async () => {
    if (isAuthenticated) {
      try {
        await axios.post(`${API_BASE_URL}/sync/bookmarks`, 
          { bookmarks: [] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Failed to clear DB bookmarks', err);
      }
    }
    localStorage.removeItem('bookmarks');
    setBookmarks([]);
    setIsModalOpen(false);
    window.dispatchEvent(new Event('bookmarksUpdated'));
  };

  return (
    <div className="container-custom py-8">
      <ConfirmModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={clearBookmarks}
        title="Clear all bookmarks?"
        message="This action cannot be undone. All your saved manga will be removed."
      />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
            <Bookmark className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookmarks</h1>
            <p className="text-gray-500 text-sm">
              {bookmarks.length} {bookmarks.length === 1 ? 'manga' : 'mangas'} saved
              {isAuthenticated && ' • Synced to Cloud'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={syncWithDB}
              disabled={syncing}
              className="p-3 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition"
              title="Sync with cloud"
            >
              <CloudSync className={`h-6 w-6 ${syncing ? 'animate-spin text-orange-500' : ''}`} />
            </button>
          )}
          {bookmarks.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition"
            >
              <Trash2 className="h-5 w-5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {bookmarks.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Bookmark className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookmarks yet</h2>
          <p className="text-gray-500 max-w-xs mx-auto">
            Manga you bookmark will appear here for quick access.
            {!isAuthenticated && " Login to sync them across devices."}
          </p>
        </div>
      )}
    </div>
  );
};
