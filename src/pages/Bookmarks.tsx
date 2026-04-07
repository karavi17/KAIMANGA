import { useState, useEffect } from 'react';
import { MangaCard } from '../components/MangaCard';
import { Bookmark, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setBookmarks(saved);
  }, []);

  const handleClearAll = () => {
    localStorage.setItem('bookmarks', '[]');
    setBookmarks([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Bookmark className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">My Bookmarks</h1>
            <p className="text-sm text-gray-400">You have {bookmarks.length} saved manga</p>
          </div>
        </div>

        {bookmarks.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-400 hover:text-red-300 transition"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {bookmarks.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-6 bg-gray-800/50 rounded-full">
            <Bookmark className="h-12 w-12 text-gray-600" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-gray-300">No bookmarks yet</p>
            <p className="text-gray-500 max-w-xs">
              Manga you bookmark will appear here for quick access.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
