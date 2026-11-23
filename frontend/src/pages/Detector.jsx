import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  ShieldAlert, 
  HelpCircle, 
  Trash2, 
  Globe, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  History,
  RotateCcw,
  Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Detector({ presetArticle, clearPreset }) {
  // Input states
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  
  // App states
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scrapeError, setScrapeError] = useState(null);
  const [llmResult, setLlmResult] = useState(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState(null);
  
  // History state
  const [history, setHistory] = useState([]);

  // Load preset article if directed from Dashboard
  useEffect(() => {
    if (presetArticle) {
      setTitle(presetArticle.title || '');
      setText(presetArticle.description || presetArticle.content || '');
      // Clear preset from parent so it doesn't stick
      clearPreset();
      
      // Auto-submit after state update (using timeout to let states bind)
      const timer = setTimeout(() => {
        handleSubmit(null, presetArticle.title, presetArticle.description || presetArticle.content);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [presetArticle]);

  // Load prediction history from local storage
  useEffect(() => {
    const cachedHistory = localStorage.getItem('veritas_history');
    if (cachedHistory) {
      try {
        setHistory(JSON.parse(cachedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save prediction to history helper
  const saveToHistory = (newPrediction) => {
    const updatedHistory = [newPrediction, ...history.slice(0, 19)]; // Limit to last 20 items
    setHistory(updatedHistory);
    localStorage.setItem('veritas_history', JSON.stringify(updatedHistory));
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('veritas_history');
  };

  // Scrape article URL handler
  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    try {
      setScraping(true);
      setScrapeError(null);
      
      const res = await axios.post(`${API_URL}/scrape-url`, { url });
      
      if (res.data && res.data.success) {
        setTitle(res.data.title);
        setText(res.data.text);
        setUrl(''); // Clear URL field on success
      } else {
        setScrapeError(res.data.message || "Failed to parse the article. Make sure it's a valid link.");
      }
    } catch (err) {
      console.error(err);
      setScrapeError("Network error. Make sure the backend server is running and CORS is enabled.");
    } finally {
      setScraping(false);
    }
  };

  // Run model prediction handler
  const handleSubmit = async (e, customTitle, customText) => {
    if (e) e.preventDefault();
    
    const activeTitle = customTitle || title;
    const activeText = customText || text;

    if (!activeTitle.trim() || !activeText.trim()) {
      setError("Please fill out both the title and text fields.");
      return;
    }
    if (activeText.length < 10) {
      setError("Article content must be at least 10 characters long.");
      return;
    }

    try {
      setLoading(true);
      setLlmLoading(true);
      setError(null);
      setLlmError(null);
      setLlmResult(null);
      
      const [predictionResponse, contextualResponse] = await Promise.allSettled([
        axios.post(`${API_URL}/predict`, { title: activeTitle, text: activeText }),
        axios.post(`${API_URL}/analyze-context`, { title: activeTitle, text: activeText })
      ]);
      
      if (predictionResponse.status === 'fulfilled' && predictionResponse.value.data) {
        const predictionData = predictionResponse.value.data;
        setResult(predictionData);
        
        // Save to local storage history
        saveToHistory({
          id: Date.now(),
          title: activeTitle,
          prediction: predictionData.prediction,
          confidence: predictionData.confidence,
          timestamp: new Date().toISOString()
        });
      } else if (predictionResponse.status === 'rejected') {
        throw predictionResponse.reason;
      }
      if (contextualResponse.status === 'fulfilled') {
        setLlmResult(contextualResponse.value.data);
      } else {
        console.error('LLM contextual analysis failed:', contextualResponse.reason);
        setLlmError('Contextual analysis could not be completed. Your ML prediction is still available.');
      }
    } catch (err) {
      console.error(err);
      setError("Backend connection failed. Model might still be starting on Render. Please try again.");
    } finally {
      setLoading(false);
      setLlmLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setText('');
    setUrl('');
    setResult(null);
    setLlmResult(null);
    setLlmError(null);
    setError(null);
  };

  // Helper count details
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
      
      {/* Left Column: Input Forms */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Scrape URL Box */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>Check Live URL</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Paste the link of any news article. The system will parse its main text content automatically.
          </p>
          <form onSubmit={handleScrape} className="flex gap-2">
            <input 
              type="text"
              placeholder="https://example.com/news-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={scraping || loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={scraping || loading || !url}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-sm font-semibold rounded-xl transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              {scraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <span>Fetch Content</span>
              )}
            </button>
          </form>
          {scrapeError && (
            <p className="text-xs text-rose-400 mt-2 font-medium">{scrapeError}</p>
          )}
        </div>

        {/* Form Inputs */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Article Details</span>
            </h3>
            {(title || text) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>
            )}
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                News Title
              </label>
              <input 
                type="text" 
                placeholder="Enter news title / headline..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Article Body Text
                </label>
                <span className="text-xs font-mono text-slate-500">
                  {wordCount} words / {charCount} chars
                </span>
              </div>
              <textarea 
                rows="8"
                placeholder="Paste the full paragraph or content of the news article here (minimum 10 characters)..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 resize-y"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-rose-400 font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !title || !text}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold rounded-xl transition-all duration-300 transform hover:translate-y-[-1px] shadow-glow-primary disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI Analyzing Model...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                  <span>Verify Authenticity</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: Prediction Results & History */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Results Card */}
        {result ? (
          <div className={`p-6 rounded-2xl transition-all duration-500 ${
            result.prediction === 'REAL' ? 'glow-card-real' : 'glow-card-fake'
          }`}>
            
            {/* Classification Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {result.prediction === 'REAL' ? (
                  <>
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-glow-real">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-400 tracking-widest uppercase">Verdict</span>
                      <h2 className="text-2xl font-black text-white leading-none">REAL NEWS</h2>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 shadow-glow-fake">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-rose-400 tracking-widest uppercase">Verdict</span>
                      <h2 className="text-2xl font-black text-white leading-none">FAKE NEWS</h2>
                    </div>
                  </>
                )}
              </div>

              {/* Confidence Circle */}
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    stroke={result.prediction === 'REAL' ? '#10B981' : '#EF4444'} 
                    strokeWidth="4" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - result.confidence / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-sm font-black text-white font-mono">{Math.round(result.confidence)}%</div>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/50 mb-6">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">AI Reasoning</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>
            </div>

            {/* Keyword Contribution */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                Key Words Influencing AI Classifier
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {result.key_terms && result.key_terms.length > 0 ? (
                  result.key_terms.map((term, idx) => {
                    const isRealContrib = term.score > 0;
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-300 ${
                          isRealContrib 
                            ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-400' 
                            : 'bg-rose-500/5 border-rose-500/25 text-rose-400'
                        }`}
                      >
                        <span className="font-bold">{term.word}</span>
                        <span className="opacity-60 text-[10px]">
                          ({isRealContrib ? '+' : ''}{term.score.toFixed(3)})
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-slate-500 text-xs italic">No specific keyword triggers detected in content.</span>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-4 pt-3 border-t border-slate-900/50">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Indicates Real Phrasing</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Indicates Fake Phrasing</span>
              </div>
            </div>


            {/* LLM Contextual Analysis */}
            <div className="mt-6 p-5 rounded-xl bg-slate-950/50 border border-indigo-500/20">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Contextual Analysis</h4>
                    <p className="text-[11px] text-slate-500">LLM-powered claim and context review</p>
                  </div>
                </div>
                {llmLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
              </div>
              {llmLoading ? (
                <div className="py-5 text-center">
                  <p className="text-sm text-indigo-300">Analyzing claims and context...</p>
                  <p className="text-xs text-slate-500 mt-1">This may take a few seconds.</p>
                </div>
              ) : llmError ? (
                <p className="text-xs text-amber-300">{llmError}</p>
              ) : llmResult ? (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-mono font-bold text-slate-400 uppercase mb-1">Summary</h5>
                    <p className="text-sm text-slate-300 leading-relaxed">{llmResult.summary}</p>
                  </div>
                  {[
                    ['Main Claims', llmResult.claims],
                    ['Contextual Concerns', llmResult.concerns],
                    ['Missing Evidence', llmResult.missing_evidence],
                    ['Suggested Checks', llmResult.suggested_checks]
                  ].map(([heading, items]) => items?.length > 0 && (
                    <div key={heading}>
                      <h5 className="text-xs font-mono font-bold text-slate-400 uppercase mb-2">{heading}</h5>
                      <ul className="space-y-1.5">
                        {items.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                    <h5 className="text-xs font-mono font-bold text-indigo-300 uppercase mb-1">Contextual Assessment</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{llmResult.assessment}</p>
                  {llmResult.model && <p className="text-[10px] text-slate-500 mt-2">Model: {llmResult.model}</p>}
                  {llmResult.disclaimer && <p className="text-[10px] text-slate-500 mt-2">{llmResult.disclaimer}</p>}
                  <p className="text-[10px] text-amber-400/80 mt-2">AI context analysis is not independent fact-checking.</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Red Flag Analysis */}
            {result.red_flag_analysis && (
              <div className="mt-6 p-5 rounded-xl bg-slate-950/50 border border-amber-500/20">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Red Flag Analysis</h4>
                      <p className="text-[11px] text-slate-500">Text-based risk indicators</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    result.red_flag_analysis.level === 'High'
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                      : result.red_flag_analysis.level === 'Moderate'
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  }`}>
                    {result.red_flag_analysis.level} · {result.red_flag_analysis.score}/100
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{result.red_flag_analysis.summary}</p>
                {result.red_flag_analysis.flags?.length ? (
                  <div className="space-y-2">
                    {result.red_flag_analysis.flags.map((flag, idx) => (
                      <div key={`${flag.category}-${idx}`} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-200">{flag.category}</span>
                          <span className={`text-[10px] uppercase font-bold ${
                            flag.severity === 'high' ? 'text-rose-400' : flag.severity === 'medium' ? 'text-amber-400' : 'text-slate-400'
                          }`}>{flag.severity}</span>
                        </div>
                        <p className="text-xs text-slate-400">{flag.message}</p>
                        <p className="text-[10px] text-slate-500 mt-1 break-words">Evidence: {flag.evidence}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400">No obvious warning patterns detected.</p>
                )}
                <p className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-800">{result.red_flag_analysis.disclaimer}</p>
              </div>
            )}

          </div>
        ) : (
          /* Empty State Results */
          <div className="p-8 rounded-2xl bg-dark-card border border-dark-border text-center h-[350px] flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
              <HelpCircle className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-300">Awaiting Input</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Fill the news form on the left or paste an article URL to verify validity.
              </p>
            </div>
          </div>
        )}

        {/* Prediction History Table */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Prediction History</span>
            </h3>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                title="Clear all history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No recent predictions stored in local storage.
            </p>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 bg-slate-900 border border-slate-800/60 rounded-xl flex items-center justify-between text-xs transition-colors hover:border-slate-800 cursor-pointer"
                  onClick={() => {
                    setTitle(item.title);
                    setText(''); // Ask user to input/check or let it reload
                    setError("Loaded title from history. Paste the full news content to verify.");
                  }}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <h5 className="text-slate-300 font-medium truncate">{item.title}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      item.prediction === 'REAL' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.prediction}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{Math.round(item.confidence)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
