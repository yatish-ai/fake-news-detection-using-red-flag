import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Detector from './pages/Detector';
import About from './pages/About';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Callback when user clicks 'Analyze This News' on the home page
  const handleAnalyzeArticle = (article) => {
    setSelectedArticle(article);
    setCurrentPage('detector');
  };

  const handleClearPreset = () => {
    setSelectedArticle(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onAnalyze={handleAnalyzeArticle} />;
      case 'detector':
        return (
          <Detector 
            presetArticle={selectedArticle} 
            clearPreset={handleClearPreset} 
          />
        );
      case 'about':
        return <About />;
      default:
        return <Home onAnalyze={handleAnalyzeArticle} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080C14] text-slate-100 selection:bg-indigo-600/30 selection:text-indigo-200">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      <Footer />
    </div>
  );
}
