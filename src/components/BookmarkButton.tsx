import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mangaService } from '../services/api';

interface BookmarkButtonProps {
  manga: {
    id: string;
    title: string;
    image: string;
    latestChapter?: {
      id: string;
      name: string;
    };
  };
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ manga, className = "" }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkBookmark = async () => {
      // Local storage check
      const localBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const isLocal = localBookmarks.some((b: any) => b.id === manga.id);
      setIsBookmarked(isLocal);

      // If user is logged in, sync from DB
      if (user) {
        try {
          const remoteBookmarks = await mangaService.getRemoteBookmarks();
          const isRemote = remoteBookmarks.some((b: any) => b.id === manga.id);
          
          if (isRemote && !isLocal) {
            // Sync remote to local
            const mangaToSync = remoteBookmarks.find((b: any) => b.id === manga.id);
            const newLocal = [...localBookmarks, mangaToSync];
            localStorage.setItem('bookmarks', JSON.stringify(newLocal));
            setIsBookmarked(true);
          }
        } catch (err) {
          console.error('Failed to sync remote bookmarks:', err);
        }
      }
    };

    checkBookmark();
  }, [manga.id, user]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    const localBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    let newLocalBookmarks;
    
    try {
      if (isBookmarked) {
        // Remove from local
        newLocalBookmarks = localBookmarks.filter((b: any) => b.id !== manga.id);
        
        // Remove from remote if logged in
        if (user) {
          await mangaService.deleteRemoteBookmark(manga.id);
        }
      } else {
        const mangaToAdd = { 
          id: manga.id, 
          title: manga.title, 
          image: manga.image,
          latestChapter: manga.latestChapter,
          addedAt: new Date().toISOString()
        };
        
        // Add to local
        newLocalBookmarks = [...localBookmarks, mangaToAdd];
        
        // Add to remote if logged in
        if (user) {
          await mangaService.addRemoteBookmark(mangaToAdd);
        }
      }
      
      localStorage.setItem('bookmarks', JSON.stringify(newLocalBookmarks));
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('Toggle bookmark failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
        isBookmarked 
          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
          : 'bg-orange-600 text-white hover:bg-orange-700'
      } ${className} disabled:opacity-70`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isBookmarked ? (
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
