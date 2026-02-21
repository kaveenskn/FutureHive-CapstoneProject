import React from "react";

const MentorManagementSection = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-900">Mentor Management</h3>
      <p className="mt-2 text-sm text-gray-600">
        Mentor management tools are not configured yet.
      </p>
    </div>
  );
};

export default MentorManagementSection;
import React, { useMemo, useState } from "react";

export default function MentorManagementSection() {
  const [applications, setApplications] = useState([
    {
      id: "app-1",
      name: "Ayesha Khan",
      email: "ayesha.khan@example.com",
      expertise: ["Machine Learning", "Data Mining"],
      experience: 3,
      linkedin: "https://www.linkedin.com/",
      appliedAt: "2025-12-01",
    },
    {
      id: "app-2",
      name: "Michael Perera",
      email: "michael.perera@example.com",
      expertise: ["Full Stack", "System Design"],
      experience: 5,
      linkedin: "https://www.linkedin.com/",
      appliedAt: "2025-12-07",
    },
    {
      id: "app-3",
      name: "Nimal Fernando",
      email: "nimal.fernando@example.com",
      expertise: ["Cybersecurity", "Network Security"],
      experience: 6,
      linkedin: "https://www.linkedin.com/",
      appliedAt: "2025-12-10",
    },
    {
      id: "app-4",
      name: "Isuri Jayasinghe",
      email: "isuri.j@example.com",
      expertise: ["UI/UX", "Product Design"],
      experience: 4,
      linkedin: "https://www.linkedin.com/",
      appliedAt: "2025-12-11",
    },
    {
      id: "app-5",
      name: "Kavindu Silva",
      email: "kavindu.silva@example.com",
      expertise: ["Data Science", "Visualization"],
      experience: 2,
      linkedin: "https://www.linkedin.com/",
      appliedAt: "2025-12-12",
    },
    {
      id: "app-6",
      name: "Anika Peris",
      email: "anika.peris@example.com",
      expertise: ["Cloud", "DevOps"],
      experience: 7,
      linkedin: "https://www.linkedin.com/",
      appliedAt: "2025-12-13",
    },
    {
      id: "app-7",
      name: "Rohan Wickramasinghe",
      email: "rohan.w@example.com",
      expertise: ["Mobile Development", "Flutter"],
      experience: 5,
      linkedin: "https://www.linkedin.com/",
      appliedAt: "2025-12-14",
    },
    {
      id: "app-8",
      name: "Fathima Ali",
      email: "fathima.ali@example.com",
      expertise: ["NLP", "LLMs"],
      experience: 3,
      linkedin: "https://www.linkedin.com/",
      appliedAt: "2025-12-15",
    },
    {
      id: "app-9",
      name: "Harshana De Soysa",
      email: "harshana.ds@example.com",
      expertise: ["Backend", "APIs"],
      experience: 4,
      linkedin: "https://www.linkedin.com/",
      appliedAt: "2025-12-16",
    },
    {
      id: "app-10",
      name: "Dinithi Rathnayake",
      email: "dinithi.r@example.com",
      expertise: ["Project Management", "Agile"],
      experience: 6,
      linkedin: "https://www.linkedin.com/",
      appliedAt: "2025-12-17",
    },
  ]);

  const [mentors, setMentors] = useState([
    {
      id: "m-1",
      name: "Dr. Sarah Chen",
      email: "sarah.chen@example.com",
      expertise: ["AI", "Healthcare"],
      experience: 8,
      linkedin: "https://www.linkedin.com/",
      status: "active",
      joinedAt: "2025-10-10",
    },
    {
      id: "m-2",
      name: "Prof. Michael Kumar",
      email: "michael.kumar@example.com",
      expertise: ["Quantum Computing"],
      experience: 12,
      linkedin: "https://www.linkedin.com/",
      status: "suspended",
      joinedAt: "2025-09-21",
    },
    {
      id: "m-3",
      name: "Amara Perera",
      email: "amara.perera@example.com",
      expertise: ["Web Development", "React"],
      experience: 6,
      linkedin: "https://www.linkedin.com/",
      status: "active",
      joinedAt: "2025-08-18",
    },
    {
      id: "m-4",
      name: "Sanjaya Gunasekara",
      email: "sanjaya.g@example.com",
      expertise: ["Data Engineering", "ETL"],
      experience: 9,
      linkedin: "https://www.linkedin.com/",
      status: "active",
      joinedAt: "2025-07-02",
    },
    {
      id: "m-5",
      name: "Chathura Silva",
      email: "chathura.silva@example.com",
      expertise: ["Cybersecurity", "Threat Modeling"],
      experience: 10,
      linkedin: "https://www.linkedin.com/",
      status: "active",
      joinedAt: "2025-06-14",
    },
    {
      id: "m-6",
      name: "Nadeesha Wijeratne",
      email: "nadeesha.w@example.com",
      expertise: ["UI/UX", "Design Systems"],
      experience: 7,
      linkedin: "https://www.linkedin.com/",
      status: "active",
      joinedAt: "2025-05-09",
    },
    {
      id: "m-7",
      name: "Kasun Jayawardena",
      email: "kasun.j@example.com",
      expertise: ["Cloud", "AWS"],
      experience: 11,
      linkedin: "https://www.linkedin.com/",
      status: "suspended",
      joinedAt: "2025-04-20",
    },
    {
      id: "m-8",
      name: "Tharindu Abeysekera",
      email: "tharindu.a@example.com",
      expertise: ["Mobile", "Android"],
      experience: 8,
      linkedin: "https://www.linkedin.com/",
      status: "active",
      joinedAt: "2025-03-12",
    },
    {
      id: "m-9",
      name: "Hiruni Karunaratne",
      email: "hiruni.k@example.com",
      expertise: ["NLP", "Information Retrieval"],
      experience: 5,
      linkedin: "https://www.linkedin.com/",
      status: "active",
      joinedAt: "2025-02-01",
    },
    {
      id: "m-10",
      name: "Ishara Rajapaksha",
      email: "ishara.r@example.com",
      expertise: ["Backend", "Databases"],
      experience: 9,
      linkedin: "https://www.linkedin.com/",
      status: "active",
      joinedAt: "2025-01-22",
    },
    {
      id: "m-11",
      name: "Farzan Ahmed",
      email: "farzan.ahmed@example.com",
      expertise: ["DevOps", "CI/CD"],
      experience: 8,
      linkedin: "https://www.linkedin.com/",
      status: "active",
      joinedAt: "2024-12-15",
    },
    {
      id: "m-12",
      name: "Shalini Peris",
      email: "shalini.peris@example.com",
      expertise: ["Project Management", "Agile"],
      experience: 13,
      linkedin: "https://www.linkedin.com/",
      status: "active",
      joinedAt: "2024-11-03",
    },
  ]);

  const pendingCount = applications.length;
  const activeCount = useMemo(
    () => mentors.filter((m) => m.status === "active").length,
    [mentors]
  );

  function approveApplication(app) {
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    setMentors((prev) => [
      {
        id: `m-${Date.now()}`,
        name: app.name,
        email: app.email,
        expertise: app.expertise || [],
        experience: app.experience || 0,
        linkedin: app.linkedin || "https://www.linkedin.com/",
        status: "active",
        joinedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  }

  function rejectApplication(app) {
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
  }

  function toggleSuspend(mentorId) {
    setMentors((prev) =>
      prev.map((m) =>
        m.id !== mentorId
          ? m
          : { ...m, status: m.status === "suspended" ? "active" : "suspended" }
      )
    );
  }

  function removeMentor(mentorId) {
    setMentors((prev) => prev.filter((m) => m.id !== mentorId));
  }

  return (
    <div className="flex-1">
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Mentors Managing
              </h2>
              <p className="mt-1 text-gray-600">
                Review mentor applications and manage current mentors
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Pending: <span className="ml-1 font-semibold">{pendingCount}</span>
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active: <span className="ml-1 font-semibold">{activeCount}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8 bg-gray-50">
          {/* Mentor Applications */}
          <section className="bg-white rounded-2xl border border-blue-100 shadow-md shadow-blue-200/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-blue-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-blue-700">
                Mentor Applications
              </h3>
              <span className="text-sm text-slate-500">Approve or reject</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Applicant
                    </th>
                    <th className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Expertise
                    </th>
                    <th className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Experience
                    </th>
                    <th className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Applied
                    </th>
                    <th className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center">
                        <div className="text-gray-600">No applications right now.</div>
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {app.name}
                          </div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <a
                              href={app.linkedin || "https://www.linkedin.com/"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            >
                              LinkedIn
                            </a>
                            <a
                              href={app.email ? `mailto:${app.email}` : "mailto:"}
                              className="text-xs px-2 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100"
                            >
                              Email
                            </a>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-700">
                            {(app.expertise || []).join(", ") || "-"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-700">
                            {app.experience ?? 0} yrs
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-700">
                            {app.appliedAt || "-"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => approveApplication(app)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectApplication(app)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Current Mentors */}
          <section className="bg-white rounded-2xl border border-blue-100 shadow-md shadow-blue-200/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-blue-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-blue-700">Current Mentors</h3>
              <span className="text-sm text-slate-500">Suspend or remove</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Mentor
                    </th>
                    <th className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Expertise
                    </th>
                    <th className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mentors.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center">
                        <div className="text-gray-600">No mentors available.</div>
                      </td>
                    </tr>
                  ) : (
                    mentors.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {m.name}
                          </div>
                          <div className="text-sm text-gray-500">{m.email}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <a
                              href={m.linkedin || "https://www.linkedin.com/"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            >
                              LinkedIn
                            </a>
                            <a
                              href={m.email ? `mailto:${m.email}` : "mailto:"}
                              className="text-xs px-2 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100"
                            >
                              Email
                            </a>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-700">
                            {(m.expertise || []).join(", ") || "-"}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {m.experience ?? 0} yrs
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              m.status === "suspended"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSuspend(m.id)}
                              className={`px-3 py-1.5 rounded-lg text-white ${
                                m.status === "suspended"
                                  ? "bg-emerald-600 hover:bg-emerald-700"
                                  : "bg-amber-600 hover:bg-amber-700"
                              }`}
                            >
                              {m.status === "suspended" ? "Unsuspend" : "Suspend"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMentor(m.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
