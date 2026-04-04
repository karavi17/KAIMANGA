import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface BookmarkButtonProps {
  manga: {
    id: string;
    title: string;
    image: string;
  };
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ manga, className = "" }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setIsBookmarked(bookmarks.some((b: any) => b.id === manga.id));
  }, [manga.id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((b: any) => b.id !== manga.id);
    } else {
      newBookmarks = [...bookmarks, { 
        id: manga.id, 
        title: manga.title, 
        image: manga.image,
        addedAt: new Date().toISOString()
      }];
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  return (
    <button
      onClick={toggleBookmark}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
        isBookmarked 
          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
          : 'bg-orange-600 text-white hover:bg-orange-700'
      } ${className}`}
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
