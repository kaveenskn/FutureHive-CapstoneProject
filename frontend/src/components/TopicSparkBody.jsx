import React, { useState } from "react";

const TopicSparkBody = () => {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");

  const types = [
    { id: "all", label: "All Types" },
    { id: "research", label: "Research" },
    { id: "capstone", label: "Capstone" },
  ];

  const topics = [
    { id: "all", label: "All Topics" },
    { id: "ai", label: "AI & Machine Learning" },
    { id: "blockchain", label: "Blockchain" },
    { id: "sustainability", label: "Sustainability" },
    { id: "data-science", label: "Data Science" },
    { id: "robotics", label: "Robotics" },
    { id: "iot", label: "IoT" },
    { id: "healthcare", label: "Healthcare Tech" },
  ];

  const projects = [
    {
      id: 1,
      type: "Research",
      title: "AI in Healthcare",
      description:
        "Exploring machine learning applications in medical diagnosis, drug discovery, and personalized treatment plans.",
      isHot: false,
      tags: [],
    },
    {
      id: 2,
      type: "Research",
      title: "Sustainable Energy Systems",
      description:
        "Research on renewable energy sources, smart grids, and energy-efficient technologies for a greener future.",
      isHot: false,
      tags: [],
    },
    {
      id: 3,
      type: "Capstone Project",
      title: "Medical Diagnosis Assistant",
      description:
        "Build an AI-powered application that helps diagnose diseases based on symptoms and medical imaging.",
      isHot: true,
      tags: [],
    },
    {
      id: 4,
      type: "Capstone Project",
      title: "Solar Energy Monitoring System",
      description:
        "Create an IoT-based system to monitor and optimize solar panel efficiency in real-time.",
      isHot: false,
      tags: [],
    },
    {
      id: 5,
      type: "Research",
      title: "Blockchain in Supply Chain",
      description:
        "Investigating blockchain technology for transparent and efficient supply chain management.",
      isHot: false,
      tags: [],
    },
    {
      id: 6,
      type: "Capstone Project",
      title: "Smart Home Automation",
      description:
        "Develop a comprehensive IoT system for home automation with energy optimization features.",
      isHot: false,
      tags: [],
    },
    {
      id: 7,
      type: "Research",
      title: "Robotics in Manufacturing",
      description:
        "Advanced robotics applications for automated manufacturing and quality control processes.",
      isHot: false,
      tags: [],
    },
    {
      id: 8,
      type: "Capstone Project",
      title: "Data Analytics Dashboard",
      description:
        "Create an interactive dashboard for business intelligence and data visualization.",
      isHot: true,
      tags: [],
    },
  ];

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="md:text-5xl mb-4 text-4xl font-bold text-gray-900">
            Explore Trending Topics in
          </h1>
          <h1 className="md:text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-6 text-4xl font-bold text-transparent">
            Research & Capstone Projects
          </h1>
          <p className="max-w-3xl mx-auto mb-8 text-xl text-gray-600">
            Discover what's hot in AI, Blockchain, Sustainability, and more.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search research topics and capstone projects..."
              className="rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full px-6 py-4 text-lg transition-all border border-gray-300 shadow-sm outline-none"
            />
            <div className="right-3 top-1/2 absolute transform -translate-y-1/2">
              <button className="hover:bg-blue-600 p-2 text-white transition-colors bg-blue-500 rounded-lg">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mb-8">
          <div className="mb-6">
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-500 uppercase">
              Project Type
            </h3>
            <div className="flex flex-wrap gap-3">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-6 py-3 rounded-lg border transition-all ${
                    selectedType === type.id
                      ? "bg-blue-500 text-white border-blue-500 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-500 uppercase">
              Topics
            </h3>
            <div className="md:grid-cols-3 lg:grid-cols-4 grid grid-cols-2 gap-4">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedTopic === topic.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg transform scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:shadow-md"
                  }`}
                >
                  <span className="font-medium">{topic.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Showing {projects.length} results
          </h2>
        </div>

        <div className="md:grid-cols-3 grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl hover:shadow-md p-6 transition-all duration-300 bg-white border border-gray-200 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.type === "Research"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {project.type}
                  </span>
                  {project.isHot && (
                    <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                      HOT
                    </span>
                  )}
                </div>
                {project.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <h3 className="mb-3 text-xl font-bold text-gray-900">
                {project.title}
              </h3>
              <p className="mb-6 leading-relaxed text-gray-600">
                {project.description}
              </p>

              <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105 w-full px-4 py-3 font-semibold text-white transition-all duration-300 transform rounded-lg">
                Explore Projects
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="hover:text-blue-600 hover:border-blue-600 px-8 py-3 font-semibold text-blue-500 transition-colors bg-white border border-blue-500 rounded-lg">
            Load More Projects
          </button>
        </div>
      </div>
    </main>
  );
};

export default TopicSparkBody;
