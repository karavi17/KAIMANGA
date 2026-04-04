import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const GENRES = [
  'Action', 'Adult', 'Adventure', 'Comedy', 'Cooking', 'Doujinshi', 'Drama', 'Ecchi', 'Fantasy', 
  'Gender Bender', 'Harem', 'Historical', 'Horror', 'Isekai', 'Josei', 'Manhua', 'Manhwa', 
  'Martial Arts', 'Mature', 'Mecha', 'Medical', 'Mystery', 'One shot', 'Psychological', 
  'Romance', 'School Life', 'Sci fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai', 
  'Slice of Life', 'Smut', 'Sports', 'Supernatural', 'Tragedy', 'Webtoons', 'Yaoi', 'Yuri'
];

export const Sidebar = ({ popularMangas = [] }: { popularMangas?: any[] }) => {
  return (
    <aside className="space-y-6">
      {/* History section placeholder */}
      <div className="white-box p-0 overflow-hidden">
        <div className="bg-orange-600 text-white px-4 py-2 flex justify-between items-center text-sm font-bold uppercase">
          <span>History</span>
          <Link to="/history" className="text-xs hover:underline flex items-center">
            View More <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
        <div className="p-4 text-gray-500 text-sm italic">
          No history found.
        </div>
      </div>

      {/* Most Popular Manga */}
      <div className="white-box p-0 overflow-hidden">
        <div className="bg-orange-600 text-white px-4 py-2 text-sm font-bold uppercase">
          Most Popular Manga
        </div>
        <div className="divide-y divide-gray-100">
          {popularMangas.slice(0, 10).map((manga, index) => (
            <Link 
              key={manga.id} 
              to={`/manga/${manga.id}`}
              className="flex items-center p-3 hover:bg-gray-50 transition group"
            >
              <span className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 shrink-0
                ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-gray-400'}
              `}>
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-orange-600">
                  {manga.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {manga.latestChapter?.name || 'No chapters'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className="white-box p-0 overflow-hidden">
        <div className="bg-blue-500 text-white px-4 py-2 text-sm font-bold uppercase">
          Genres
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {GENRES.map((genre) => (
            <Link 
              key={genre} 
              to={`/search?q=${genre}`}
              className="text-xs text-gray-700 hover:text-orange-600 hover:underline transition"
            >
              » {genre}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};
