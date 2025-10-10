import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Projects(){
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({ title: '', description: '', year: new Date().getFullYear(), type: 'Research', supervisor: '', mentor: '', leader: '', team: '' })
  const [isOpen, setIsOpen] = useState(false)

  function handleChange(e){
    const { name, value } = e.target
    setForm(f => ({...f, [name]: value}))
  }

  function handleCreate(e){
    e.preventDefault()
    const teamArray = form.team.split(',').map(s => s.trim()).filter(Boolean)
    const newProject = { ...form, id: Date.now(), team: teamArray }
    setProjects(p => [newProject, ...p])
    setForm({ title: '', description: '', year: new Date().getFullYear(), type: 'Research', supervisor: '', mentor: '', leader: '', team: '' })
    setIsOpen(false)
    toast.success('Project created')
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold">Your Projects</h1>
          <p className="text-slate-600 mt-2">Start a new project or manage your existing ones. Projects are private to your account.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col h-full justify-between">
              <div>
                <h3 className="font-semibold mb-3">Your Projects</h3>
                <p className="text-sm text-slate-600">Create and manage your projects. Projects are private to your account.</p>
              </div>
              <div className="mt-4">
                <button onClick={() => setIsOpen(true)} className="w-full px-4 py-3 bg-gradient-to-r from-sky-500 to-sky-400 text-white rounded-md shadow">Add New Project</button>
                <button onClick={() => navigate('/research')} className="w-full mt-3 px-4 py-2 border rounded-md">Explore Papers</button>
              </div>
            </div>
          </div>

          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">My Projects</h3>
              <div className="text-sm text-slate-500">{projects.length} projects</div>
            </div>

            <div className="space-y-4">
              {projects.length === 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm text-slate-600">No projects yet — create your first project using the form.</div>
              )}

              {projects.map(p => (
                <article key={p.id} className="bg-white rounded-xl p-4 shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{p.title}</h4>
                      <div className="text-sm text-slate-500">{p.type} • {p.year}</div>
                      <p className="text-sm mt-2 text-slate-700">{p.description}</p>
                      <div className="mt-2 text-sm text-slate-600">
                        <div><strong>Supervisor:</strong> {p.supervisor || '-'}</div>
                        <div><strong>Mentor:</strong> {p.mentor || '-'}</div>
                        <div><strong>Leader:</strong> {p.leader || '-'}</div>
                        <div><strong>Team:</strong> {(p.team || []).join(', ') || '-'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => navigate('/projects') } className="px-3 py-1 border rounded-md text-sm">Open</button>
                      <button onClick={() => setProjects(prev => prev.filter(x => x.id !== p.id))} className="px-3 py-1 text-sm text-red-600">Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
    
  {/* Modal */}
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
        <div className="relative bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
          <h3 className="text-lg font-semibold mb-3">Add New Project</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input name="title" value={form.title} onChange={handleChange} placeholder="Project title" className="w-full px-3 py-2 border rounded-md" required />
            <input name="supervisor" value={form.supervisor} onChange={handleChange} placeholder="Supervisor" className="w-full px-3 py-2 border rounded-md" />
            <input name="mentor" value={form.mentor} onChange={handleChange} placeholder="Mentor" className="w-full px-3 py-2 border rounded-md" />
            <input name="leader" value={form.leader} onChange={handleChange} placeholder="Team leader" className="w-full px-3 py-2 border rounded-md" />
            <input name="team" value={form.team} onChange={handleChange} placeholder="Team members (comma separated)" className="w-full px-3 py-2 border rounded-md" />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" className="w-full px-3 py-2 border rounded-md h-28" />
            <div className="flex items-center gap-2">
              <input name="year" value={form.year} onChange={handleChange} className="px-3 py-2 border rounded-md w-24" />
              <select name="type" value={form.type} onChange={handleChange} className="px-3 py-2 border rounded-md">
                <option>Research</option>
                <option>Capstone</option>
                <option>Community</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded-md">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-400 text-white rounded-md">Add Project</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  )
}
