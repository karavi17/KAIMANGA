import { useEffect, useState } from 'react';
import { mangaService } from '../services/api';
import type { HomeData } from '../types';
import { MangaCard } from '../components/MangaCard';
import { Sidebar } from '../components/Sidebar';
import { Loader2, ChevronRight, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_GRID = 8;
const LOAD_MORE_STEP = 8;

export const Home = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visiblePopular, setVisiblePopular] = useState(INITIAL_GRID);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Show notice by default on desktop, hidden on mobile
    setShowNotice(window.innerWidth > 768);

    const fetchData = async () => {
      try {
        setLoading(true);
        const homeData = await mangaService.getHome();
        setData(homeData);
      } catch (err) {
        setError('Failed to fetch manga data. Please make sure the API is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const popularList = data?.popularManga.mangas ?? [];
  const canShowMore = visiblePopular < popularList.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container-custom py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="white-box border-2 border-orange-500 p-0 rounded overflow-hidden">
            <button 
              onClick={() => setShowNotice(!showNotice)}
              className="w-full px-4 py-3 flex items-center justify-between bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
            >
              <h3 className="font-bold flex items-center text-orange-600">
                <BookOpen className="h-4 w-4 mr-2" />
                Important Notice!
              </h3>
              <div className="md:hidden">
                {showNotice ? <ChevronUp className="h-4 w-4 text-orange-600" /> : <ChevronDown className="h-4 w-4 text-orange-600" />}
              </div>
            </button>
            
            {showNotice && (
              <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-t border-orange-100 dark:border-orange-900/20 animate-in fade-in slide-in-from-top-1 duration-200">
                <p>
                  To ensure you always have easy access to our site, we highly recommend bookmarking our website. Due to search engine updates, our website may not always appear in Google search results.
                </p>
              </div>
            )}
          </div>

          <section className="white-box p-0 overflow-hidden">
            <div className="bg-orange-600 text-white px-4 py-2 text-sm font-bold uppercase flex justify-between items-center rounded-r-lg">
              <span>Popular Manga</span>
              <Link to="/browse/hot" className="text-[10px] hover:underline flex items-center">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/40">
              {popularList.slice(0, visiblePopular).map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
            {canShowMore && (
              <div className="px-4 pb-4 flex justify-center bg-gray-50 dark:bg-gray-900/40">
                <button
                  type="button"
                  onClick={() => setVisiblePopular((n) => Math.min(n + LOAD_MORE_STEP, popularList.length))}
                  className="px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow transition"
                >
                  Show more
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4">
          <Sidebar popularMangas={data?.popularManga.mangas} />
        </div>
      </div>
    </div>
  );
};
