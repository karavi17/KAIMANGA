import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { mangaService } from '../services/api';
import type { SearchResult, Manga } from '../types';
import { MangaCard } from '../components/MangaCard';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Plus, ChevronDown, ChevronUp, Filter } from 'lucide-react';

export const Browse = () => {
  const { type } = useParams<{ type: string }>();

  const [mangas, setMangas] = useState<Manga[]>([]);
  const [data, setData] = useState<SearchResult | null>(null);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [category, setCategory] = useState('all');
  const [state, setState] = useState('all');
  const [alpha, setAlpha] = useState('all');

  const titleMap: Record<string, string> = {
    latest: 'Latest Manga Releases',
    hot: 'Hot Manga',
    new: 'New Manga Updates',
    completed: 'Completed Manga'
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreData = await mangaService.getGenres();
        setGenres(genreData);
      } catch (err) {
        console.error('Failed to fetch genres', err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    setMangas([]);
    setPage(1);
  }, [type, category, state, alpha]);

  useEffect(() => {
    const fetchData = async () => {
      if (!type) return;
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        
        const browseData = await mangaService.getBrowse(type, page, { category, state, alpha });
        setData(browseData);
        setMangas(prev => page === 1 ? browseData.mangas : [...prev, ...browseData.mangas]);
      } catch (err) {
        setError(`Failed to fetch ${type} manga.`);
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchData();
  }, [type, page, category, state, alpha]);

  const handleLoadMore = () => {
    if (data?.hasNextPage && !loadingMore) {
      setPage(prev => prev + 1);
    }
  };

  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="container-custom py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <section className="white-box p-0 overflow-hidden mb-6 border-none shadow-none">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-orange-500/40 active:scale-95 group"
            >
              <Filter className={`h-5 w-5 transition-transform duration-300 ${showFilters ? 'rotate-180 scale-110' : ''}`} />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="h-5 w-5 ml-1" /> : <ChevronDown className="h-5 w-5 ml-1" />}
            </button>

            {showFilters && (
              <div className="mt-4 p-6 space-y-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none transition-all cursor-pointer hover:border-orange-500"
                    >
                      <option value="all">All Genres</option>
                      {genres.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Status</label>
                    <select 
                      value={state} 
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none transition-all cursor-pointer hover:border-orange-500"
                    >
                      <option value="all">All Status</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Alphabet Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Alphabet</label>
                    <select 
                      value={alpha} 
                      onChange={(e) => setAlpha(e.target.value)}
                      className="w-full text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none transition-all cursor-pointer hover:border-orange-500"
                    >
                      <option value="all">All Characters</option>
                      {alphabets.map((char) => (
                        <option key={char} value={char.toLowerCase()}>{char}</option>
                      ))}
                      <option value="other"># (Others)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => {
                      setCategory('all');
                      setState('all');
                      setAlpha('all');
                    }}
                    className="text-[10px] font-black text-gray-400 hover:text-orange-500 uppercase tracking-widest transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="white-box p-0 overflow-hidden">
            <div className="section-title">
              {titleMap[type || ''] || 'Browse Manga'}
            </div>
            
            {loading && page === 1 ? (
              <div className="flex items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/40">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/40">
                  {mangas.map((manga, index) => (
                    <MangaCard key={`${manga.id}-${index}`} manga={manga} />
                  ))}
                </div>

                {mangas.length === 0 && !loading && (
                  <div className="p-20 text-center text-gray-400">
                    No manga found matching your filters.
                  </div>
                )}

                {/* Load More */}
                {data?.hasNextPage && (
                  <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex justify-center bg-gray-50/50 dark:bg-gray-900/60">
                    <button 
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center px-12 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-lg font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-orange-500/40 disabled:opacity-50 active:scale-95"
                    >
                      {loadingMore ? (
                        <>
                          <div className="mr-3 h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Plus className="h-6 w-6 mr-3" />
                          Load More Manga
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <div className="lg:col-span-4">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};
