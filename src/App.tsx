import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Details } from './pages/Details';
import { Reader } from './pages/Reader';
import { Search } from './pages/Search';
import { useEffect } from 'react';

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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {!isReader && <Navbar />}
      <main className={`${!isReader ? 'pb-12' : ''}`}>
        {children}
      </main>
      {!isReader && (
        <footer className="bg-gray-900 border-t border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} KaiManga. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Powered by KaiManga Scraper
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/manga/:id" element={<Details />} />
          <Route path="/manga/:id/:chapterId" element={<Reader />} />
          <Route path="/popular" element={<Home />} /> {/* Just reusing Home for now */}
          <Route path="/latest" element={<Home />} /> {/* Just reusing Home for now */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
