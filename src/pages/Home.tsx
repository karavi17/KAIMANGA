import { useEffect, useState } from 'react';
import { mangaService } from '../services/api';
import type { HomeData } from '../types';
import { MangaCard } from '../components/MangaCard';
import { Sidebar } from '../components/Sidebar';
import { Loader2, ChevronRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/image';

export const Home = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button 
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
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Important Notice */}
          <div className="bg-white border-2 border-orange-500 p-4 rounded text-sm text-gray-700">
            <h3 className="font-bold flex items-center mb-1 text-orange-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Important Notice!
            </h3>
            <p>To ensure you always have easy access to our site, we highly recommend bookmarking our website. Due to search engine updates, our website may not always appear in Google search results.</p>
          </div>

          {/* Popular Manga (Slider-style grid) */}
          <section className="white-box p-0 overflow-hidden">
            <div className="section-title">
              Popular Manga
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-50">
              {data?.popularManga.mangas.slice(0, 8).map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          </section>

          {/* Latest Manga Releases */}
          <section className="white-box p-0 overflow-hidden">
            <div className="bg-cyan-600 text-white px-4 py-2 text-sm font-bold uppercase inline-flex items-center rounded-r-lg">
              Latest Manga Releases
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              {data?.latestUpdates.mangas.map((manga) => (
                <div key={manga.id} className="flex space-x-4 border-b border-gray-100 pb-4 group">
                  <Link to={`/manga/${manga.id}`} className="shrink-0 w-24 h-32 overflow-hidden rounded shadow">
                    <img 
                      src={getImageUrl(manga.image)} 
                      alt={manga.title} 
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/manga/${manga.id}`} className="text-sm font-bold text-cyan-700 hover:text-orange-600 truncate block mb-2">
                      {manga.title}
                    </Link>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <Link to={`/manga/${manga.id}/${manga.latestChapter?.id}`} className="text-gray-600 hover:text-orange-600 hover:underline">
                          » {manga.latestChapter?.name || 'No chapters'}
                        </Link>
                        <span className="text-gray-400 italic">28 minute ago</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">» Chapter 110</span>
                        <span className="text-gray-400 italic">Yesterday</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">» Chapter 109</span>
                        <span className="text-gray-400 italic">03-15 13:33</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <Sidebar popularMangas={data?.popularManga.mangas} />
        </div>
      </div>
    </div>
  );
};
