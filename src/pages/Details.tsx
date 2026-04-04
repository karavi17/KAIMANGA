import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mangaService } from '../services/api';
import type { MangaDetails } from '../types';
import { Loader2, BookOpen, Clock, Tag, User, Star } from 'lucide-react';
import { getImageUrl } from '../utils/image';

export const Details = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MangaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const detailsData = await mangaService.getMangaDetails(id);
        setData(detailsData);
      } catch (err) {
        setError('Failed to fetch manga details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src={getImageUrl(data.banner || data.image)} 
            alt="Banner" 
            className="w-full h-full object-cover blur-sm opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row p-6 md:p-10 gap-8">
          <div className="w-full md:w-64 flex-shrink-0 shadow-2xl rounded-xl overflow-hidden border border-gray-800">
            <img src={getImageUrl(data.image)} alt={data.title} className="w-full h-auto" />
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {data.title}
              </h1>
              {data.altTitles && (
                <p className="text-gray-400 text-sm font-medium">{data.altTitles}</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <User className="h-4 w-4 text-indigo-400" />
                <div>
                  <p className="text-xs text-gray-500">Author</p>
                  <p className="text-sm font-semibold text-gray-200">{data.author || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <Clock className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-gray-200">{data.status || 'Ongoing'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <Star className="h-4 w-4 text-yellow-400" />
                <div>
                  <p className="text-xs text-gray-500">Views</p>
                  <p className="text-sm font-semibold text-gray-200">{data.views || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <Tag className="h-4 w-4 text-red-400" />
                <div>
                  <p className="text-xs text-gray-500">Genres</p>
                  <p className="text-sm font-semibold text-gray-200">{data.genres?.length || 0}</p>
                </div>
              </div>
            </div>

            {data.genres && (
              <div className="flex flex-wrap gap-2">
                {data.genres.map((genre) => (
                  <span 
                    key={genre} 
                    className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-300 text-sm leading-relaxed line-clamp-4 md:line-clamp-none">
              {data.description || 'No description available for this manga.'}
            </p>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <section className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-indigo-500" />
            <h2 className="text-2xl font-bold text-gray-100">Chapters</h2>
          </div>
          <p className="text-sm text-gray-400 font-medium">{data.chapters.length} Total Chapters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.chapters.map((chapter) => (
            <Link
              key={chapter.id}
              to={`/manga/${id}/${chapter.id}`}
              className="flex items-center justify-between p-4 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 hover:border-indigo-500/50 rounded-xl transition group"
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-200 group-hover:text-indigo-400 transition">
                  {chapter.name}
                </span>
                <span className="text-xs text-gray-500 mt-1">{chapter.date}</span>
              </div>
              <BookOpen className="h-4 w-4 text-gray-600 group-hover:text-indigo-500 transition" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
