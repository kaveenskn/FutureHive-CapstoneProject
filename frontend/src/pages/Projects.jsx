import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClipboardPlus, Flag, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { doc, getDocs, addDoc, deleteDoc, collection, query, where, or } from 'firebase/firestore';
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
        supervisorEmail: '',
        mentorEmail: '',
        leaderEmail: '',
        team: ''
    });
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

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
            toast.error("Failed to load projects.");
        }
    };

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
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <header className="mb-6 text-center mt-9">
                        <h1 className="text-5xl font-extrabold">
                            Manage Your <br />
                            <span className="text-blue-600">Projects</span>
                        </h1>
                        <p className="text-slate-600 mt-2 text-xl pt-2">
                            Start a new project or manage your existing ones. Projects are visible to all members involved.
                        </p>
                    </header>

                    {/* Top feature cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto mt-20">
                        {cards.map((card, index) => {
                            const isLast = index === cards.length - 1;
                            const containerClass = isLast
                                ? "p-8 rounded-2xl shadow-lg text-center bg-gradient-to-r from-blue-600 to-sky-500 text-white"
                                : "bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl text-center border border-gray-100";
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

                    {/* Projects Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-20">
                        {/* Add New Project */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between border border-gray-100 hover:shadow-md transition h-[200px] w-full">
                                <h1 className="text-lg font-semibold">Add Your Projects</h1>
                                <div className="mt-4">
                                    <button
                                        onClick={() => setIsOpen(true)}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-400 text-white rounded-md shadow hover:shadow-lg transition-all duration-300"
                                    >
                                        + Add New Project
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* My Projects */}
                        <section className="lg:col-span-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg text-blue-700">My Projects</h3>
                                <div className="text-sm text-slate-500">{projects.length} Active Project{projects.length !== 1 ? 's' : ''}</div>
                            </div>

                            <div className="space-y-4">
                                {projects.length === 0 && (
                                    <div className="bg-white p-6 rounded-xl shadow-sm text-slate-600 text-center border border-gray-100">
                                        No projects yet — create or join one using your registered email.
                                    </div>
                                )}

                                {projects.map((p) => (
                                    <motion.article
                                        key={p.id}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{p.type}</span>
                                                    <span className="text-xs text-slate-400">{p.year}</span>
                                                </div>
                                                <h4 className="text-xl font-semibold text-slate-800">{p.title}</h4>
                                                <p className="text-sm mb-3 text-slate-700">{p.description}</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                                    <p><strong>Supervisor:</strong> {p.supervisorEmail || '-'}</p>
                                                    <p><strong>Mentor:</strong> {p.mentorEmail || '-'}</p>
                                                    <p><strong>Leader:</strong> {p.leaderEmail || '-'}</p>
                                                    <p><strong>Team:</strong> {(p.team || []).join(', ') || '-'}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/projects/${p.id}`)}
                                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                                                >
                                                    Open
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </motion.article>
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
                        <form onSubmit={handleCreate} className="space-y-3" autoComplete="off">
                            <input name="title" value={form.title} onChange={handleChange} placeholder="Project title" className="w-full px-3 py-2 border rounded-md" required />
                            <input type="email" name="supervisorEmail" value={form.supervisorEmail} onChange={handleChange} placeholder="Supervisor Email" className="w-full px-3 py-2 border rounded-md" />
                            <input type="email" name="mentorEmail" value={form.mentorEmail} onChange={handleChange} placeholder="Mentor Email" className="w-full px-3 py-2 border rounded-md" />
                            <input type="email" name="leaderEmail" value={form.leaderEmail} onChange={handleChange} placeholder="Team Leader Email" className="w-full px-3 py-2 border rounded-md" />
                            <input type="text" name="team" value={form.team} onChange={handleChange} placeholder="Team members emails (comma separated)" className="w-full px-3 py-2 border rounded-md" />
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
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded-md">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-400 text-white rounded-md">
                                    Add Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
