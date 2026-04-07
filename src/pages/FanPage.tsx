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
              <p className="text-indigo-100 opacity-90">Join our Discord server for live discussions and support.</p>
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
