import React, { useState } from 'react';
import { Shield, Menu, X, Terminal } from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'detector', label: 'Analysis Center' },
    { id: 'about', label: 'Documentation' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30 shadow-glow-primary">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              VERITAS<span className="text-indigo-500 text-xs ml-1 font-mono tracking-widest border border-indigo-500/30 px-1 rounded bg-indigo-500/10">AI</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === item.id
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-glow-primary'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="w-[1px] h-6 bg-slate-800" />
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>v1.0.0</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0B0F19] border-b border-slate-800 px-2 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                currentPage === item.id
                  ? 'bg-indigo-600/15 text-indigo-400 border-l-4 border-l-indigo-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
