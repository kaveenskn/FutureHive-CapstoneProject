import React, {useMemo, useState} from 'react'
import MentorCard from '../components/MentorCard'
import FiltersPanel from '../components/FiltersPanel'

const SAMPLE_MENTORS = [
  { id: 1, name: 'Dr. Aisha Rahman', expertise: ['Machine Learning','NLP'], experience: 8, bio: 'Assistant Prof. focused on interpretability and ML for social good. Open to supervised projects and co-authorship.', email: 'aisha@university.edu', linkedin: 'https://www.linkedin.com/in/aisharahman', availability: 'immediate' },
  { id: 2, name: 'Prof. Mark Li', expertise: ['Data Mining','Databases'], experience: 15, bio: 'Professor with industry collaborations in large-scale data systems. Prefers mentees with strong systems background.', email: 'mark.li@institute.edu', linkedin: '', availability: 'limited' },
  { id: 3, name: 'Dr. Priya Menon', expertise: ['Computer Vision','Deep Learning'], experience: 6, bio: 'Research scientist working on medical imaging. Interested in interdisciplinary projects.', email: '', linkedin: 'https://www.linkedin.com/in/priyamenon', availability: 'immediate' },
  { id: 4, name: 'Dr. John Doe', expertise: ['Machine Learning','Recommender Systems'], experience: 10, bio: 'Industry researcher and open-source maintainer. Mentoring students for collaborative publications.', email: 'j.doe@researchlab.com', linkedin: '', availability: 'limited' }
]

export default function Mentors(){
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({expertise: '', minExperience: 0, availability: '', sort: 'relevance'})
  const expertiseOptions = useMemo(() => Array.from(new Set(SAMPLE_MENTORS.flatMap(m => m.expertise))), [])

  const [selected, setSelected] = useState(null)

  const results = useMemo(() => {
    let items = SAMPLE_MENTORS.slice()
    if(query.trim()){
      const q = query.toLowerCase()
      items = items.filter(m => (m.name + ' ' + m.expertise.join(' ') + ' ' + m.bio).toLowerCase().includes(q))
    }
    if(filters.expertise){
      items = items.filter(m => m.expertise.includes(filters.expertise))
    }
    if(filters.minExperience){
      items = items.filter(m => m.experience >= filters.minExperience)
    }
    if(filters.availability){
      items = items.filter(m => m.availability === filters.availability)
    }
    if(filters.sort === 'experience'){
      items.sort((a,b) => b.experience - a.experience)
    }
    return items
  }, [query, filters])

  function handleViewMore(m){
    setSelected(m)
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Find a Mentor</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Search mentors by expertise, skill, or topic. Connect directly via email or LinkedIn.</p>
        </header>

        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1">
            <div className="relative">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search mentors, e.g. 'Machine Learning', 'Data Mining'" className="w-full rounded-lg border px-4 py-3 text-sm shadow-sm" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-sky-600 text-white px-3 py-1 rounded-md text-sm">Search</button>
            </div>
          </div>
          <div className="w-full md:w-64 text-right">
            <div className="text-sm text-slate-600 dark:text-slate-300">{results.length} mentors found</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <FiltersPanel filters={filters} setFilters={setFilters} expertiseOptions={expertiseOptions} />
          </div>

          <main className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(m => (
                <MentorCard key={m.id} mentor={m} onViewMore={handleViewMore} />
              ))}
            </div>
          </main>
        </div>

        {selected && (
          <div className="mt-6 bg-white dark:bg-slate-800 border rounded-lg p-4">
            <h3 className="text-lg font-semibold">{selected.name} — {selected.expertise.join(', ')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{selected.bio}</p>
            <div className="mt-3 flex items-center space-x-3">
              {selected.email && <a href={`mailto:${selected.email}`} className="px-4 py-2 bg-sky-600 text-white rounded-md">Email</a>}
              {selected.linkedin && <a href={selected.linkedin} target="_blank" rel="noreferrer" className="px-4 py-2 border rounded-md">LinkedIn</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
