import React from "react";
import TopicSparkHero from "../components/TopicSparkHero";
import TopicSparkSidebar from "../components/ToicSparkSidebar";

const TopicSpark = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex">
        <TopicSparkSidebar />
        <TopicSparkHero />
      </div>
    </div>
  );
};

export default TopicSpark;
