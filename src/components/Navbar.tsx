import { Search, Facebook, Bell, History, Power } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/logo.webp';

export const Navbar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="bg-white">
      {/* Top Header */}
      <div className="container-custom py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="KaiManga" className="h-12 w-12 rounded-lg object-cover" />
          <span className="text-3xl font-bold tracking-tight text-gray-800">Kai<span className="text-orange-600">Manga</span></span>
        </Link>

        <div className="flex-1 max-w-xl mx-4 relative">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search manga..."
              className="w-full border-2 border-orange-500 text-gray-800 px-4 py-2 pr-10 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-orange-500 text-white rounded-r hover:bg-orange-600 transition">
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded flex items-center space-x-1">
              <Facebook className="h-3 w-3" />
              <span>Fanpage</span>
            </button>
            <button className="bg-indigo-500 text-white px-3 py-1 text-xs font-bold rounded">Discord</button>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-500">
            <Bell className="h-5 w-5 hover:text-orange-500 cursor-pointer" />
            <History className="h-5 w-5 hover:text-orange-500 cursor-pointer" />
            <Power className="h-5 w-5 hover:text-red-500 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-orange-600 shadow-lg">
        <div className="container-custom">
          <ul className="flex flex-wrap items-center text-white text-sm font-bold uppercase overflow-x-auto whitespace-nowrap">
            <li>
              <Link to="/" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">Home</Link>
            </li>
            <li>
              <Link to="/latest" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">Latest Manga</Link>
            </li>
            <li>
              <Link to="/popular" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">Hot Manga</Link>
            </li>
            <li>
              <Link to="/new" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">New Manga</Link>
            </li>
            <li>
              <Link to="/completed" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">Completed Manga</Link>
            </li>
            <li>
              <Link to="/genres" className="px-4 py-3 block hover:bg-white hover:text-orange-600 transition">Genres</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};
