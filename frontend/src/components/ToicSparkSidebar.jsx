import React from "react";

const TopicSparkSidebar = () => {
  const topResearchers = [
    {
      initials: "DSC",
      name: "Dr. Sarah Chen",
      field: "AI Research",
      projects: 24,
    },
    {
      initials: "PMR",
      name: "Prof. Michael Ross",
      field: "Quantum Computing",
      projects: 18,
    },
    {
      initials: "DAP",
      name: "Dr. Aisha Patel",
      field: "Biotechnology",
      projects: 31,
    },
    {
      initials: "JL",
      name: "James Liu",
      field: "Renewable Energy",
      projects: 15,
    },
  ];

  const mostViewed = [
    {
      title: "Neural Network Optimization",
      views: "12.5k",
    },
    {
      title: "Sustainable Urban Planning",
      views: "10.2k",
    },
    {
      title: "Blockchain in Healthcare",
      views: "9.8k",
    },
    {
      title: "Computer Vision Applications",
      views: "8.9k",
    },
  ];

  return (
    <aside className="w-80 min-h-screen overflow-y-auto bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Top Researchers
          </h2>
          <div className="space-y-4">
            {topResearchers.map((researcher, index) => (
              <div
                key={index}
                className="bg-gray-50 hover:bg-gray-100 flex items-center justify-between p-3 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center w-10 h-10 text-sm font-semibold text-white rounded-full">
                    {researcher.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {researcher.name}
                    </h3>
                    <p className="text-xs text-gray-500">{researcher.field}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {researcher.projects}
                  </div>
                  <div className="text-xs text-gray-500">projects</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Most Viewed</h2>
          <div className="space-y-3">
            {mostViewed.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 hover:bg-gray-100 flex items-center justify-between p-3 transition-colors rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-medium text-gray-900">
                    {item.title}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-600">
                    {item.views}
                  </div>
                  <div className="text-xs text-gray-500">views</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white">
          <h3 className="mb-2 text-sm font-bold">Research Community</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">1.2k+</div>
              <div className="opacity-90 text-xs">Researchers</div>
            </div>
            <div>
              <div className="text-xl font-bold">4.5k+</div>
              <div className="opacity-90 text-xs">Projects</div>
            </div>
          </div>
          <button className="hover:bg-gray-100 w-full py-2 mt-3 text-xs font-semibold text-blue-600 transition-colors bg-white rounded-lg">
            Join Community
          </button>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
            Trending Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Machine Learning",
              "IoT",
              "Blockchain",
              "Sustainability",
              "Robotics",
              "BioTech",
            ].map((topic, index) => (
              <span
                key={index}
                className="hover:bg-blue-200 px-3 py-1 text-xs font-medium text-blue-600 transition-colors bg-blue-100 rounded-full cursor-pointer"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TopicSparkSidebar;
