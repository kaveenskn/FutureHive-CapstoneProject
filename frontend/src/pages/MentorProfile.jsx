import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../components/Firebase";
import { toast } from "react-toastify";
import { mentorsData } from "./mentorsData";

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [message, setMessage] = useState("");

  // Find mentor by ID
  const mentor = mentorsData.find((m) => m.id === parseInt(id));

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Redirect if mentor not found
  useEffect(() => {
    if (!mentor) {
      toast.error("Mentor not found");
      navigate("/mentor-connect");
    }
  }, [mentor, navigate]);

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
    toast.success(`Mentorship request sent to ${mentor.name}!`);
  };

  const handleScheduleMeeting = () => {
    if (!user) {
      toast.error("Please sign in to schedule meetings");
      navigate("/signin");
      return;
    }
    toast.success("Meeting request sent to mentor!");
  };

  if (!mentor) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            Mentor Not Found
          </div>
          <button
            onClick={() => navigate("/mentor-connect")}
            className="hover:bg-blue-700 px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg"
          >
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="sm:px-6 lg:px-8 max-w-7xl px-4 py-8 mx-auto">
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
          {/* Sidebar - Left Column */}
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

              {/* Availability Badge */}
              <div className="flex justify-center mb-6">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    mentor.availability === "Available"
                      ? "bg-green-100 text-green-800"
                      : mentor.availability === "Limited"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {mentor.availability}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    EXPERIENCE
                  </div>
                  <div className="text-sm text-gray-600">
                    {mentor.experience}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    LANGUAGES
                  </div>
                  <div className="text-sm text-gray-600">
                    {mentor.languages.join(", ")}
                  </div>
                </div>
              </div>

              {/* Project Types */}
              <div className="mb-6">
                <div className="mb-2 text-lg font-bold text-blue-600">
                  PROJECT TYPES
                </div>
                <div className="space-y-2">
                  {mentor.projectTypes.map((type, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></span>
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleRequestMentorship}
                  className="hover:bg-blue-700 w-full px-4 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg"
                >
                  Send Mentorship Request
                </button>
                <button
                  onClick={handleScheduleMeeting}
                  className="hover:bg-gray-50 w-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg"
                >
                  Book 15-min Meeting
                </button>
              </div>

              {/* Contact Information */}
              <div className="pt-4 mt-4 border-t">
                <h3 className="mb-3 font-semibold text-gray-900">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
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
                    className="hover:text-blue-600 flex items-center text-sm text-gray-600"
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
            </div>
          </div>

          {/* Main Content - Right Column */}
          <div className="lg:col-span-3">
            {/* Navigation Tabs */}
            <div className="rounded-2xl mb-6 bg-white shadow-lg">
              <div className="flex overflow-x-auto">
                {[
                  "about",
                  "skills",
                  "publications",
                  "success",
                  "experience",
                  "education",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab === "success" ? "Success Stories" : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="rounded-2xl p-6 mb-6 bg-white shadow-lg">
              {activeTab === "about" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    About
                  </h2>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    {mentor.detailedBio}
                  </p>

                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {mentor.expertise.map((exp, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>

                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Research Interests
                  </h3>
                  <div className="md:grid-cols-2 grid grid-cols-1 gap-2">
                    {mentor.researchInterests.map((interest, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 mr-3 bg-blue-500 rounded-full"></span>
                        <span className="text-gray-700">{interest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "skills" && (
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    Top Skills & Technologies
                  </h2>
                  <div className="md:grid-cols-3 lg:grid-cols-6 grid grid-cols-2 gap-4">
                    {mentor.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 hover:bg-blue-50 p-4 text-center transition-colors rounded-lg"
                      >
                        <div className="font-medium text-gray-900">{skill}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "publications" && (
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    Publications
                  </h2>
                  <div className="space-y-6">
                    {mentor.publications.map((pub, index) => (
                      <div
                        key={index}
                        className="py-2 pl-4 border-l-4 border-blue-500"
                      >
                        <h3 className="font-semibold text-gray-900">
                          {pub.title}
                        </h3>
                        <p className="text-gray-600">
                          {pub.journal} • {pub.year}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "success" && (
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    Past Mentorship Success Stories
                  </h2>
                  <div className="space-y-6">
                    {mentor.successStories.map((story, index) => (
                      <div
                        key={index}
                        className="last:border-b-0 pb-6 border-b border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {story.student}
                          </h3>
                          <span className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
                            {story.year}
                          </span>
                        </div>
                        <p className="mb-2 font-medium text-gray-700">
                          {story.project}
                        </p>
                        <p className="text-gray-600">{story.achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "experience" && (
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
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
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
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
            </div>

            {/* Quick Message Section */}
            <div className="rounded-2xl p-6 bg-white shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Send a Quick Message
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
