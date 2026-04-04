import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { mangaService } from '../services/api';
import type { SearchResult } from '../types';
import { MangaCard } from '../components/MangaCard';
import { Loader2, Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!query) return;
      try {
        setLoading(true);
        const searchData = await mangaService.searchManga(query, page);
        setData(searchData);
        window.scrollTo(0, 0);
      } catch (err) {
        setError('Failed to search manga.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, page]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ q: query, page: newPage.toString() });
  };

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <SearchIcon className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-xl font-medium">Search for your favorite manga</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 text-red-400">
        <p className="text-lg mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">
            Search Results for <span className="text-indigo-500">"{query}"</span>
          </h2>
          {data && (
            <p className="text-sm text-gray-400 mt-1">Found {data.totalMangas} results</p>
          )}
        </div>
        
        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-200">
              Page {page} of {data.totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(page + 1)}
              disabled={!data.hasNextPage}
              className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded-lg transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {data?.mangas.map((manga) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>

      {data?.mangas.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No manga found for "{query}".</p>
        </div>
      )}
    </div>
  );
};
