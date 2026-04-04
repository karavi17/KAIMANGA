import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Trash2, Clock, BookOpen } from 'lucide-react';
import { getImageUrl } from '../utils/image';
import { ConfirmModal } from '../components/ConfirmModal';

export const History = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('history') || '[]');
    setHistory(saved);
  }, []);

  const handleClearHistory = () => {
    localStorage.setItem('history', '[]');
    setHistory([]);
  };

  const removeItem = (mangaId: string) => {
    const newHistory = history.filter(h => h.mangaId !== mangaId);
    localStorage.setItem('history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ConfirmModal
        isOpen={isModalOpen}
        title="Clear Reading History"
        message="Are you sure you want to clear your entire reading history? You won't be able to see where you left off."
        confirmText="Yes, Clear History"
        cancelText="Keep It"
        onConfirm={handleClearHistory}
        onCancel={() => setIsModalOpen(false)}
        type="danger"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <HistoryIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Reading History</h1>
            <p className="text-sm text-gray-400">Continue where you left off</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-400 hover:text-red-300 transition"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.mangaId} 
              className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition p-4 flex gap-4"
            >
              <Link to={`/manga/${item.mangaId}`} className="shrink-0 w-20 h-28 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={getImageUrl(item.image)} 
                  alt={item.mangaTitle} 
                  className="w-full h-full object-cover"
                />
              </Link>
              
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div className="space-y-1">
                  <Link to={`/manga/${item.mangaId}`} className="text-lg font-bold text-gray-100 hover:text-blue-400 transition line-clamp-1">
                    {item.mangaTitle}
                  </Link>
                  <Link to={`/manga/${item.mangaId}/${item.chapterId}`} className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
                    <BookOpen className="h-4 w-4" />
                    Last read: {item.chapterName}
                  </Link>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.readAt).toLocaleDateString()} {new Date(item.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.mangaId)}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                title="Remove from history"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-6 bg-gray-800/50 rounded-full">
            <HistoryIcon className="h-12 w-12 text-gray-600" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-gray-300">Your history is empty</p>
            <p className="text-gray-500 max-w-xs mx-auto">
              Start reading manga and they will appear here automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
