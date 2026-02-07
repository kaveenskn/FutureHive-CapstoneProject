import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClipboardPlus, Flag, BarChart3, Search, Plus, Trash2, ExternalLink, Layout, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDocs, addDoc, deleteDoc, collection, query, where, or } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from "../components/Firebase";

// --- Sub-Component for Individual Project Card ---
const ProjectCard = ({ project: p, getTypeStyles, navigate, handleDelete }) => {
    const [showTeam, setShowTeam] = useState(false);
    const styles = getTypeStyles(p.type);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col group ${styles.border} relative`}
        >
            <div className="p-6 pb-4 flex-1 relative">
                {/* Header: Type and Year */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${styles.badge}`}>
                            {p.type}
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                        {p.year}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`text-xl font-bold text-slate-900 mb-3 transition-colors ${styles.titleHover}`}>
                    {p.title}
                </h3>

                {/* Content Area: Description vs Team Details */}
                <div className="relative min-h-[80px]">
                    <AnimatePresence mode="wait">
                        {!showTeam ? (
                            <motion.p
                                key="desc"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-slate-500 text-sm leading-relaxed line-clamp-3"
                            >
                                {p.description || "No description provided."}
                            </motion.p>
                        ) : (
                            <motion.div
                                key="team"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-sm space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 absolute inset-0 overflow-y-auto no-scrollbar"
                            >
                                <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Supervisor</span>
                                    <span className="truncate font-medium text-slate-700" title={p.supervisorEmail}>{p.supervisorEmail || '-'}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Mentor</span>
                                    <span className="truncate font-medium text-slate-700" title={p.mentorEmail}>{p.mentorEmail || '-'}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Leader</span>
                                    <span className="truncate font-medium text-slate-700" title={p.leaderEmail}>{p.leaderEmail || '-'}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-x-2 items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase mt-1">Team</span>
                                    <div className="flex flex-wrap gap-1">
                                        {p.team && p.team.length > 0 ? (
                                            p.team.slice(0, 3).map((member, i) => (
                                                <span key={i} className="text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-full">
                                                    {member.split('@')[0]}
                                                </span>
                                            ))
                                        ) : '-'}
                                        {p.team && p.team.length > 3 && <span className="text-xs text-slate-400">+{p.team.length - 3}</span>}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 mt-auto">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${styles.accent}`}></div>
                        Active Team
                    </span>
                    <span className="font-semibold text-slate-700">{p.team?.length || 0} Members</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className={`flex-1 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition shadow-sm ${styles.button} flex items-center justify-center gap-2`}
                    >
                        View Details
                    </button>

                    <button
                        onClick={() => setShowTeam(!showTeam)}
                        className={`px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg transition shadow-sm hover:bg-slate-50 ${showTeam ? 'bg-slate-100 border-slate-300' : ''}`}
                        title={showTeam ? "Hide Team Info" : "View Team Info"}
                    >
                        {showTeam ? <X size={18} /> : <Users size={18} />}
                    </button>

                    <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100"
                        title="Delete Project"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        type: 'Research',
        supervisorEmail: '',
        mentorEmail: '',
        leaderEmail: '',
        team: ''
    });
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // --- Effects & Data Fetching ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchProjects(currentUser.email);
            } else {
                setUser(null);
                setProjects([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchProjects = async (userEmail) => {
        if (!userEmail) return;
        try {
            const projectsRef = collection(db, "projects");
            const q = query(
                projectsRef,
                or(
                    where("supervisorEmail", "==", userEmail),
                    where("mentorEmail", "==", userEmail),
                    where("leaderEmail", "==", userEmail),
                    where("team", "array-contains", userEmail)
                )
            );
            const snapshot = await getDocs(q);
            const fetchedProjects = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProjects(fetchedProjects);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) {
            toast.error("Please log in to add a project");
            return;
        }
        const teamArray = form.team
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

        const newProject = {
            title: form.title,
            description: form.description,
            year: form.year,
            type: form.type,
            supervisorEmail: form.supervisorEmail.toLowerCase() || null,
            mentorEmail: form.mentorEmail.toLowerCase() || null,
            leaderEmail: form.leaderEmail.toLowerCase() || null,
            team: teamArray,
            createdBy: auth.currentUser.uid,
            createdAt: new Date(),
        };

        try {
            const docRef = await addDoc(collection(db, "projects"), newProject);
            const savedProject = { id: docRef.id, ...newProject };
            setProjects((prev) => [savedProject, ...prev]);
            toast.success("Project added successfully");
            setIsOpen(false);
            setForm({
                title: '',
                description: '',
                year: new Date().getFullYear(),
                type: 'Research',
                supervisorEmail: '',
                mentorEmail: '',
                leaderEmail: '',
                team: ''
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to add project");
        }
    };

    const handleDelete = async (projectId) => {
        if (!projectId) return;
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        try {
            const projectRef = doc(db, "projects", projectId);
            await deleteDoc(projectRef);
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
            toast.success("Project deleted successfully!");
        } catch (error) {
            console.error("Error deleting project:", error);
            toast.error("Failed to delete project.");
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Theme Helpers ---
    const getTypeStyles = (type) => {
        switch (type) {
            case 'Capstone':
                return {
                    border: 'hover:border-violet-300',
                    badge: 'bg-violet-100 text-violet-700',
                    iconBg: 'bg-violet-50 text-violet-600',
                    titleHover: 'group-hover:text-violet-700',
                    button: 'hover:border-violet-300 hover:text-violet-700',
                    accent: 'bg-violet-500'
                };
            case 'Community':
                return {
                    border: 'hover:border-emerald-300',
                    badge: 'bg-emerald-100 text-emerald-700',
                    iconBg: 'bg-emerald-50 text-emerald-600',
                    titleHover: 'group-hover:text-emerald-700',
                    button: 'hover:border-emerald-300 hover:text-emerald-700',
                    accent: 'bg-emerald-500'
                };
            case 'Research':
            default:
                return {
                    border: 'hover:border-blue-300',
                    badge: 'bg-blue-100 text-blue-700',
                    iconBg: 'bg-blue-50 text-blue-600',
                    titleHover: 'group-hover:text-blue-700',
                    button: 'hover:border-blue-300 hover:text-blue-700',
                    accent: 'bg-blue-500'
                };
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F4FA] font-sans text-slate-800 pb-20 pt-8">
            <main className="max-w-7xl mx-auto px-6">

                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16 mt-8">
                    <div className="flex-1 max-w-2xl space-y-6">
                        <div>
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-xs font-bold tracking-wide uppercase mb-3">
                                Workspace
                            </span>
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
                                Manage Your <br />
                                <span className="text-blue-600">Projects</span>
                            </h1>
                        </div>

                        <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
                            Start a new project or manage your existing ones. Keep your team aligned and your goals in sight.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl pt-4">
                            <div className="relative flex-grow group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none shadow-sm text-slate-700 placeholder-slate-400"
                                />
                            </div>
                            <button
                                onClick={() => setIsOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="whitespace-nowrap">New Project</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-lg">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-white border-4 border-white"
                        >
                            <img
                                src="https://img.freepik.com/free-vector/scrum-method-concept-illustration_114360-10060.jpg"
                                alt="Project Management"
                                className="object-cover w-full h-full mix-blend-multiply opacity-90"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-blue-200"><svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg></div>';
                                }}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Projects Grid Section */}
                <div className="mb-12">
                    <div className="flex items-end justify-between mb-6 pb-2 border-b border-slate-200/60">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Layout className="w-6 h-6 text-slate-400" />
                            Your Projects
                        </h2>
                        <div className="text-slate-400 text-sm font-medium bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                            {filteredProjects.length} Active
                        </div>
                    </div>

                    {projects.length === 0 ? (
                        <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClipboardPlus size={36} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No projects found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8">You haven't created or joined any projects yet. Start by adding one!</p>
                            <button onClick={() => setIsOpen(true)} className="text-blue-600 font-bold hover:underline">
                                + Create First Project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredProjects.map((p) => (
                                    <ProjectCard
                                        key={p.id}
                                        project={p}
                                        getTypeStyles={getTypeStyles}
                                        navigate={navigate}
                                        handleDelete={handleDelete}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-800">New Project</h3>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Project Title</label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="E.g., AI Research Assistant"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Team Leadership</label>
                                        <div className="space-y-3">
                                            <input type="email" name="supervisorEmail" value={form.supervisorEmail} onChange={handleChange} placeholder="Supervisor Email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm" />
                                            <input type="email" name="mentorEmail" value={form.mentorEmail} onChange={handleChange} placeholder="Mentor Email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Composition</label>
                                        <div className="space-y-3">
                                            <input type="email" name="leaderEmail" value={form.leaderEmail} onChange={handleChange} placeholder="Leader Email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm" />
                                            <input type="text" name="team" value={form.team} onChange={handleChange} placeholder="Members (comma separated)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="What is this project about?"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[100px] text-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-5">
                                    <div className="w-32">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Year</label>
                                        <input name="year" value={form.year} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                                        <select name="type" value={form.type} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium">
                                            <option>Research</option>
                                            <option>Capstone</option>
                                            <option>Community</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform active:scale-95"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
