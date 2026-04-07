import { Users, MessageCircle, Heart, Star, Share2, ExternalLink } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';

export const Fanpage = () => {
  return (
    <div className="container-custom py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white p-8 md:p-12 shadow-xl">
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                Welcome to the <span className="text-yellow-300">KaiManga</span> Fanpage!
              </h1>
              <p className="text-lg md:text-xl text-orange-50 opacity-90 mb-8 leading-relaxed">
                Join our amazing community of manga enthusiasts! Share your favorite series, discuss the latest chapters, and stay updated with everything KaiManga.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://discord.gg/7GeMpXYV" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  Join our Discord
                </a>
                <button className="bg-orange-700/30 hover:bg-orange-700/50 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-105">
                  <Heart className="h-5 w-5 fill-current" />
                  Support Us
                </button>
              </div>
            </div>
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Active Community</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Connect with thousands of other readers and share your passion for manga and anime.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Exclusive Updates</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Be the first to know about new site features, upcoming manga releases, and community events.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Share Your Favorites</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Create and share your own manga recommendations and collections with the community.
              </p>
            </div>
          </div>

          {/* Discord CTA */}
          <div className="bg-indigo-600 rounded-2xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Want to chat with us?</h2>
              <p className="text-indigo-100 opacity-90 mb-4">Join our Discord server for live discussions and support.</p>
              <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                <a 
                  href="https://www.instagram.com/kaimangaofficial/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-pink-300 transition transform hover:scale-110"
                  title="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-red-400 transition transform hover:scale-110 opacity-50 cursor-not-allowed"
                  title="YouTube (Coming Soon)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-blue-400 transition transform hover:scale-110 opacity-50 cursor-not-allowed"
                  title="Facebook (Coming Soon)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              </div>
            </div>
            <a 
              href="https://discord.gg/7GeMpXYV" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 whitespace-nowrap shadow-lg"
            >
              <MessageCircle className="h-5 w-5" />
              Join Discord Server
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Community Guidelines */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Community Guidelines
            </h2>
            <div className="space-y-4">
              {[
                "Be respectful to all community members.",
                "No spoilers in general chat channels.",
                "Keep discussions civil and avoid toxic behavior.",
                "Support the original creators whenever possible.",
                "Have fun and share your love for manga!"
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p>{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default Fanpage;
