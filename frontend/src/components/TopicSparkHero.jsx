import React, { useState } from "react";

const TopicSparkHero = () => {
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

  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="md:text-5xl mb-4 text-4xl font-bold text-gray-900">
            Explore Trending Topics in
          </h1>
          <h1 className="md:text-5xl mb-6 text-4xl font-bold text-blue-600">
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
              <button className="hover:bg-blue-700 p-2 text-white transition-colors bg-blue-600 rounded-lg">
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

        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
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
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-12">
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
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:shadow-md"
                  }`}
                >
                  <span className="font-medium">{topic.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TopicSparkHero;
