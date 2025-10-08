import React, { useState } from 'react';

// Note: This component uses Tailwind classes consistent with the project styling.
// It is a presentational page. Hook up real upload/search/generation logic later.

const IdeaCard = ({ idea, onSave, onCopy }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-transparent hover:border-blue-200">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-900">{idea.title}</h4>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{idea.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {idea.tags?.map((t) => (
            <span key={t} className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">#{t}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <button onClick={() => onSave(idea)} className="text-sm bg-white border border-gray-200 px-3 py-1 rounded-md hover:bg-blue-50">Save</button>
        <button onClick={() => onCopy(idea)} className="text-sm bg-white border border-gray-200 px-3 py-1 rounded-md hover:bg-blue-50">Copy</button>
      </div>
    </div>
  </div>
);

export default function IdeaGenerator() {
  const [activeTab, setActiveTab] = useState('upload');
  const [ideas, setIdeas] = useState([]);
  const [query, setQuery] = useState('');
  const [uploadName, setUploadName] = useState(null);

  // mock generator
  const generateIdeas = (source) => {
    const base = source === 'upload' ? 'From your uploaded paper' : `From keyword: ${query}`;
    const sample = [
      {
        title: `${base} — Idea 1: Extend with real-world dataset`,
        description: 'Design an experiment to validate the proposed approach on a larger, real-world dataset and compare against baseline methods.',
        tags: ['AI', 'DataScience'],
      },
      {
        title: `${base} — Idea 2: Improve methodology`,
        description: 'Refine the algorithm with attention to scalability, introduce ablation studies, and evaluate computational costs.',
        tags: ['Methodology', 'Scalability'],
      },
      {
        title: `${base} — Idea 3: Application-focused study`,
        description: 'Apply the model to a specific domain (e.g., healthcare) and explore domain-specific adaptations and benchmarks.',
        tags: ['AI', 'Healthcare'],
      },
    ];
    setIdeas(sample);
  };

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setUploadName(f.name);
  };

  const onSave = (idea) => alert('Saved idea: ' + idea.title);
  const onCopy = (idea) => { navigator.clipboard.writeText(idea.title + '\n' + idea.description); alert('Copied idea'); };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <nav className="text-sm text-gray-500 mb-2">Home / Idea Generator</nav>
          <h1 className="text-3xl font-extrabold">AI Research Idea Generator</h1>
          <p className="text-gray-600 mt-2">Get smart suggestions for your ongoing or new research topics.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-8">
            <div className="bg-gradient-to-r from-[#00bfff] to-[#1a73e8] rounded-xl p-1 mb-6 shadow-sm">
              <div className="bg-white rounded-lg p-6">
                <div className="flex gap-4 items-center mb-4">
                  <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 rounded-md ${activeTab==='upload' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>Upload Existing Paper</button>
                  <button onClick={() => setActiveTab('keyword')} className={`px-4 py-2 rounded-md ${activeTab==='keyword' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>Keyword Search</button>
                </div>

                {activeTab === 'upload' ? (
                  <div>
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-300">
                      <svg className="w-10 h-10 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V8a4 4 0 014-4h2a4 4 0 014 4v8" /></svg>
                      <span className="text-gray-600">Drag & drop a PDF or <span className="text-blue-600">browse</span></span>
                      <input id="file-upload" type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
                    </label>

                    <div className="mt-4 flex items-center gap-3">
                      <button onClick={() => generateIdeas('upload')} className="px-5 py-3 bg-[#00bfff] hover:bg-[#1a73e8] text-white rounded-lg">Generate Suggestions</button>
                      <div className="text-sm text-gray-500">{uploadName ? `Selected: ${uploadName}` : 'No file selected'}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-3">
                      <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Enter a keyword or research area (e.g., AI in healthcare)" className="flex-1 px-4 py-3 border rounded-md" />
                      <button onClick={()=>generateIdeas('keyword')} className="px-5 py-3 bg-[#00bfff] hover:bg-[#1a73e8] text-white rounded-lg">Generate Ideas</button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Search by keyword to generate focused research ideas.</p>
                  </div>
                )}

                {/* Output */}
                <div className="mt-6 grid gap-4">
                  {ideas.map((it, idx) => (
                    <div key={idx} className="transform transition-all duration-300 opacity-0 animate-fade-in-up">
                      <IdeaCard idea={it} onSave={onSave} onCopy={onCopy} />
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Right Column */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-md font-semibold mb-2">Recent Generations</h3>
                <div className="space-y-2 max-h-60 overflow-auto">
                  <div className="p-3 bg-gray-50 rounded-md">AI in healthcare — 3 ideas</div>
                  <div className="p-3 bg-gray-50 rounded-md">Edge-AI for agriculture — 2 ideas</div>
                  <div className="p-3 bg-gray-50 rounded-md">Explainability in NLP — 5 ideas</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-md font-semibold mb-2">Trending Research Areas</h3>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-blue-700">#AI</span>
                  <span className="text-sm text-blue-700">#DataScience</span>
                  <span className="text-sm text-blue-700">#Healthcare</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-8 text-sm text-gray-500 border-t pt-4">Research Hub | About | Contact</footer>
      </div>
    </div>
  );
}
