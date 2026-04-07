import { useState, useEffect } from 'react';
import { MangaCard } from '../components/MangaCard';
import { Bookmark, Trash2, Loader2, CloudSync } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { mangaService } from '../services/api';

export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      // Always get local bookmarks
      const local = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      
      if (user) {
        // If logged in, sync with remote
        const remote = await mangaService.getRemoteBookmarks();
        
        // Merge strategy: remote takes priority, but keep local only ones too
        const merged = [...remote];
        local.forEach((lb: any) => {
          if (!merged.some(rb => rb.id === lb.id)) {
            merged.push(lb);
            // Optionally: add this local bookmark to remote now that we're logged in
            mangaService.addRemoteBookmark(lb).catch(console.error);
          }
        });
        
        localStorage.setItem('bookmarks', JSON.stringify(merged));
        setBookmarks(merged);
      } else {
        setBookmarks(local);
      }
    } catch (err) {
      console.error('Failed to sync bookmarks:', err);
      // Fallback to local
      const local = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setBookmarks(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const handleClearAll = async () => {
    if (user) {
      setLoading(true);
      try {
        for (const b of bookmarks) {
          await mangaService.deleteRemoteBookmark(b.id);
        }
      } catch (err) {
        console.error('Failed to clear remote bookmarks:', err);
      } finally {
        setLoading(false);
      }
    }
    localStorage.setItem('bookmarks', '[]');
    setBookmarks([]);
    setIsModalOpen(false);
  };

  return (
    <div className="container-custom py-8 space-y-8">
      <ConfirmModal
        isOpen={isModalOpen}
        title="Clear Bookmarks"
        message="Are you sure you want to clear all your saved manga bookmarks? This action cannot be undone."
        confirmText="Yes, Clear All"
        cancelText="Keep Them"
        onConfirm={handleClearAll}
        onCancel={() => setIsModalOpen(false)}
        type="danger"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl shadow-inner shadow-orange-600/10">
            <Bookmark className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Bookmarks</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                {bookmarks.length} saved manga
              </p>
              {user && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase rounded-full">
                  <CloudSync className="h-3 w-3" />
                  Cloud Synced
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {loading && <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />}
          {bookmarks.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
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
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full"></div>
            <div className="relative p-10 bg-white dark:bg-gray-900 rounded-full shadow-2xl shadow-orange-500/10">
              <Bookmark className="h-20 w-20 text-gray-200 dark:text-gray-800" />
            </div>
          </div>
          <div className="space-y-2 max-w-sm">
            <p className="text-2xl font-black text-gray-900 dark:text-white">Your library is empty</p>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              Manga you bookmark will appear here for quick access across all your devices.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
