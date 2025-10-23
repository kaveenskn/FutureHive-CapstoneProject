import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

const ResearchHub = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl ">
        <div className="rounded-2xl md:p-12 lg:p-16 p-8">
          <div className="mb-12 text-center">
            <h1 className="md:text-4xl lg:text-5xl mb-6 text-4xl font-extrabold leading-tight text-gray-800">
              Discover, Explore, and
              <br />
              <span className="text-blue-600">Innovate</span> 
              <br />
            </h1>

            <p className="md:text-xl max-w-3xl mx-auto text-lg leading-relaxed text-gray-600">
              Access past university projects, explore trending topics, and find
              inspiration for your next research idea.
            </p>
          </div>

          <div className="sm:flex-row flex flex-col items-center justify-center gap-4">
            <button
              onClick={() => navigate("/research")} /* adjust path if your route differs */
              className="hover:bg-blue-700 hover:scale-105 hover:shadow-xl sm:w-auto w-full px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-blue-600 rounded-lg shadow-lg"
            >
              View Past Researches
            </button>

            <button
              onClick={() => navigate("/topicspark")} /* adjust path if your route differs */
              className="hover:bg-blue-600 hover:text-white hover:scale-105 sm:w-auto w-full px-8 py-4 text-lg font-semibold text-blue-600 transition-all duration-300 transform border-2 border-blue-600 rounded-lg"
            >
              Explore Trending Topics
            </button>
          </div>  
        </div>

         {/* Informational cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              onClick={() => navigate('/research')}
              className="cursor-pointer bg-gradient-to-r from-white to-blue-50 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-2xl font-bold text-blue-700 mb-2">Past Papers Search</h3>
                <p className="text-gray-600">Search and browse previous university research papers and project reports. Filter by year, type, and university to find inspiration quickly.</p>
              </div>
              <div className="mt-4 self-end">
                <span className="inline-block px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold shadow">Search Papers</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              onClick={() => navigate('/topicspark')}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-sky-400 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition text-white flex flex-col justify-between"
            >
              <div>
                <h3 className="text-2xl font-bold mb-2">Explore Trending Topics</h3>
                <p className="text-white/90">Discover trending research topics and emerging project ideas curated from recent submissions and community activity.</p>
              </div>
              <div className="mt-4 self-end">
                <span className="inline-block px-3 py-2 bg-white/20 text-white rounded-lg font-semibold shadow">Explore Topics</span>
              </div>
            </motion.div>
          </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Join thousands of students and researchers in our growing community
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResearchHub;
