import React from 'react';
import { 
  GitBranch, 
  Cpu, 
  Server, 
  Terminal, 
  Layers,
  Container,
  Code,
  ShieldCheck,
  CheckCircle,
  FileCode
} from 'lucide-react';

export default function About() {
  const steps = [
    {
      title: "1. Text Preprocessing",
      desc: "Combines news title and text. Removes english stopwords, normalizes case, and parses punctuation to extract raw lexical signals."
    },
    {
      title: "2. TF-IDF Vectorization",
      desc: "Converts text to numeric coordinates based on Term Frequency-Inverse Document Frequency. Vocabulary size is optimized to 5,000 top words to maintain lightweight footprint (<250KB)."
    },
    {
      title: "3. Passive-Aggressive Classifier",
      desc: "Computes predictions using a margin-based linear classifier. Highly effective for online news feeds because it runs updates dynamically and is robust to noise."
    },
    {
      title: "4. Confidence Calibration",
      desc: "Extracts decision boundary distance and maps it to a percentage in the range [50, 100]% using a mathematical Sigmoid activation function."
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Introduction Header */}
      <section className="space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          System Architecture & Documentation
        </h2>
        <p className="text-lg text-slate-400 max-w-3xl">
          Learn how the machine learning pipeline predicts article reliability and how the DevOps lifecycle automates building, testing, and deployment.
        </p>
      </section>

      {/* Grid: Architecture & ML Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ML Model pipeline */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5.5 h-5.5 text-indigo-400" />
            <span>AI Inference Pipeline</span>
          </h3>
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/40">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-400 font-mono flex items-center justify-center font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{step.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DevOps Setup */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5.5 h-5.5 text-indigo-400" />
            <span>DevOps Configuration</span>
          </h3>
          
          <div className="space-y-5">
            
            {/* Docker */}
            <div className="flex gap-4">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 h-10 w-10 flex items-center justify-center flex-shrink-0">
                <Container className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Docker Multi-Stage Containerization</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Both services run inside minimal Docker containers. The backend is loaded on a Python 3.10-slim build, and the frontend is compiled and served using a secure Nginx container.
                </p>
              </div>
            </div>

            {/* CI/CD */}
            <div className="flex gap-4">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 h-10 w-10 flex items-center justify-center flex-shrink-0">
                <GitBranch className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">GitHub Actions CI/CD Pipeline</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  On every commit to `main`, workflows automatically spin up, install package requirements, execute backend unit tests with `pytest`, build Docker images, and verify structural builds.
                </p>
              </div>
            </div>

            {/* Live Data */}
            <div className="flex gap-4">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 h-10 w-10 flex items-center justify-center flex-shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">NewsAPI & Scraping Integration</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bridges live global events into our ML core. The backend communicates with `newsapi.org` using secure HTTP requests and scrapes target page paragraphs using BeautifulSoup4 for immediate check.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Deployment environment instructions */}
      <section className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5.5 h-5.5 text-indigo-400" />
          <span>Deployment Environment Configurations</span>
        </h3>
        
        <p className="text-sm text-slate-400">
          To run the system in production, configure the following environment variables. The project utilizes secure variable loading preventing client leaks.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs">
                <th className="py-3 px-4 font-bold uppercase">Variable Name</th>
                <th className="py-3 px-4 font-bold uppercase">Target Service</th>
                <th className="py-3 px-4 font-bold uppercase">Description</th>
                <th className="py-3 px-4 font-bold uppercase">Example Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              <tr className="text-slate-300 hover:bg-slate-900/20">
                <td className="py-3.5 px-4 font-bold text-indigo-400">NEWS_API_KEY</td>
                <td className="py-3.5 px-4">FastAPI (Render / Docker)</td>
                <td className="py-3.5 px-4 text-slate-400">Key for newsapi.org. Falls back to mock news if unset.</td>
                <td className="py-3.5 px-4">`c248b11...`</td>
              </tr>
              <tr className="text-slate-300 hover:bg-slate-900/20">
                <td className="py-3.5 px-4 font-bold text-indigo-400">VITE_API_URL</td>
                <td className="py-3.5 px-4">React (Vercel / Docker)</td>
                <td className="py-3.5 px-4 text-slate-400">Public HTTP endpoint of your deployed FastAPI backend.</td>
                <td className="py-3.5 px-4">`https://api-news.onrender.com`</td>
              </tr>
              <tr className="text-slate-300 hover:bg-slate-900/20">
                <td className="py-3.5 px-4 font-bold text-indigo-400">PORT</td>
                <td className="py-3.5 px-4">FastAPI (Render / Docker)</td>
                <td className="py-3.5 px-4 text-slate-400">Port the FastAPI backend binds to. Defaults to 8000.</td>
                <td className="py-3.5 px-4">`8000`</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* College Project Viva Prep Tips */}
      <section className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 space-y-4">
        <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          <span>College Viva Presentation Notes</span>
        </h3>
        <ul className="space-y-2.5 text-sm text-slate-400 list-disc pl-5">
          <li><strong>Passive-Aggressive Classification:</strong> Unlike traditional classifiers, Passive-Aggressive algorithms update their weight vector incrementally when predictions are incorrect (Aggressive step) but keep them unchanged if the prediction is correct and satisfies margins (Passive step). This is ideal for streaming news.</li>
          <li><strong>Lightweight TF-IDF Model:</strong> By limiting `max_features=5000`, the vocabulary matrix size is compressed. This results in a fast load speed and small memory usage, making it ideal for free tiers.</li>
          <li><strong>Docker Containers:</strong> The `docker-compose.yml` ties the frontend and backend services into isolated user spaces, simplifying local setups with a single command.</li>
          <li><strong>Continuous Integration:</strong> The GitHub Actions pipeline runs on every push to verify build and test passes before deployment, preventing broken code in production.</li>
        </ul>
      </section>

    </div>
  );
}
