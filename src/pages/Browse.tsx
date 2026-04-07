import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { mangaService } from '../services/api';
import type { SearchResult, Manga } from '../types';
import { MangaCard } from '../components/MangaCard';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Plus } from 'lucide-react';

export const Browse = () => {
  const { type } = useParams<{ type: string }>();

  const [mangas, setMangas] = useState<Manga[]>([]);
  const [data, setData] = useState<SearchResult | null>(null);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="container-custom py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <section className="white-box p-0 overflow-hidden mb-6">
            <div className="section-title">
              Filters
            </div>
            <div className="p-4 space-y-4 bg-gray-50 border-b border-gray-100">
              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase min-w-[70px]">Category:</span>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="all">All Genres</option>
                  {genres.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase min-w-[70px]">Status:</span>
                <div className="flex gap-2">
                  {['all', 'ongoing', 'completed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setState(s)}
                      className={`text-xs px-3 py-1 rounded capitalize transition ${
                        state === s ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alphabet Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase min-w-[70px]">Alphabet:</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setAlpha('all')}
                    className={`text-[10px] w-6 h-6 flex items-center justify-center rounded border transition ${
                      alpha === 'all' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-500'
                    }`}
                  >
                    All
                  </button>
                  {alphabets.map((char) => (
                    <button
                      key={char}
                      onClick={() => setAlpha(char.toLowerCase())}
                      className={`text-[10px] w-6 h-6 flex items-center justify-center rounded border transition ${
                        alpha === char.toLowerCase() ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-500'
                      }`}
                    >
                      {char}
                    </button>
                  ))}
                  <button
                    onClick={() => setAlpha('other')}
                    className={`text-[10px] px-2 h-6 flex items-center justify-center rounded border transition ${
                      alpha === 'other' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-500'
                    }`}
                  >
                    #
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="white-box p-0 overflow-hidden">
            <div className="section-title">
              {titleMap[type || ''] || 'Browse Manga'}
            </div>
            
            {error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                  <div className="p-8 border-t border-gray-100 flex justify-center bg-gray-50/50">
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
