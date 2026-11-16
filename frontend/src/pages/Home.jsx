import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  FileText,
  AlertCircle,
  Network
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Home({ onAnalyze }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/latest-news`);
        if (res.data && res.data.articles) {
          setArticles(res.data.articles);
        } else {
          setError("Failed to fetch news structure.");
        }
      } catch (err) {
        console.error("Error fetching news, showing offline fallback:", err);
        setError("Unable to connect to live News API. Showing cached offline data.");
        // Fallback to static mock data in case server is loading
        setArticles([
          {
            title: "NASA Mars Rover Finds Evidence of Ancient Lake Bed in Jezero Crater",
            description: "Scientists confirm that the Perseverance rover has uncovered rock layers that prove liquid water once flowed on Mars for millions of years.",
            url: "https://www.nasa.gov",
            urlToImage: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop",
            publishedAt: new Date().toISOString(),
            source: { name: "NASA Science" },
            content: "NASA's Perseverance rover has found groundbreaking evidence of an ancient lake bed in the Jezero Crater, proving that Mars was once home to liquid water."
          },
          {
            title: "Crypto Pioneer Announces Launch of First Quantum-Encrypted Token",
            description: "A new blockchain startup claims to have built a coin that is 100% immune to decoding by quantum computers using lattice-based cryptography.",
            url: "https://www.bloomberg.com",
            urlToImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop",
            publishedAt: new Date().toISOString(),
            source: { name: "Bloomberg Finance" },
            content: "A group of cryptography developers has announced the launch of the first quantum-resistant blockchain token, designed to protect digital assets from future quantum computers."
          },
          {
            title: "Unbelievable Breakthrough: Secret Herb Cures Common Cold in 24 Hours",
            description: "An exclusive report reveals that a rare mountain herb found in the Andes completely eradicates the rhinovirus in less than one day, but big pharma is hiding it.",
            url: "https://www.healthnews.com",
            urlToImage: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&auto=format&fit=crop",
            publishedAt: new Date().toISOString(),
            source: { name: "Healthy Living Daily" },
            content: "A secret report claims that a rare mountain herb found in the Andes completely cures the common cold in 24 hours. The discovery has sparked controversy."
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const stats = [
    { label: 'Classification Accuracy', value: '92.03%', icon: ShieldCheck, color: 'text-emerald-400' },
    { label: 'Avg Inference Speed', value: '0.04s', icon: Zap, color: 'text-amber-400' },
    { label: 'Pipeline Architecture', value: 'TF-IDF + PAC', icon: Network, color: 'text-indigo-400' },
    { label: 'Model Size (Pickle)', value: '< 250 KB', icon: FileText, color: 'text-blue-400' }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950/80 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-400">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            <span>DevOps + Artificial Intelligence</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Verify News Authenticity <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              In Real Time With AI
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A state-of-the-art detector powered by a trained PassiveAggressive machine learning pipeline. Stop misinformation instantly with detailed word contribution analysis.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onAnalyze()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:translate-y-[-2px] shadow-glow-primary"
            >
              <span>Launch Analysis Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#trending"
              className="px-6 py-3 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold rounded-xl transition-all duration-300"
            >
              Browse Live Articles
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-dark-card border border-dark-border hover:border-slate-700 transition-all duration-300 hover:translate-y-[-2px]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stat.value}</div>
            </div>
          );
        })}
      </section>

      {/* Trending News Section */}
      <section id="trending" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">Trending Global Headlinese</h2>
          </div>
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline Fallback Active</span>
            </div>
          )}
        </div>

        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl border border-slate-900 bg-[#121824]/50 overflow-hidden h-[400px] flex flex-col space-y-4 p-4">
                <div className="w-full h-48 skeleton rounded-xl" />
                <div className="h-6 w-1/4 skeleton rounded" />
                <div className="h-8 w-full skeleton rounded" />
                <div className="h-16 w-full skeleton rounded" />
                <div className="h-10 w-full mt-auto skeleton rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          /* News Feed Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, idx) => (
              <div 
                key={idx} 
                className="group flex flex-col rounded-2xl bg-dark-card border border-dark-border hover:border-slate-700/80 overflow-hidden transition-all duration-300 hover:translate-y-[-4px]"
              >
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img 
                    src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop'} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-mono font-bold bg-slate-950/70 border border-slate-800 text-indigo-400 rounded-md backdrop-blur-sm">
                    {article.source.name}
                  </div>
                </div>

                {/* Article Content */}
                <div className="flex-1 p-5 flex flex-col space-y-3">
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(article.publishedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                  </div>
                  
                  <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-slate-400 line-clamp-3 flex-1">
                    {article.description || article.content || "No detailed description available for this live article. Click analyze to check the news content."}
                  </p>

                  <button
                    onClick={() => onAnalyze(article)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-indigo-600/10 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white border border-indigo-500/20 group-hover:border-indigo-600 rounded-xl text-sm font-semibold transition-all duration-300"
                  >
                    <span>Analyze This News</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
