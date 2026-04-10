import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface BookmarkButtonProps {
  manga: {
    id: string;
    title: string;
    image: string;
    latestChapter?: {
      name: string;
      id: string;
    };
  };
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ manga }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setIsBookmarked(bookmarks.some((b: any) => b.id === manga.id));
  }, [manga.id]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((b: any) => b.id !== manga.id);
    } else {
      newBookmarks = [...bookmarks, manga];
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('bookmarksUpdated'));
  };

  return (
    <button
      onClick={toggleBookmark}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 ${
        isBookmarked 
          ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {isBookmarked ? (
        <>
          <BookmarkCheck className="h-5 w-5" />
          <span>Bookmarked</span>
        </>
      ) : (
        <>
          <Bookmark className="h-5 w-5" />
          <span>Bookmark</span>
        </>
      )}
    </button>
  );
};
