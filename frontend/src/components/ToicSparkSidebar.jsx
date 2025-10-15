import React from "react";

const ToicSparkSidebar = () => {
  const menuItems = [
    { icon: "🏠", label: "Dashboard", active: false },
    { icon: "✨", label: "Topic Spark", active: true },
    { icon: "📚", label: "Research Hub", active: false },
    { icon: "💡", label: "Idea Generator", active: false },
    { icon: "👥", label: "Mentors", active: false },
    { icon: "📂", label: "Projects", active: false },
  ];

  return (
    <aside className="w-64 min-h-screen p-6 bg-white border-r border-gray-200">
      <div className="mb-8">
        <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
          FutureHive
        </h2>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              item.active
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default ToicSparkSidebar;
