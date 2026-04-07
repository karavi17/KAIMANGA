import { Search, Share2, History, Bookmark, Sun, Moon, Menu, X, MessageCircle, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import logo from '../assets/logo.webp';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { mangaService } from '../services/api';
import { getImageUrl } from '../utils/image';
import { LoadingSpinner } from './LoadingSpinner';
import { AuthModal } from './AuthModal';
import type { Manga } from '../types';

export const Navbar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Manga[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

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
    <header className="bg-white shadow-sm dark:bg-gray-900 dark:shadow-black/20 transition-colors relative z-50">
      <div className="container-custom py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="KaiManga" className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover" />
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
              Kai<span className="text-orange-600">Manga</span>
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6 text-orange-600" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="flex-1 w-full max-w-xl md:mx-4 relative" ref={searchRef}>
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
                <div className="p-4 flex items-center justify-center">
                  <LoadingSpinner className="scale-75" message="Searching..." />
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

        <div className="hidden md:flex items-center space-x-4">
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
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <a 
              href="https://www.instagram.com/kaimangaofficial/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-pink-500 transition transform hover:scale-110"
              title="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>

            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-orange-600 truncate max-w-[100px] hidden lg:block">
                  {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-500 transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="p-2 text-gray-500 hover:text-orange-600 transition flex items-center gap-1"
                title="Login / Register"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-bold hidden lg:block">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl py-4 px-4 flex flex-col space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-amber-300 transition flex items-center gap-2"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 transition flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 transition flex items-center gap-2"
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/bookmarks" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                <Bookmark className="h-5 w-5 text-orange-500" />
                Bookmarks
              </Link>
              <Link to="/history" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                <History className="h-5 w-5 text-orange-500" />
                History
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to="/fanpage" className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition text-sm">
              <Share2 className="h-4 w-4" />
              Fanpage
            </Link>
            <a 
              href="https://discord.gg/7GeMpXYV" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-indigo-500 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Discord
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 py-2 border-t border-gray-100 dark:border-gray-800">
            <a 
              href="https://www.instagram.com/kaimangaofficial/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition transform hover:scale-110"
              title="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition transform hover:scale-110 opacity-50 cursor-not-allowed"
              title="YouTube (Coming Soon)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
            </a>
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition transform hover:scale-110 opacity-50 cursor-not-allowed"
              title="Facebook (Coming Soon)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>

          <nav className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <ul className="flex flex-col space-y-1">
              {[
                { label: 'Home', path: '/' },
                { label: 'Latest Manga', path: '/browse/latest' },
                { label: 'Hot Manga', path: '/browse/hot' },
                { label: 'New Manga', path: '/browse/new' },
                { label: 'Completed Manga', path: '/browse/completed' },
              ].map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className="px-4 py-3 block font-bold text-gray-800 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 rounded-lg transition uppercase text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <nav className="hidden md:block bg-orange-600 shadow-lg">
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

