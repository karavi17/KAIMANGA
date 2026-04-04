import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mangaService } from '../services/api';
import type { ChapterImages } from '../types';
import { Loader2, ChevronLeft, ChevronRight, BookOpen, Settings, LayoutGrid } from 'lucide-react';
import { getImageUrl } from '../utils/image';

export const Reader = () => {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const [data, setData] = useState<ChapterImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !chapterId) return;
      try {
        setLoading(true);
        const readerData = await mangaService.getChapterImages(id, chapterId);
        setData(readerData);
        window.scrollTo(0, 0);
      } catch (err) {
        setError('Failed to fetch chapter images.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, chapterId]);

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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-400">
        <p className="text-lg mb-4">{error || 'Chapter not found.'}</p>
        <Link to={`/manga/${id}`} className="text-indigo-500 hover:underline">Back to Manga</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Top Controls */}
      <div className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to={`/manga/${id}`} 
              className="p-2 hover:bg-gray-800 rounded-lg transition"
              title="Back to Manga"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-gray-100 line-clamp-1">{data.mangaTitle}</h1>
              <p className="text-xs text-gray-400">{data.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrev}
              disabled={!data.prevChapter}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 rounded-lg transition text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Prev</span>
            </button>
            
            <select 
              className="bg-gray-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
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
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Reader Container */}
      <div className="max-w-4xl mx-auto mt-4 px-2" ref={readerRef}>
        <div className="flex flex-col items-center space-y-2">
          {data.images.map((url, index) => (
            <img 
              key={index} 
              src={getImageUrl(url)} 
              alt={`Page ${index + 1}`} 
              className="w-full h-auto object-contain shadow-2xl"
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                img.src = "https://via.placeholder.com/800x1200?text=Failed+to+load+image";
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-4">
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
