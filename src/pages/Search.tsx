import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mangaService } from '../services/api';
import type { SearchResult, Manga } from '../types';
import { MangaCard } from '../components/MangaCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search as SearchIcon, Plus } from 'lucide-react';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [data, setData] = useState<SearchResult | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMangas([]);
    setPage(1);
  }, [query]);

  useEffect(() => {
    const fetchData = async () => {
      if (!query) return;
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        
        const searchData = await mangaService.searchManga(query, page);
        setData(searchData);
        setMangas(prev => page === 1 ? searchData.mangas : [...prev, ...searchData.mangas]);
      } catch (err) {
        setError('Failed to search manga.');
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchData();
  }, [query, page]);

  const handleLoadMore = () => {
    if (data?.hasNextPage && !loadingMore) {
      setPage(prev => prev + 1);
    }
  };

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <SearchIcon className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-xl font-medium text-gray-800 dark:text-gray-100">Search for your favorite manga</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Search Results for <span className="text-orange-500">"{query}"</span>
          </h2>
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 text-red-400">
          <p className="text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {mangas.map((manga, index) => (
              <MangaCard key={`${manga.id}-${index}`} manga={manga} />
            ))}
          </div>

          {data?.hasNextPage && (
            <div className="flex justify-center pt-12 pb-8">
              <button 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition shadow-lg disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <div className="mr-3 h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Load More
                  </>
                )}
              </button>
            </div>
          )}

          {mangas.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No manga found for "{query}".</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
