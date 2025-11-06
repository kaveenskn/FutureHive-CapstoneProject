import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../components/Firebase';
import { toast } from 'react-toastify';

export default function ProjectDetails() {
  const { id } = useParams(); // project ID from URL
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [role, setRole] = useState('viewer');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [perMilestoneTaskInput, setPerMilestoneTaskInput] = useState({});

  // ✅ Fetch project and determine role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/signin');
        return;
      }

      setUser(currentUser);
      const projectData = await fetchProject(currentUser.uid, id);
      if (!projectData) return;

      // ✅ Determine role automatically
      let detectedRole = 'viewer';
      if (projectData.supervisorEmail === currentUser.email) detectedRole = 'supervisor';
      else if (projectData.mentorEmail === currentUser.email) detectedRole = 'mentor';
      else if (projectData.leaderEmail === currentUser.email) detectedRole = 'leader';
      else if ((projectData.team || []).includes(currentUser.email)) detectedRole = 'member';

      setRole(detectedRole);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  // ✅ Fetch project
  async function fetchProject(uid, projectId) {
    try {
      const projectRef = doc(db,'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const data = { id: projectSnap.id, ...projectSnap.data() };
        setProject(data);
        return data; // return data for role detection
      } else {
        toast.error('Project not found');
        navigate('/projects');
        return null;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load project');
      return null;
    }
  }

  // ✅ Update project
  async function updateProject(newData) {
    if (!user || !project) return;
    try {
      const projectRef = doc(db,'projects', project.id);
      await updateDoc(projectRef, newData);
      setProject((prev) => ({ ...prev, ...newData }));
    } catch (err) {
      console.error('Error updating project:', err);
      toast.error('Failed to update project');
    }
  }

  // ✅ Add milestone
  function addMilestone() {
    if (!milestoneTitle.trim() || !project) return;
    const newMilestone = {
      id: Date.now().toString(),
      title: milestoneTitle,
      tasks: [],
      createdAt: new Date().toISOString(),
    };
    const updatedMilestones = [...(project.milestones || []), newMilestone];
    updateProject({ milestones: updatedMilestones });
    setMilestoneTitle('');
  }

  // ✅ Add task
  function addTaskFor(milestoneId) {
    const title = (perMilestoneTaskInput[milestoneId] || '').trim();
    if (!title || !project) return;

    const updatedMilestones = (project.milestones || []).map((m) => {
      if (m.id !== milestoneId) return m;
      const newTask = { id: Date.now().toString(), title, status: 'todo' };
      return { ...m, tasks: [...(m.tasks || []), newTask] };
    });

    updateProject({ milestones: updatedMilestones });
    setPerMilestoneTaskInput((prev) => ({ ...prev, [milestoneId]: '' }));
  }

  // ✅ Update task status
  function updateTaskStatus(milestoneId, taskId, status) {
    if (!project) return;
    const updatedMilestones = (project.milestones || []).map((m) => {
      if (m.id !== milestoneId) return m;
      return {
        ...m,
        tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      };
    });
    updateProject({ milestones: updatedMilestones });
  }

  // ✅ Delete milestone
  function deleteMilestone(milestoneId) {
    if (!project) return;
    const updatedMilestones = (project.milestones || []).filter((m) => m.id !== milestoneId);
    updateProject({ milestones: updatedMilestones });
  }

  // ✅ Completion %
  function percentComplete(m) {
    const total = (m.tasks || []).length;
    if (total === 0) return 0;
    const done = m.tasks.filter((t) => t.status === 'done').length;
    return Math.round((done / total) * 100);
  }

  // ✅ Handle Enter key
  function handleKeyPress(event, callback) {
    if (event.key === 'Enter') {
      callback();
    }
  }

  // ✅ Permission control
  const canEdit =
    role === 'supervisor' || role === 'mentor' || role === 'leader';

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading project...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white text-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <div className="text-sm text-slate-600">
              {project.type} • {project.year}
            </div>
            <div className="text-sm mt-2 text-slate-700">
              Supervisor: {project.supervisorEmail || '-'}
            </div>
          </div>
          <div className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-md shadow-sm">
            Role: <span className="font-semibold capitalize">{role}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Milestones Sidebar */}
          <aside className="md:col-span-1 bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-2">Milestones</h3>
            <div className="space-y-2">
              {(project.milestones || []).map((m) => (
                <div key={m.id} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{m.title}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-500">
                        {percentComplete(m)}%
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => deleteMilestone(m.id)}
                          className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentComplete(m)}%` }}
                      className="h-2 bg-sky-500 rounded-full"
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {canEdit && (
              <div className="mt-4">
                <input
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, addMilestone)}
                  placeholder="New milestone"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <button
                  onClick={addMilestone}
                  className="mt-2 w-full px-3 py-2 bg-sky-500 text-white rounded-md"
                >
                  Add Milestone
                </button>
              </div>
            )}
          </aside>

          {/* Milestone Details */}
          <main className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold">Milestone Details</h3>

            {(project.milestones || []).length === 0 && (
              <div className="text-slate-600">
                No milestones yet. Add one from the left panel.
              </div>
            )}

            {(project.milestones || []).map((m) => (
              <section key={m.id} className="p-4 border rounded">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{m.title}</h4>
                    <div className="text-xs text-slate-500">
                      Created: {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-slate-500">
                      {percentComplete(m)}%
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentComplete(m)}%` }}
                      className="h-2 bg-sky-500 rounded-full"
                    ></div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  {(m.tasks || []).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-slate-500">{t.status}</div>
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateTaskStatus(m.id, t.id, 'inprogress')
                            }
                            className="px-3 py-1 border rounded text-sm"
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() =>
                              updateTaskStatus(m.id, t.id, 'done')
                            }
                            className="px-3 py-1 border rounded text-sm"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add new task */}
                {canEdit && (
                  <div className="mt-4 flex gap-2">
                    <input
                      value={perMilestoneTaskInput[m.id] || ''}
                      onChange={(e) =>
                        setPerMilestoneTaskInput((prev) => ({
                          ...prev,
                          [m.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        handleKeyPress(e, () => addTaskFor(m.id))
                      }
                      placeholder="New task"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <button
                      onClick={() => addTaskFor(m.id)}
                      className="px-3 py-2 bg-sky-500 text-white rounded-md"
                    >
                      Add Task
                    </button>
                  </div>
                )}
              </section>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
