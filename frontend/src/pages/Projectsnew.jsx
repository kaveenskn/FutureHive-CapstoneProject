import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClipboardPlus, Flag, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { doc, getDocs, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from "../components/Firebase";

export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        type: 'Research',
        supervisor: '',
        mentor: '',
        leader: '',
        team: ''
    });
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchProjects(currentUser.uid);
            } else {
                setUser(null);
                setProjects([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchProjects = async (UserId) => {
        try {
            const q = collection(db, "users", UserId, "projects");
            const snapshot = await getDocs(q);
            const fetchedProjects = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProjects(fetchedProjects);
        } catch (e) {
            console.error("Error fetching projects", e);
            toast.error("Failed to load projects");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) {
            toast.error("Please log in to add a project");
            return;
        }

        const teamArray = form.team.split(',').map(s => s.trim()).filter(Boolean);

        const newProject = {
            title: form.title,
            description: form.description,
            year: form.year,
            type: form.type,
            supervisor: { name: form.supervisor, uid: null, email: null },
            mentor: { name: form.mentor, uid: null, email: null },
            leader: { name: form.leader, uid: null, email: null },
            team: teamArray,
            createdAt: new Date(),
        };

        try {
            const docRef = await addDoc(collection(db, "users", auth.currentUser.uid, "projects"), newProject);
            setProjects([{ id: docRef.id, ...newProject }, ...projects]);
            toast.success("Project added successfully");
            setIsOpen(false);
            setForm({
                title: '',
                description: '',
                year: new Date().getFullYear(),
                type: 'Research',
                supervisor: '',
                mentor: '',
                leader: '',
                team: ''
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to add project");
        }
    };

    const handleDelete = async (UserId, projectId) => {
        if (!user?.uid) return;
        try {
            const projectRef = doc(db, "users", user.uid, "projects", projectId);
            await deleteDoc(projectRef);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            toast.success("Project deleted successfully!");
        } catch (error) {
            console.error("Error deleting project:", error);
            toast.error("Failed to delete project.");
        }
    };



    const cards = [
        {
            icon: <ClipboardPlus className="w-10 h-10 text-blue-500" />,
            title: "Add Projects",
            description:
                "Create and organize projects effortlessly. Add project details, set start and end dates, and assign team members to keep everything structured.",
        },
        {
            icon: <Flag className="w-10 h-10 text-green-500" />,
            title: "Add Milestones & Tasks",
            description:
                "Break down your project into milestones and specific tasks. Assign deadlines and responsibilities for better tracking and accountability.",
        },
        {
            icon: <BarChart3 className="w-10 h-10 text-purple-500" />,
            title: "Track Progress",
            description:
                "Monitor your project's performance using visual progress bars and insights. Stay on top of milestones and ensure timely completion.",
        },
    ];






    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 text-slate-900">
                <div className="max-w-7xl mx-auto px-6 py-10 ">
                    <header className="mb-6 text-center mt-9">
                        <h1 className="text-5xl font-extrabold">Manage Your <br /><span className='text-blue-600'>Projects</span></h1>
                        <p className="text-slate-600 mt-2 text-xl pt-2">Start a new project or manage your existing ones. Projects are private to your account.</p>
                    </header>




                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto mt-20">
                        {cards.map((card, index) => {
                            const isLast = index === cards.length - 1;
                            const containerClass = isLast
                                ? "p-8 rounded-2xl shadow-lg text-center bg-gradient-to-r from-blue-600 to-sky-500 text-white"
                                : "bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl text-center border border-gray-100";

                            // clone icon to override color when it's the last card
                            const icon = isLast
                                ? React.cloneElement(card.icon, { className: "w-10 h-10 text-white" })
                                : card.icon;

                            const titleClass = isLast ? "text-xl font-semibold text-white mb-3" : "text-xl font-semibold text-gray-800 mb-3";
                            const descClass = isLast ? "text-white text-sm" : "text-gray-600 text-sm";

                            return (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05, rotate: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className={containerClass}
                                >
                                    <div className="flex justify-center mb-4">{icon}</div>
                                    <h3 className={titleClass}>{card.title}</h3>
                                    <p className={descClass}>{card.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>



                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-20">

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col h-full justify-between">
                                <h1>Add Your Projects</h1>
                                <div className="mt-4">
                                    <button onClick={() => setIsOpen(true)} className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-400 text-white rounded-md shadow">Add New Project</button>

                                </div>
                            </div>
                        </div>

                        <section className="lg:col-span-3">
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
                                                <div><strong>Supervisor:</strong> {p.supervisor?.name || '-'}</div>
                                                <div><strong>Mentor:</strong> {p.mentor?.name || '-'}</div>
                                                <div><strong>Leader:</strong> {p.leader?.name || '-'}</div>
                                                <div><strong>Team:</strong> {(p.team || []).join(', ') || '-'}</div>

                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <button onClick={() => navigate(`/projects/${p.id}`)} className="px-3 py-1 border rounded-md text-sm">Open</button>
                                                <button
                                                    onClick={() => deleteProject(user?.uid, p.id)}
                                                    className="px-3 py-1 text-sm text-red-600"
                                                >
                                                    Delete
                                                </button></div>
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
