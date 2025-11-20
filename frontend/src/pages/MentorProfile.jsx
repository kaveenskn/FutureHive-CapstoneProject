import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../components/Firebase";
import { toast } from "react-toastify";

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");

  // Sample mentor data - in real app, fetch by ID from API
  const mentor = {
    id: 1,
    name: "Dr. Amara Silva",
    title: "Senior Lecturer",
    organization: "University of Colombo",
    department: "Department of Computer Science",
    expertise: ["AI", "Machine Learning", "Data Science"],
    bio: "Specialized in machine learning and artificial intelligence with a focus on natural language processing and computer vision. Published multiple papers in top-tier conferences and journals including IEEE Transactions and ACM conferences. Extensive experience in supervising undergraduate and graduate research projects.",
    experience: "5+ years",
    availability: "Available",
    rating: 4.9,
    projects: 24,
    responseTime: "2-4 hours",
    languages: ["English", "Sinhala"],
    email: "amara.silva@cmb.ac.lk",
    linkedin: "https://linkedin.com/in/amarasilva",
    education: [
      {
        degree: "PhD in Computer Science",
        institution: "University of Melbourne, Australia",
        year: "2018",
      },
      {
        degree: "MSc in Artificial Intelligence",
        institution: "University of Moratuwa, Sri Lanka",
        year: "2014",
      },
      {
        degree: "BSc in Computer Science",
        institution: "University of Colombo, Sri Lanka",
        year: "2012",
      },
    ],
    experienceHistory: [
      {
        position: "Senior Lecturer",
        organization: "University of Colombo",
        period: "2019 - Present",
        description:
          "Teaching machine learning and AI courses. Supervising research projects and mentoring students.",
      },
      {
        position: "Research Scientist",
        organization: "AI Research Lab",
        period: "2018 - 2019",
        description:
          "Conducted research in natural language processing and computer vision applications.",
      },
      {
        position: "Visiting Researcher",
        organization: "Stanford AI Lab",
        period: "2017",
        description: "Collaborated on deep learning research projects.",
      },
    ],
    areasOfInterest: [
      "Natural Language Processing",
      "Computer Vision",
      "Deep Learning",
      "AI Ethics",
      "Machine Learning Applications",
    ],
    publications: [
      "Silva, A. et al. (2023). 'Advanced NLP Techniques for Low-Resource Languages'. IEEE Transactions",
      "Silva, A. & Perera, R. (2022). 'Computer Vision in Medical Imaging'. ACM Journal",
      "Silva, A. (2021). 'Machine Learning Fundamentals'. Springer Publications",
    ],
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const handleSendMessage = () => {
    if (!user) {
      toast.error("Please sign in to send messages");
      navigate("/signin");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    toast.success("Message sent to mentor!");
    setMessage("");
  };

  const handleRequestMentorship = () => {
    if (!user) {
      toast.error("Please sign in to request mentorship");
      navigate("/signin");
      return;
    }

    toast.success("Mentorship request sent!");
  };

  const handleScheduleMeeting = () => {
    if (!user) {
      toast.error("Please sign in to schedule meetings");
      navigate("/signin");
      return;
    }

    toast.success("Meeting request sent to mentor!");
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="sm:px-6 lg:px-8 max-w-6xl px-4 py-8 mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/mentor-connect")}
          className="hover:text-gray-900 flex items-center mb-6 text-gray-600"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Mentors
        </button>

        <div className="lg:grid-cols-4 grid grid-cols-1 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl top-8 sticky p-6 bg-white shadow-lg">
              {/* Mentor Photo */}
              <div className="flex items-center justify-center w-32 h-32 mx-auto mb-4 bg-blue-100 rounded-full">
                <span className="text-2xl font-bold text-blue-600">
                  {mentor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>

              <h1 className="mb-2 text-2xl font-bold text-center text-gray-900">
                {mentor.name}
              </h1>
              <p className="mb-1 text-center text-gray-600">{mentor.title}</p>
              <p className="mb-4 text-sm text-center text-gray-500">
                {mentor.organization}
              </p>

              {/* Rating and Response Time */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center">
                  <span className="text-lg text-yellow-500">★</span>
                  <span className="ml-1 font-semibold text-gray-700">
                    {mentor.rating}
                  </span>
                </div>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-600">
                  {mentor.responseTime} response
                </span>
              </div>

              {/* Availability Badge */}
              <div className="flex justify-center mb-6">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    mentor.availability === "Available"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {mentor.availability}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleRequestMentorship}
                  className="hover:bg-blue-700 w-full py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg"
                >
                  Request Mentorship
                </button>

                <button
                  onClick={handleScheduleMeeting}
                  className="hover:bg-blue-50 w-full py-3 font-medium text-blue-600 transition-colors bg-white border border-blue-600 rounded-lg"
                >
                  Schedule Meeting
                </button>
              </div>

              {/* Contact Information */}
              <div className="pt-4 mt-4 border-t">
                <h3 className="mb-3 font-semibold text-gray-900">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {mentor.email}
                  </div>
                  <a
                    href={mentor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 flex items-center text-gray-600"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn Profile
                  </a>
                </div>
              </div>

              {/* Languages */}
              <div className="pt-4 mt-4 border-t">
                <h3 className="mb-2 font-semibold text-gray-900">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.languages.map((language, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Navigation Tabs */}
            <div className="rounded-2xl mb-6 bg-white shadow-lg">
              <div className="flex overflow-x-auto">
                {[
                  "overview",
                  "experience",
                  "education",
                  "publications",
                  "reviews",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSection(tab)}
                    className={`flex-1 py-4 px-6 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="rounded-2xl p-6 mb-6 bg-white shadow-lg">
              {activeTab === "overview" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Professional Overview
                  </h2>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    {mentor.bio}
                  </p>

                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Areas of Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {mentor.expertise.map((exp, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Research Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.areasOfInterest.map((interest, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "experience" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Professional Experience
                  </h2>
                  <div className="space-y-6">
                    {mentor.experienceHistory.map((exp, index) => (
                      <div
                        key={index}
                        className="pl-4 border-l-2 border-blue-500"
                      >
                        <h3 className="text-lg font-semibold text-gray-900">
                          {exp.position}
                        </h3>
                        <p className="font-medium text-gray-600">
                          {exp.organization} • {exp.period}
                        </p>
                        <p className="mt-2 text-gray-600">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "education" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Education
                  </h2>
                  <div className="space-y-4">
                    {mentor.education.map((edu, index) => (
                      <div
                        key={index}
                        className="last:border-b-0 flex items-start justify-between pb-4 border-b border-gray-100"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {edu.degree}
                          </h3>
                          <p className="text-gray-600">{edu.institution}</p>
                        </div>
                        <span className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
                          {edu.year}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "publications" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Selected Publications
                  </h2>
                  <div className="space-y-4">
                    {mentor.publications.map((pub, index) => (
                      <div
                        key={index}
                        className="last:border-b-0 pb-4 border-b border-gray-100"
                      >
                        <p className="text-gray-700">{pub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Student Reviews
                  </h2>
                  <div className="py-8 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      No reviews yet. Be the first to review this mentor!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Message Section */}
            <div className="rounded-2xl p-6 bg-white shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Send a Message
              </h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and mention what you'd like to discuss..."
                className="focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg"
                rows="4"
              />
              <button
                onClick={handleSendMessage}
                className="hover:bg-blue-700 px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
