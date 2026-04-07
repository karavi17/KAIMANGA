import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, MessageCircle, Share2 } from 'lucide-react';
import { getImageUrl } from '../utils/image';

const GENRES = [
  'Action', 'Adult', 'Adventure', 'Comedy', 'Cooking', 'Doujinshi', 'Drama', 'Ecchi', 'Fantasy', 
  'Gender Bender', 'Harem', 'Historical', 'Horror', 'Isekai', 'Josei', 'Manhua', 'Manhwa', 
  'Martial Arts', 'Mature', 'Mecha', 'Medical', 'Mystery', 'One shot', 'Psychological', 
  'Romance', 'School Life', 'Sci fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai', 
  'Slice of Life', 'Smut', 'Sports', 'Supernatural', 'Tragedy', 'Webtoons', 'Yaoi', 'Yuri'
];

export const Sidebar = ({ popularMangas = [] }: { popularMangas?: any[] }) => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('history') || '[]');
    setHistory(saved.slice(0, 5));
  }, []);

  return (
    <aside className="space-y-6">
      {/* Community Section */}
      <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg border-none">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-white">
          <Share2 className="h-5 w-5" />
          Join Our Community
        </h3>
        <p className="text-xs text-orange-50 mb-4 leading-relaxed">
          Get the latest updates, chat with other fans, and stay connected with KaiManga!
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link 
            to="/fanpage" 
            className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded font-bold text-xs transition"
          >
            <Share2 className="h-4 w-4" />
            Fanpage
          </Link>
          <a 
            href="https://discord.gg/7GeMpXYV" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded font-bold text-xs transition shadow-md"
          >
            <MessageCircle className="h-4 w-4" />
            Discord
          </a>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/20">
          <a 
            href="https://www.instagram.com/kaimangaofficial/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition transform hover:scale-110"
            title="Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a 
            href="#" 
            onClick={(e) => e.preventDefault()}
            className="hover:text-red-500 transition transform hover:scale-110 opacity-50 cursor-not-allowed"
            title="YouTube (Coming Soon)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
          </a>
          <a 
            href="#" 
            onClick={(e) => e.preventDefault()}
            className="hover:text-blue-500 transition transform hover:scale-110 opacity-50 cursor-not-allowed"
            title="Facebook (Coming Soon)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
        </div>
      </div>

      {/* History section */}
      <div className="white-box p-0 overflow-hidden">
        <div className="bg-orange-600 text-white px-4 py-2 flex justify-between items-center text-sm font-bold uppercase">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </span>
          <Link to="/history" className="text-xs hover:underline flex items-center">
            View More <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
        <div className="p-0">
          {history.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {history.map((item) => (
                <Link 
                  key={item.mangaId} 
                  to={`/manga/${item.mangaId}/${item.chapterId}`}
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition group"
                >
                  <div className="shrink-0 w-10 h-14 rounded overflow-hidden shadow mr-3">
                    <img src={getImageUrl(item.image)} alt={item.mangaTitle} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-orange-600">
                      {item.mangaTitle}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-1">
                      {item.chapterName}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-gray-400 dark:text-gray-500 text-xs italic text-center">
              No history found.
            </div>
          )}
        </div>
      </div>

      {/* Most Popular Manga */}
      <div className="white-box p-0 overflow-hidden">
        <div className="bg-orange-600 text-white px-4 py-2 flex justify-between items-center text-sm font-bold uppercase">
          <span>Most Popular Manga</span>
          <Link to="/browse/hot" className="text-xs hover:underline flex items-center">
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {popularMangas.slice(0, 10).map((manga, index) => (
            <Link 
              key={manga.id} 
              to={`/manga/${manga.id}`}
              className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition group"
            >
              <span className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 shrink-0
                ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-gray-400'}
              `}>
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-orange-600">
                  {manga.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
              className="text-xs text-gray-700 dark:text-gray-300 hover:text-orange-600 hover:underline transition"
            >
              » {genre}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};
