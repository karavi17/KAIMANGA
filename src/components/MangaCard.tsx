import { Link } from 'react-router-dom';
import type { Manga } from '../types';
import { getImageUrl } from '../utils/image';
import { ChevronRight } from 'lucide-react';
import { mangaService } from '../services/api';

interface MangaCardProps {
  manga: Manga;
}

export const MangaCard = ({ manga }: MangaCardProps) => {
  const prefetchDetails = () => {
    mangaService.getMangaDetails(manga.id).catch(() => {});
  };

  return (
    <div 
      className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded overflow-hidden"
      onMouseEnter={prefetchDetails}
    >
      <Link 
        to={`/manga/${manga.id}`} 
        className="block aspect-[3/4] overflow-hidden bg-gray-200 dark:bg-gray-700 relative"
      >
        <img 
          src={getImageUrl(manga.image)} 
          alt={manga.title} 
          className="object-cover w-full h-full transition duration-500 group-hover:scale-110 opacity-0"
          loading="lazy"
          onLoad={(e) => {
            const target = e.currentTarget;
            target.classList.remove('opacity-0');
            target.parentElement?.classList.remove('bg-gray-200', 'dark:bg-gray-700');
          }}
          onError={(e) => {
            const img = e.currentTarget;
            img.src = "https://placehold.co/300x400?text=No+Cover";
            img.classList.remove('opacity-0');
          }}
        />
        {manga.latestChapter && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-[10px] text-center backdrop-blur-sm group-hover:bg-orange-600/80 transition">
            {manga.latestChapter.name.toLowerCase().startsWith(manga.title.toLowerCase()) 
              ? manga.latestChapter.name.slice(manga.title.length).trim() 
              : manga.latestChapter.name}
          </div>
        )}
      </Link>
      <div className="p-2">
        <Link 
          to={`/manga/${manga.id}`}
          className="text-xs font-bold text-gray-800 dark:text-gray-100 line-clamp-1 hover:text-orange-600 transition flex items-center"
        >
          {manga.title}
          <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition" />
        </Link>
      </div>
    </div>
  );
};
