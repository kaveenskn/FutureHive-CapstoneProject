import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../components/Firebase';
import { toast } from 'react-toastify';
import {
    ChevronLeft,
    Trash2,
    Plus,
    CheckCircle2,
    Circle,
    Clock,
    MoreVertical,
    Calendar,
    User,
    Flag
} from 'lucide-react';

export default function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [project, setProject] = useState(null);
    const [role, setRole] = useState('viewer');
    const [milestoneTitle, setMilestoneTitle] = useState('');
    const [perMilestoneTaskInput, setPerMilestoneTaskInput] = useState({});

    // --- Effects ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                navigate('/signin');
                return;
            }

            setUser(currentUser);
            const projectData = await fetchProject(currentUser.uid, id);
            if (!projectData) return;

            // Determine role
            let detectedRole = 'viewer';
            if (projectData.supervisorEmail === currentUser.email) detectedRole = 'supervisor';
            else if (projectData.mentorEmail === currentUser.email) detectedRole = 'mentor';
            else if (projectData.leaderEmail === currentUser.email) detectedRole = 'leader';
            else if ((projectData.team || []).includes(currentUser.email)) detectedRole = 'member';

            setRole(detectedRole);
        });

        return () => unsubscribe();
    }, [id, navigate]);

    // --- Data Logic ---
    async function fetchProject(uid, projectId) {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const projectSnap = await getDoc(projectRef);
            if (projectSnap.exists()) {
                const data = { id: projectSnap.id, ...projectSnap.data() };
                setProject(data);
                return data;
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

    async function updateProject(newData) {
        if (!user || !project) return;
        try {
            const projectRef = doc(db, 'projects', project.id);
            await updateDoc(projectRef, newData);
            setProject((prev) => ({ ...prev, ...newData }));
        } catch (err) {
            console.error('Error updating project:', err);
            toast.error('Failed to update project');
        }
    }

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

    function deleteMilestone(milestoneId) {
        if (!project) return;
        if (!window.confirm("Delete this milestone?")) return;
        const updatedMilestones = (project.milestones || []).filter((m) => m.id !== milestoneId);
        updateProject({ milestones: updatedMilestones });
    }

    function percentComplete(m) {
        const total = (m.tasks || []).length;
        if (total === 0) return 0;
        const done = m.tasks.filter((t) => t.status === 'done').length;
        return Math.round((done / total) * 100);
    }

    function handleKeyPress(event, callback) {
        if (event.key === 'Enter') {
            callback();
        }
    }

    const canEdit =
        role === 'supervisor' || role === 'mentor' || role === 'leader';

    // Format Date Helper
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    if (!project) {
        return (
            <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading project...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F4FA] font-sans text-slate-800 pb-20">

            {/* --- Page Header (Breadcrumb Style) --- */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/projects')}
                            className="p-2 hover:bg-white rounded-xl text-slate-500 hover:text-blue-600 transition shadow-sm hover:shadow-md bg-white/50 border border-transparent hover:border-slate-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-blue-600 leading-tight">{project.title}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <span className="font-medium bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-md">{project.type}</span>
                                <span>•</span>
                                <span>{project.year}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end text-xs mr-2">
                            <span className="text-slate-400 font-medium">Supervisor</span>
                            <span className="font-semibold text-slate-700 truncate max-w-[150px]">{project.supervisorEmail || '-'}</span>
                        </div>
                        <div className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 border shadow-sm ${role === 'leader' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            role === 'supervisor' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                'bg-white text-slate-600 border-slate-200'
                            }`}>
                            <User size={14} className="opacity-70" />
                            <span className="capitalize">{role}</span>
                        </div>
                    </div>
                </div>
            </div>
            <main className="max-w-7xl mx-auto px-6 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- Sidebar: Milestones --- */}
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-100 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <Flag size={18} className="text-blue-500" /> {/* Lucide icon if imported, else check import */}
                                    Milestones
                                </h3>
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                    {(project.milestones || []).length}
                                </span>
                            </div>

                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                                {(project.milestones || []).length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                        <p className="text-sm">No milestones yet</p>
                                    </div>
                                ) : (
                                    (project.milestones || []).map((m) => {
                                        const progress = percentComplete(m);
                                        return (
                                            <div key={m.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md transition group">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-semibold text-sm text-slate-800 line-clamp-2">{m.title}</h4>
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => deleteMilestone(m.id)}
                                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            style={{ width: `${progress}%` }}
                                                            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500 w-8 text-right">{progress}%</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {canEdit && (
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <div className="relative">
                                        <input
                                            value={milestoneTitle}
                                            onChange={(e) => setMilestoneTitle(e.target.value)}
                                            onKeyDown={(e) => handleKeyPress(e, addMilestone)}
                                            placeholder="Add new milestone..."
                                            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                                        />
                                        <button
                                            onClick={addMilestone}
                                            disabled={!milestoneTitle.trim()}
                                            className="absolute right-1 top-1 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition shadow-sm"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* --- Main: Task Details --- */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow border border-slate-100 min-h-[500px]">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Task Board</h2>

                            {(project.milestones || []).length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                                    <Clock size={48} className="mb-4 text-slate-300" />
                                    <p>Create a milestone to start adding tasks.</p>
                                </div>
                            )}

                            <div className="space-y-8">
                                {(project.milestones || []).map((m) => (
                                    <div key={m.id} className="group">
                                        {/* Milestone Header in Content */}
                                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                                            <div className="flex items-end gap-3">
                                                <h3 className="text-lg font-bold text-slate-800">{m.title}</h3>
                                                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded mb-1">
                                                    {m.tasks?.length || 0} Tasks
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(m.createdAt)}
                                            </div>
                                        </div>

                                        {/* Tasks List */}
                                        <div className="space-y-3 pl-2">
                                            {(m.tasks || []).length === 0 ? (
                                                <div className="text-sm text-slate-400 italic pl-2">No tasks yet.</div>
                                            ) : (
                                                (m.tasks || []).map((t) => (
                                                    <div
                                                        key={t.id}
                                                        className="group/task flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                disabled={!canEdit}
                                                                onClick={() => updateTaskStatus(m.id, t.id, t.status === 'done' ? 'todo' : 'done')}
                                                                className={`transition-colors ${t.status === 'done' ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}
                                                            >
                                                                {t.status === 'done' ? (
                                                                    <CheckCircle2 size={20} className="fill-green-50" />
                                                                ) : (
                                                                    <Circle size={20} />
                                                                )}
                                                            </button>
                                                            <span className={`text-sm font-medium transition-all ${t.status === 'done' ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}`}>
                                                                {t.title}
                                                            </span>
                                                        </div>

                                                        {canEdit && (
                                                            <div className="flex items-center gap-2 opacity-0 group-hover/task:opacity-100 transition-opacity">
                                                                {t.status === 'todo' && (
                                                                    <button
                                                                        onClick={() => updateTaskStatus(m.id, t.id, 'inprogress')}
                                                                        className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition"
                                                                    >
                                                                        Start
                                                                    </button>
                                                                )}
                                                                {t.status === 'inprogress' && (
                                                                    <button
                                                                        onClick={() => updateTaskStatus(m.id, t.id, 'done')}
                                                                        className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded hover:bg-green-100 transition"
                                                                    >
                                                                        Mark Done
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Add Task Input */}
                                        {canEdit && (
                                            <div className="mt-3 pl-11">
                                                <div className="relative max-w-md">
                                                    <input
                                                        value={perMilestoneTaskInput[m.id] || ''}
                                                        onChange={(e) =>
                                                            setPerMilestoneTaskInput((prev) => ({
                                                                ...prev,
                                                                [m.id]: e.target.value,
                                                            }))
                                                        }
                                                        onKeyDown={(e) => handleKeyPress(e, () => addTaskFor(m.id))}
                                                        placeholder="Add a new task..."
                                                        className="w-full pl-3 pr-10 py-2 bg-transparent border-b border-transparent focus:border-blue-200 focus:bg-slate-50 rounded-lg text-sm outline-none transition placeholder-slate-400"
                                                    />
                                                    {(perMilestoneTaskInput[m.id] || '').trim() && (
                                                        <button
                                                            onClick={() => addTaskFor(m.id)}
                                                            className="absolute right-1 top-1 p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
