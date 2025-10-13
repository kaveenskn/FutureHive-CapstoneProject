import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function loadProjects(){
  try{ return JSON.parse(localStorage.getItem('projects') || '[]') }catch(e){return []}
}

function saveProjects(ps){
  localStorage.setItem('projects', JSON.stringify(ps))
}

export default function ProjectDetails(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [projects, setProjects] = useState(loadProjects())
  const project = projects.find(p => String(p.id) === String(id))
  const [role, setRole] = useState('viewer') // role: supervisor, mentor, leader, viewer
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [perMilestoneTaskInput, setPerMilestoneTaskInput] = useState({})

  useEffect(() => { if(!project) navigate('/projects') }, [project])

  function addMilestone(){
    if(!milestoneTitle.trim()) return
    const ms = { id: Date.now(), title: milestoneTitle, tasks: [], createdAt: new Date().toISOString() }
    const updated = projects.map(p => p.id === project.id ? {...p, milestones: [...(p.milestones||[]), ms]} : p)
    setProjects(updated); saveProjects(updated); setMilestoneTitle('')
  }

  // add a task for a specific milestone id
  function addTaskFor(milestoneId){
    const title = (perMilestoneTaskInput[milestoneId] || '').trim()
    if(!title) return
    const updated = projects.map(p => {
      if(p.id !== project.id) return p
      const milestones = (p.milestones||[]).map(m => {
        if(m.id !== milestoneId) return m
        return {...m, tasks: [...(m.tasks||[]), { id: Date.now(), title, status: 'todo' } ]}
      })
      return {...p, milestones}
    })
    setProjects(updated); saveProjects(updated);
    setPerMilestoneTaskInput(prev => ({...prev, [milestoneId]: ''}))
  }

  function updateTaskStatus(milestoneId, taskId, status){
    const updated = projects.map(p => {
      if(p.id !== project.id) return p
      const milestones = (p.milestones||[]).map(m => {
        if(m.id !== milestoneId) return m
        return {...m, tasks: m.tasks.map(t => t.id===taskId ? {...t, status} : t)}
      })
      return {...p, milestones}
    })
    setProjects(updated); saveProjects(updated)
  }

  function percentComplete(m){
    const total = (m.tasks||[]).length
    if(total===0) return 0
    const done = m.tasks.filter(t=>t.status==='done').length
    return Math.round((done/total)*100)
  }

  if(!project) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white text-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <div className="text-sm text-slate-600">{project.type} • {project.year}</div>
            <div className="text-sm mt-2 text-slate-700">Supervisor: {project.supervisor || '-'}</div>
          </div>
          <div>
            <label className="text-sm text-slate-600 mr-2">Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)} className="border px-2 py-1 rounded">
              <option value="viewer">Viewer</option>
              <option value="supervisor">Supervisor</option>
              <option value="mentor">Mentor</option>
              <option value="leader">Leader</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <aside className="md:col-span-1 bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-2">Milestones</h3>
            <div className="space-y-2">
              {(project.milestones||[]).map(m => (
                <div key={m.id} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{m.title}</div>
                    <div className="text-xs text-slate-500">{percentComplete(m)}%</div>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div style={{width: `${percentComplete(m)}%`}} className="h-2 bg-sky-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
            { (role==='supervisor' || role==='mentor' || role==='leader') && (
              <div className="mt-4">
                <input value={milestoneTitle} onChange={e=>setMilestoneTitle(e.target.value)} placeholder="New milestone" className="w-full px-3 py-2 border rounded-md" />
                <button onClick={addMilestone} className="mt-2 w-full px-3 py-2 bg-sky-500 text-white rounded-md">Add Milestone</button>
              </div>
            )}
           </aside>

          <main className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold">Milestone Details</h3>
            { (project.milestones||[]).length===0 && (
              <div className="text-slate-600">No milestones yet. Add one from the left panel.</div>
            )}

            { (project.milestones||[]).map(m => (
              <section key={m.id} className="p-4 border rounded">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{m.title}</h4>
                    <div className="text-xs text-slate-500">Created: {new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-slate-500">{percentComplete(m)}%</div>
                </div>

                <div className="mb-3">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div style={{width: `${percentComplete(m)}%`}} className="h-2 bg-sky-500 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  { (m.tasks||[]).map(t=> (
                    <div key={t.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-slate-500">{t.status}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        { (role==='supervisor' || role==='mentor' || role==='leader') && (
                          <>
                            <button onClick={()=>updateTaskStatus(m.id, t.id, 'inprogress')} className="px-3 py-1 border rounded text-sm">In Progress</button>
                            <button onClick={()=>updateTaskStatus(m.id, t.id, 'done')} className="px-3 py-1 border rounded text-sm">Done</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                { (role==='supervisor' || role==='mentor' || role==='leader') && (
                  <div className="mt-4 flex gap-2">
                    <input value={perMilestoneTaskInput[m.id] || ''} onChange={e=>setPerMilestoneTaskInput(prev=>({...prev, [m.id]: e.target.value}))} placeholder="New task" className="flex-1 px-3 py-2 border rounded-md" />
                    <button onClick={()=>addTaskFor(m.id)} className="px-3 py-2 bg-sky-500 text-white rounded-md">Add Task</button>
                  </div>
                )}
              </section>
            ))}

          </main>
        </div>

      </div>
    </div>
  )
}
