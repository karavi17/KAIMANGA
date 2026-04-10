import { useEffect, useState } from 'react';
import { mangaService } from '../services/api';
import type { HomeData, Manga } from '../types';
import { MangaCard } from '../components/MangaCard';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ChevronRight, BookOpen, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_GRID = 8;
const LOAD_MORE_STEP = 8;

export const Home = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [popularMangas, setPopularMangas] = useState<Manga[]>([]);
  const [recommendedMangas, setRecommendedMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visiblePopular, setVisiblePopular] = useState(INITIAL_GRID);
  const [showNotice, setShowNotice] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    // Show notice by default on desktop, hidden on mobile
    setShowNotice(window.innerWidth > 768);

    const fetchData = async () => {
      try {
        setLoading(true);
        const homeData = await mangaService.getHome();
        setData(homeData);
        setPopularMangas(homeData.popularManga.mangas);
        
        // Fetch recommendations
        setLoadingRecommended(true);
        const recommendations = await mangaService.getRecommendations();
        setRecommendedMangas(recommendations);
      } catch (err) {
        setError('Failed to fetch manga data. Please make sure the API is running.');
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingRecommended(false);
      }
    };

    fetchData();
  }, []);

  const handleLoadMore = async () => {
    // If we already have more items in the current list, just show them
    if (visiblePopular + LOAD_MORE_STEP <= popularMangas.length) {
      setVisiblePopular(prev => prev + LOAD_MORE_STEP);
      return;
    }

    // If we've shown all items in current list, fetch next page
    if (hasNextPage) {
      try {
        setLoadingMore(true);
        const nextPage = page + 1;
        const result = await mangaService.getPopular(nextPage);
        
        if (result.mangas.length > 0) {
          // Filter out duplicates just in case
          const newMangas = result.mangas.filter(
            newManga => !popularMangas.some(m => m.id === newManga.id)
          );
          
          setPopularMangas(prev => [...prev, ...newMangas]);
          setVisiblePopular(prev => prev + LOAD_MORE_STEP);
          setPage(nextPage);
          setHasNextPage(result.hasNextPage);
        } else {
          setHasNextPage(false);
        }
      } catch (err) {
        console.error('Failed to load more popular manga', err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  if (error) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="white-box p-8 max-w-lg mx-auto border-2 border-red-500">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const canShowMore = hasNextPage || (popularMangas.length > visiblePopular);

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
            <div className="bg-orange-600 text-white px-4 py-3 flex items-center justify-between">
              <h2 className="font-bold text-lg uppercase tracking-wider">Popular Manga</h2>
              <Link to="/browse/hot" className="text-xs hover:underline flex items-center gap-1">
                VIEW ALL <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/40">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/40">
                  {popularMangas.slice(0, visiblePopular).map((manga) => (
                    <MangaCard key={manga.id} manga={manga} />
                  ))}
                </div>

                {canShowMore && (
                  <div className="px-4 pb-4 flex justify-center bg-gray-50 dark:bg-gray-900/40">
                    <button 
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center px-8 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700 transition shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <div className="mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        'Show more'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Recommended for You Section */}
          <section className="white-box p-0 overflow-hidden">
            <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <h2 className="font-bold text-lg uppercase tracking-wider">Recommended for You</h2>
              </div>
            </div>
            
            {loadingRecommended ? (
              <div className="flex items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/40">
                <LoadingSpinner />
              </div>
            ) : recommendedMangas.length > 0 ? (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/40">
                {recommendedMangas.map((manga) => (
                  <MangaCard key={`rec-${manga.id}`} manga={manga} />
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500 bg-gray-50 dark:bg-gray-900/40 italic">
                Start reading to get personalized recommendations!
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
