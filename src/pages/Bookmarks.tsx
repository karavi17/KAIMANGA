import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Download, Upload } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { getImageUrl } from '../utils/image';

export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'danger' | 'info' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const loadData = () => {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const savedHistory = JSON.parse(localStorage.getItem('history') || '[]');
    setBookmarks(savedBookmarks);
    setHistory(savedHistory);
  };

  useEffect(() => {
    loadData();
    
    const handleUpdate = () => loadData();
    window.addEventListener('bookmarksUpdated', handleUpdate);
    return () => window.removeEventListener('bookmarksUpdated', handleUpdate);
  }, []);

  const clearBookmarks = () => {
    localStorage.removeItem('bookmarks');
    setBookmarks([]);
    setIsModalOpen(false);
    window.dispatchEvent(new Event('bookmarksUpdated'));
  };

  const handleBackup = () => {
    const data = {
      bookmarks,
      history
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manga-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.bookmarks) {
          localStorage.setItem('bookmarks', JSON.stringify(data.bookmarks));
        }
        if (data.history) {
          localStorage.setItem('history', JSON.stringify(data.history));
        }
        loadData();
        window.dispatchEvent(new Event('bookmarksUpdated'));
        setAlertConfig({
          isOpen: true,
          title: 'Backup Restored',
          message: 'Your bookmarks and reading history have been restored successfully!',
          type: 'success'
        });
      } catch (err) {
        console.error('Failed to parse backup file', err);
        setAlertConfig({
          isOpen: true,
          title: 'Restore Failed',
          message: 'The backup file is invalid or corrupted. Please check and try again.',
          type: 'danger'
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const removeBookmark = (id: string) => {
    const newBookmarks = bookmarks.filter(b => b.id !== id);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
    window.dispatchEvent(new Event('bookmarksUpdated'));
  };

  const getHistoryForManga = (mangaId: string) => {
    return history.find(h => h.mangaId === mangaId);
  };

  const getTimeAgo = (date: string | number) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'just now';
    if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="container-custom py-8 max-w-5xl">
      <ConfirmModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText="OK"
        showCancel={false}
        onConfirm={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={clearBookmarks}
        title="Clear all bookmarks?"
        message="This action cannot be undone. All your saved manga will be removed."
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
            <Bookmark className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookmarks</h1>
            <p className="text-gray-500 text-sm">
              {bookmarks.length} {bookmarks.length === 1 ? 'manga' : 'mangas'} saved
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBackup}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl font-bold transition text-sm"
          >
            <Download className="h-4 w-4" />
            <span>Backup Bookmark</span>
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl font-bold transition cursor-pointer text-sm">
            <Upload className="h-4 w-4" />
            <span>Upload Backup</span>
            <input type="file" accept=".json" onChange={handleUpload} className="hidden" />
          </label>

          {bookmarks.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {bookmarks.length > 0 ? (
        <div className="space-y-3">
          {bookmarks.map((manga) => {
            const lastRead = getHistoryForManga(manga.id);
            return (
              <div 
                key={manga.id} 
                className="relative bg-[#f8f8f8] dark:bg-gray-900 border-l-4 border-l-[#ff4d00] border-y border-r border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex gap-4 p-3 md:p-4 group overflow-hidden"
              >
                {/* Diagonal background pattern */}
                <div 
                  className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
                    backgroundSize: '4px 4px'
                  }}
                />

                <Link to={`/manga/${manga.id}`} className="relative z-10 shrink-0 w-20 md:w-24 h-28 md:h-32 rounded overflow-hidden shadow">
                  <img 
                    src={getImageUrl(manga.image)} 
                    alt={manga.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </Link>

                <div className="relative z-10 flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <Link to={`/manga/${manga.id}`} className="text-lg md:text-xl font-bold text-[#e53e3e] hover:text-red-700 transition line-clamp-1">
                      {manga.title}
                    </Link>
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-sm md:text-base text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">Viewed :</span>
                        {lastRead ? (
                          <Link to={`/manga/${manga.id}/${lastRead.chapterId}`} className="font-bold text-gray-900 dark:text-white hover:underline">
                            {lastRead.chapterName}
                          </Link>
                        ) : (
                          <span className="text-gray-400 italic">No history</span>
                        )}
                      </div>
                      
                      {manga.latestChapter && (
                        <div className="flex items-center gap-2 text-sm md:text-base text-gray-800 dark:text-gray-200">
                          <span className="font-semibold">Last Chapter :</span>
                          <Link to={`/manga/${manga.id}/${manga.latestChapter.id}`} className="font-bold text-[#00a3c4] hover:underline">
                            {manga.latestChapter.name}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 italic mt-2">
                    Last updated : {lastRead ? getTimeAgo(lastRead.readAt) : 'unknown'}
                  </div>
                </div>

                <button
                  onClick={() => removeBookmark(manga.id)}
                  className="relative z-10 self-start md:self-center px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white hover:text-red-600 transition"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Bookmark className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookmarks yet</h2>
          <p className="text-gray-500 max-w-xs mx-auto">
            Manga you bookmark will appear here for quick access.
          </p>
        </div>
      )}
    </div>
  );
};
