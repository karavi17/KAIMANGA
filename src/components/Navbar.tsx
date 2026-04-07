import { Search, Share2, History, Bookmark, Sun, Moon, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import logo from '../assets/logo.webp';
import { useTheme } from '../context/ThemeContext';
import { mangaService } from '../services/api';
import { getImageUrl } from '../utils/image';
import type { Manga } from '../types';

export const Navbar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Manga[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoadingSuggestions(true);
        setShowSuggestions(true);
        try {
          const result = await mangaService.searchManga(query, 1);
          setSuggestions(result.mangas.slice(0, 10)); // Top 10 suggestions
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (mangaId: string) => {
    setShowSuggestions(false);
    setQuery('');
    navigate(`/manga/${encodeURIComponent(mangaId)}`);
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-900 dark:shadow-black/20 transition-colors">
      <div className="container-custom py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="KaiManga" className="h-12 w-12 rounded-lg object-cover" />
          <span className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            Kai<span className="text-orange-600">Manga</span>
          </span>
        </Link>

        <div className="flex-1 max-w-xl mx-4 relative" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search manga..."
              className="w-full border-2 border-orange-500 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-orange-500 px-4 py-2 pr-10 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-orange-500 text-white rounded-r hover:bg-orange-600 transition">
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (query.trim().length >= 2) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-[100] overflow-hidden max-h-[70vh] flex flex-col">
              {loadingSuggestions ? (
                <div className="p-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin mr-2 text-orange-500" />
                  <span>Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="overflow-y-auto custom-scrollbar">
                    {suggestions.map((manga) => (
                      <button
                        key={manga.id}
                        onClick={() => handleSuggestionClick(manga.id)}
                        className="w-full flex items-start gap-3 p-3 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors text-left border-b border-gray-100 dark:border-gray-700/50 last:border-0 group"
                      >
                        <img 
                          src={getImageUrl(manga.image)} 
                          alt={manga.title} 
                          className="w-12 h-16 object-cover rounded shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400">
                            {manga.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5 truncate">
                            {manga.author || 'Unknown Author'}
                          </p>
                          {manga.latestChapter && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                              {manga.latestChapter.name.split('\n')[0]}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSearch}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 text-center text-sm font-semibold border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="text-gray-600 dark:text-gray-300">Displaying top {suggestions.length} results.</p>
                    <p className="text-orange-600 dark:text-orange-400 mt-0.5">Click here to view all results.</p>
                  </button>
                </>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No manga found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <Link to="/fanpage" className="bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded flex items-center space-x-1 hover:bg-blue-700 transition">
              <Share2 className="h-3 w-3" />
              <span>Fanpage</span>
            </Link>
            <a 
              href="https://discord.gg/7GeMpXYV" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-indigo-500 text-white px-3 py-1 text-xs font-bold rounded hover:bg-indigo-600 transition"
            >
              Discord
            </a>
          </div>

          <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-amber-300 transition"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/bookmarks">
              <Bookmark className="h-5 w-5 hover:text-orange-500 cursor-pointer" />
            </Link>
            <Link to="/history">
              <History className="h-5 w-5 hover:text-orange-500 cursor-pointer" />
            </Link>
          </div>
        </div>
      </div>

      <nav className="bg-orange-600 shadow-lg">
        <div className="container-custom">
          <ul className="flex flex-wrap items-center text-white text-sm font-bold uppercase overflow-x-auto whitespace-nowrap">
            <li>
              <Link to="/" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">Home</Link>
            </li>
            <li>
              <Link to="/browse/latest" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">Latest Manga</Link>
            </li>
            <li>
              <Link to="/browse/hot" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">Hot Manga</Link>
            </li>
            <li>
              <Link to="/browse/new" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">New Manga</Link>
            </li>
            <li>
              <Link to="/browse/completed" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">Completed Manga</Link>
            </li>
            <li>
              <Link to="/bookmarks" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition flex items-center gap-1">
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};
