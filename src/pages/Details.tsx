import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mangaService } from '../services/api';
import type { MangaDetails, Manga } from '../types';
import { MangaCard } from '../components/MangaCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BookOpen, Clock, Tag, User, Star, Play, Zap, Share2 } from 'lucide-react';
import { getImageUrl } from '../utils/image';
import { BookmarkButton } from '../components/BookmarkButton';
import { ConfirmModal } from '../components/ConfirmModal';

export const Details = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<MangaDetails | null>(null);
  const [relatedMangas, setRelatedMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const detailsData = await mangaService.getMangaDetails(id);
        setData(detailsData);
        
        // Add to history for recommendations
        const history = JSON.parse(localStorage.getItem('manga-history') || '[]');
        const newItem = {
          id: detailsData.id,
          title: detailsData.title,
          image: detailsData.image,
          genres: detailsData.genres,
          timestamp: Date.now()
        };
        const filteredHistory = history.filter((m: any) => m.id !== detailsData.id);
        const newHistory = [newItem, ...filteredHistory].slice(0, 50);
        localStorage.setItem('manga-history', JSON.stringify(newHistory));
        
        // Fetch related manga based on first genre
        if (detailsData.genres && detailsData.genres.length > 0) {
          setLoadingRelated(true);
          try {
            const firstGenre = detailsData.genres[0];
            const genreId = typeof firstGenre === 'string' ? firstGenre.toLowerCase().replace(/ /g, '-') : firstGenre.id;
            const related = await mangaService.getBrowse('hot', 1, { category: genreId });
            setRelatedMangas(related.mangas.filter(m => m.id !== detailsData.id).slice(0, 6));
          } catch (err) {
            console.error('Failed to fetch related manga', err);
          } finally {
            setLoadingRelated(false);
          }
        }

        // Preload hero image
        const img = new Image();
        img.src = getImageUrl(detailsData.image);
        
        if (detailsData.id && detailsData.id !== id) {
          navigate(`/manga/${encodeURIComponent(detailsData.id)}`, { replace: true });
        }
      } catch (err) {
        setError('Failed to fetch manga details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: data?.title,
        text: `Check out ${data?.title} on KaiManga!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsAlertOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 text-red-400">
        <p className="text-lg mb-4">{error || 'Manga not found.'}</p>
        <Link to="/" className="text-indigo-500 hover:underline transition">Back to Home</Link>
      </div>
    );
  }

  const firstChapter = data.chapters[data.chapters.length - 1];
  const lastChapter = data.chapters[0];
  /** Canonical slug from API (fixes truncated URLs in the address bar). */
  const mangaSlug = data.id || id!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-200 dark:bg-gray-900 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src={getImageUrl(data.banner || data.image)} 
            alt="Banner" 
            className="w-full h-full object-cover blur-sm opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent dark:from-gray-950 dark:via-gray-950/80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row p-6 md:p-10 gap-8">
          <div className="w-full md:w-64 flex-shrink-0 space-y-4">
            <div className="shadow-2xl rounded-xl overflow-hidden border border-gray-300 dark:border-gray-800">
              <img 
                src={getImageUrl(data.image)} 
                alt={data.title} 
                className="w-full h-auto" 
                fetchPriority="high"
                loading="eager"
              />
            </div>
            <BookmarkButton manga={{ 
              id: mangaSlug, 
              title: data.title, 
              image: data.image,
              latestChapter: lastChapter ? { id: lastChapter.id, name: lastChapter.name } : undefined,
              firstChapter: firstChapter ? { id: firstChapter.id, name: firstChapter.name } : undefined
            }} />
            <button 
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg font-bold transition border border-gray-300 dark:border-gray-700"
            >
              <Share2 className="h-4 w-4" />
              Share Manga
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {data.title}
              </h1>
              {data.altTitles && (
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{data.altTitles}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              {firstChapter && (
                <Link 
                  to={`/manga/${mangaSlug}/${firstChapter.id}`}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition shadow"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Read First
                </Link>
              )}
              {lastChapter && (
                <Link 
                  to={`/manga/${mangaSlug}/${lastChapter.id}`}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-lg font-bold transition border border-gray-600 dark:border-gray-700"
                >
                  <Zap className="h-4 w-4 fill-current" />
                  Read Latest
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <User className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Author</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{data.author || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{data.status || 'Ongoing'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Views</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{data.views || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <Tag className="h-4 w-4 text-red-500 dark:text-red-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Genres</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[80px]">{data.genres?.length || 0}</p>
                </div>
              </div>
            </div>

            {data.genres && (
              <div className="flex flex-wrap gap-2">
                {data.genres.map((genre) => {
                  const name = typeof genre === 'string' ? genre : genre.name;
                  const id = typeof genre === 'string' ? genre.toLowerCase().replace(/ /g, '-') : genre.id;
                  return (
                    <Link 
                      key={id} 
                      to={`/browse/hot?category=${id}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 transition"
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>
            )}

            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {data.description || 'No description available for this manga.'}
            </p>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <section className="bg-white dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-indigo-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chapters</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{data.chapters.length} Total Chapters</p>
        </div>

        {data.chapters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/20 px-4 py-6 text-sm text-amber-900 dark:text-amber-200/90">
            <p className="font-semibold mb-2">No chapters loaded from the API.</p>
            <p className="text-amber-800/90 dark:text-amber-300/80 mb-2">
              Stop any old Node process on port 3000. In a terminal, go to the app folder (where <code className="px-1 rounded bg-amber-100 dark:bg-gray-800 text-xs">package.json</code> lives), e.g.{' '}
              <code className="px-1 rounded bg-amber-100 dark:bg-gray-800 text-xs">cd manga-reader</code>, then run <code className="px-1 rounded bg-amber-100 dark:bg-gray-800 text-xs">npm run start</code> and reload this page.
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-400/70">
              If the API runs on another port, set <code className="px-1 rounded bg-amber-100 dark:bg-gray-800">VITE_API_BASE</code> in <code className="px-1 rounded bg-amber-100 dark:bg-gray-800">.env</code> (e.g. <code className="px-1 rounded bg-amber-100 dark:bg-gray-800">http://127.0.0.1:3000/api/manga</code>) and restart <code className="px-1 rounded bg-amber-100 dark:bg-gray-800">npm run dev</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.chapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/manga/${mangaSlug}/${chapter.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/50 hover:border-indigo-500/50 rounded-xl transition group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {chapter.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">{chapter.date}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Section */}
      {data.genres && data.genres.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recommended for You</h2>
            {(() => {
              const g = data.genres[0];
              const gName = typeof g === 'string' ? g : g.name;
              const gId = typeof g === 'string' ? g.toLowerCase().replace(/ /g, '-') : g.id;
              return (
                <Link 
                  to={`/browse/hot?category=${gId}`} 
                  className="text-sm text-indigo-600 dark:text-indigo-500 hover:underline"
                >
                  See More {gName} Manga
                </Link>
              );
            })()}
          </div>
          
          {loadingRelated ? (
            <div className="flex items-center justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : relatedMangas.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedMangas.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-500 text-sm italic bg-gray-100 dark:bg-gray-900/30 p-8 rounded-xl text-center border border-dashed border-gray-300 dark:border-gray-800">
              More recommendations based on <span className="text-indigo-400 font-bold">
                "{typeof data.genres[0] === 'string' ? data.genres[0] : data.genres[0].name}"
              </span> coming soon!
            </div>
          )}
        </section>
      )}
      <ConfirmModal
         isOpen={isAlertOpen}
         title="Link Copied"
         message="The link to this manga has been copied to your clipboard."
         confirmText="Got it!"
         onConfirm={() => setIsAlertOpen(false)}
         showCancel={false}
         type="success"
       />
    </div>
  );
};
