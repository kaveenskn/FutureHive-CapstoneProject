import React from 'react'

export default function FiltersPanel({filters, setFilters, expertiseOptions}){
  return (
    <aside className="w-full md:w-72 bg-white dark:bg-slate-800 border rounded-lg p-4 space-y-4">
      <h4 className="font-semibold text-slate-800 dark:text-slate-100">Filters</h4>

      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Expertise</label>
        <select value={filters.expertise} onChange={e => setFilters(f => ({...f, expertise: e.target.value}))} className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="">Any</option>
          {expertiseOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Experience (min years)</label>
        <input type="number" min={0} value={filters.minExperience} onChange={e => setFilters(f => ({...f, minExperience: Number(e.target.value)}))} className="w-full rounded-md border px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Availability</label>
        <select value={filters.availability} onChange={e => setFilters(f => ({...f, availability: e.target.value}))} className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="">Any</option>
          <option value="immediate">Available now</option>
          <option value="limited">Limited</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Sort</label>
        <select value={filters.sort} onChange={e => setFilters(f => ({...f, sort: e.target.value}))} className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="relevance">Relevance</option>
          <option value="experience">Experience (high to low)</option>
        </select>
      </div>

    </aside>
  )
}
