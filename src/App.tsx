import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Details } from './pages/Details';
import { Reader } from './pages/Reader';
import { Search } from './pages/Search';
import { Browse } from './pages/Browse';
import { Bookmarks } from './pages/Bookmarks';
import { History } from './pages/History';
import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isReader = location.pathname.includes('/read') || (location.pathname.split('/').length > 3);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      {!isReader && <Navbar />}
      <main className={`${!isReader ? 'pb-12' : ''}`}>
        {children}
      </main>

      {!isReader && showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 p-3 bg-orange-600 text-white rounded-full shadow-2xl hover:bg-orange-700 transition-all duration-300 transform hover:scale-110 border border-orange-500/20"
          title="Back to Top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}

      {!isReader && (
        <footer className="bg-gray-200 border-t border-gray-300 py-12 dark:bg-gray-900 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-600 text-sm dark:text-gray-500">
              &copy; {new Date().getFullYear()} KaiManga. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2 dark:text-gray-600">
              Powered by KaiManga Scraper
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

function App() {
  const isGithubPages = window.location.hostname.includes('github.io');
  
  return (
    <Router basename={isGithubPages ? '/KAIMANGA' : ''}>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/browse/:type" element={<Browse />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/history" element={<History />} />
          <Route path="/manga/:id" element={<Details />} />
          <Route path="/manga/:id/:chapterId" element={<Reader />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
