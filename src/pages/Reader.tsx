import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mangaService } from '../services/api';
import type { ChapterImages } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FunGames } from '../components/FunGames';
import { ChevronLeft, ChevronRight, BookOpen, Settings, LayoutGrid } from 'lucide-react';
import { getImageUrl } from '../utils/image';

export const Reader = () => {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const [data, setData] = useState<ChapterImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show controls if scrolling up, hide if scrolling down and not near top
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowControls(false);
      } else {
        setShowControls(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleControls = () => setShowControls(!showControls);

  const fetchData = async () => {
      if (!id || !chapterId) return;
      try {
        setLoading(true);
        const readerData = await mangaService.getChapterImages(id, chapterId);
        setData(readerData);
        window.scrollTo(0, 0);

        // Save to History
        const history = JSON.parse(localStorage.getItem('history') || '[]');
        const newHistory = history.filter((h: any) => h.mangaId !== id);
        newHistory.unshift({
          mangaId: id,
          chapterId: chapterId,
          mangaTitle: readerData.mangaTitle,
          chapterName: readerData.title,
          image: readerData.mangaImage ?? '',
          readAt: new Date().toISOString()
        });
        // Keep only last 50 items
        localStorage.setItem('history', JSON.stringify(newHistory.slice(0, 50)));

        // Update manga-history for recommendations
        const mHistory = JSON.parse(localStorage.getItem('manga-history') || '[]');
        const existing = mHistory.find((m: any) => m.id === id);
        if (!existing) {
          // If not in browsing history, try to get details to know genres
          mangaService.getMangaDetails(id).then(details => {
            const newItem = {
              id: details.id,
              title: details.title,
              image: details.image,
              genres: details.genres,
              timestamp: Date.now()
            };
            const newMHistory = [newItem, ...mHistory].slice(0, 50);
            localStorage.setItem('manga-history', JSON.stringify(newMHistory));
          }).catch(console.error);
        }

      } catch (err) {
        setError('Failed to fetch chapter images.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => { fetchData(); }, [id, chapterId]);

  const handlePrev = () => {
    if (data?.prevChapter) {
      navigate(`/manga/${id}/${data.prevChapter}`);
    }
  };

  const handleNext = () => {
    if (data?.nextChapter) {
      navigate(`/manga/${id}/${data.nextChapter}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <FunGames onRetry={fetchData} />
        <div className="mt-4">
          <Link to={`/manga/${id}`} className="text-indigo-400 hover:underline text-sm">Back to Manga</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 relative select-none">
      {/* Top Controls */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-4 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to={`/manga/${id}`} 
              className="p-2 hover:bg-gray-800 rounded-lg transition"
              title="Back to Manga"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div className="hidden sm:block max-w-[200px]">
              <h1 className="text-sm font-bold text-gray-100 truncate">{data.mangaTitle}</h1>
              <p className="text-xs text-gray-400 truncate">{data.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrev}
              disabled={!data.prevChapter}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 rounded-lg transition text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Prev</span>
            </button>
            
            <select 
              className="bg-gray-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 max-w-[150px]"
              value={chapterId}
              onChange={(e) => navigate(`/manga/${id}/${e.target.value}`)}
            >
              {data.allChapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>

            <button 
              onClick={handleNext}
              disabled={!data.nextChapter}
              className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg transition text-sm font-medium"
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Navigation (Mobile) */}
      <div className={`fixed bottom-24 right-6 z-50 flex flex-col gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 bg-gray-800/80 backdrop-blur text-white rounded-full shadow-lg hover:bg-gray-700 transition border border-gray-700"
          title="Back to Top"
        >
          <ChevronLeft className="h-6 w-6 rotate-90" />
        </button>
        {data.nextChapter && (
          <button 
            onClick={handleNext}
            className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition"
            title="Next Chapter"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Reader Container */}
      <div 
        className="max-w-4xl mx-auto pt-20 px-2 cursor-pointer" 
        ref={readerRef}
        onClick={toggleControls}
      >
        <div className="flex flex-col items-center space-y-2">
          {data.images.map((url, index) => (
            <div 
              key={index} 
              className="w-full bg-gray-900 animate-pulse rounded-lg overflow-hidden"
              style={{ minHeight: '600px', aspectRatio: '2/3' }}
            >
              <img 
                src={getImageUrl(url)} 
                alt={`Page ${index + 1}`} 
                className="w-full h-auto object-contain shadow-2xl pointer-events-none transition-opacity duration-500 opacity-0"
                loading="lazy"
                onLoad={(e) => {
                  const target = e.currentTarget;
                  target.classList.remove('opacity-0');
                  const parent = target.parentElement;
                  if (parent) {
                    parent.classList.remove('animate-pulse', 'bg-gray-900');
                    parent.style.minHeight = 'auto';
                  }
                }}
                onError={(e) => {
                  const img = e.currentTarget;
                  img.src = "https://placehold.co/800x1200?text=Failed+to+load+image";
                  img.classList.remove('opacity-0');
                  const parent = img.parentElement;
                  if (parent) {
                    parent.classList.remove('animate-pulse');
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-4 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white">
              <LayoutGrid className="h-5 w-5" />
            </Link>
            <Link to={`/manga/${id}`} className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white">
              <BookOpen className="h-5 w-5" />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePrev}
              disabled={!data.prevChapter}
              className="p-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded-full transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <span className="text-sm font-medium text-gray-400">
              Chapter End
            </span>
            <button 
              onClick={handleNext}
              disabled={!data.nextChapter}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 rounded-full transition"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
