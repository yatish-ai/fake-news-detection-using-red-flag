import React from 'react';
import { ShieldCheck, Heart, Server, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#070A11] border-t border-slate-900 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Project Details */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span className="text-slate-400 text-sm font-semibold">
              Real-Time Fake News Detector • College DevOps Submission
            </span>
          </div>
          
          {/* Tech Badges */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-1 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>FastAPI + Scikit-Learn</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dockerized + CI/CD</span>
            </div>
          </div>
          
          {/* Credits */}
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>using DevOps best practices</span>
          </div>
          
        </div>
        <div className="border-t border-slate-900/50 mt-6 pt-4 text-center">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} VeritasAI. Licensed under the MIT License. Data models are run purely locally for fast response and total privacy.
          </p>
        </div>
      </div>
    </footer>
  );
}
