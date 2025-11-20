import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../components/Firebase";
import { toast } from "react-toastify";

const MentorConnect = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    researchArea: "All Areas",
    projectType: "All Types",
    experienceLevel: "All Levels",
    availability: "Any",
    language: "English",
  });

  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);

  const researchAreas = [
    "All Areas",
    "AI",
    "Machine Learning",
    "Software Engineering",
    "Cybersecurity",
    "Data Science",
    "IoT",
    "Networking",
  ];

  const projectTypes = [
    "All Types",
    "Capstone",
    "Industry Research",
    "Academic Research",
    "Publication Support",
  ];

  const experienceLevels = ["All Levels", "1-3 years", "3-5 years", "5+ years"];

  const availabilityOptions = ["Any", "Available", "Limited", "Not Available"];

  const languages = ["Sinhala", "Tamil", "English"];

  // Sample mentor data based on your screenshots
  const sampleMentors = [
    {
      id: 1,
      name: "Dr. Amara Silva",
      title: "Senior Lecturer",
      organization: "University of Colombo",
      expertise: ["AI", "Machine Learning", "Data Science"],
      bio: "Specialized in machine learning and artificial intelligence with a focus on natural language processing and computer vision. Published multiple papers in top-tier conferences and journals.",
      experience: "5+ years",
      availability: "Available",
      rating: 4.9,
      projects: 24,
      responseTime: "2-4 hours",
      languages: ["English", "Sinhala"],
      image: "/api/placeholder/100/100",
    },
    {
      id: 2,
      name: "Prof. Rajesh Kumar",
      title: "Professor of Computer Science",
      organization: "University of Moratuwa",
      expertise: ["Cybersecurity"],
      bio: "Leading expert in cybersecurity and network protocols, industry consultant for major tech firms with extensive experience in IoT security and network infrastructure protection.",
      experience: "5+ years",
      availability: "Limited",
      rating: 4.8,
      projects: 18,
      responseTime: "1-2 days",
      languages: ["English", "Tamil"],
      image: "/api/placeholder/100/100",
    },
    {
      id: 3,
      name: "Dr. Nimesha Jayasinghe",
      title: "Research Engineer",
      organization: "Tech Solutions Lanka",
      expertise: ["Software Engineering"],
      bio: "Industry researcher focused on practical applications of machine learning in software development. Experienced in agile methodologies and DevOps practices.",
      experience: "3-5 years",
      availability: "Available",
      rating: 4.7,
      projects: 15,
      responseTime: "Same day",
      languages: ["English", "Sinhala"],
      image: "/api/placeholder/100/100",
    },
    {
      id: 4,
      name: "Dr. Mohamed Ismail",
      title: "Associate Professor",
      organization: "SLIIT",
      expertise: ["AI", "IoT", "Data Science"],
      bio: "Expert in artificial intelligence applications for IoT ecosystems. Published author with extensive experience supervising graduate research projects.",
      experience: "5+ years",
      availability: "Available",
      rating: 4.9,
      projects: 22,
      responseTime: "2-4 hours",
      languages: ["English", "Tamil"],
      image: "/api/placeholder/100/100",
    },
    {
      id: 5,
      name: "Ms. Samantha Perera",
      title: "Senior Data Scientist",
      organization: "DataCorp International",
      expertise: ["Data Science"],
      bio: "Data science practitioner with strong background in predictive analytics and business intelligence. Mentor for aspiring data scientists and analytics professionals.",
      experience: "3-5 years",
      availability: "Limited",
      rating: 4.6,
      projects: 12,
      responseTime: "3-5 days",
      languages: ["English", "Sinhala"],
      image: "/api/placeholder/100/100",
    },
    {
      id: 6,
      name: "Dr. Lakshmi Nadarajan",
      title: "Head of AI Research",
      organization: "Innovation Labs",
      expertise: ["AI", "Machine Learning", "Software Engineering"],
      bio: "Leading AI researcher with focus on ethical AI and responsible machine learning. Former academic turned industry leader with extensive publication record.",
      experience: "5+ years",
      availability: "Limited",
      rating: 4.9,
      projects: 31,
      responseTime: "1 week",
      languages: ["English", "Tamil"],
      image: "/api/placeholder/100/100",
    },
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setMentors(sampleMentors);
    setFilteredMentors(sampleMentors);
  }, []);

  useEffect(() => {
    let results = mentors;

    // Search filter
    if (searchQuery) {
      results = results.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mentor.organization
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          mentor.expertise.some((exp) =>
            exp.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Research area filter
    if (filters.researchArea !== "All Areas") {
      results = results.filter((mentor) =>
        mentor.expertise.includes(filters.researchArea)
      );
    }

    // Experience level filter
    if (filters.experienceLevel !== "All Levels") {
      results = results.filter((mentor) => {
        if (filters.experienceLevel === "1-3 years")
          return mentor.experience === "1-3 years";
        if (filters.experienceLevel === "3-5 years")
          return mentor.experience === "3-5 years";
        if (filters.experienceLevel === "5+ years")
          return mentor.experience === "5+ years";
        return true;
      });
    }

    // Availability filter
    if (filters.availability !== "Any") {
      results = results.filter(
        (mentor) =>
          mentor.availability.toLowerCase() ===
          filters.availability.toLowerCase()
      );
    }

    // Language filter
    if (filters.language) {
      results = results.filter((mentor) =>
        mentor.languages.includes(filters.language)
      );
    }

    setFilteredMentors(results);
  }, [searchQuery, filters, mentors]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleRequestMentorship = (mentor) => {
    if (!user) {
      toast.error("Please sign in to request mentorship");
      setTimeout(() => navigate("/signin"), 1000);
      return;
    }
    toast.success(`Mentorship request sent to ${mentor.name}`);
  };

  const handleViewProfile = (mentorId) => {
    navigate(`/mentor-profile/${mentorId}`);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl sm:px-6 lg:px-8 px-4 py-8 mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="md:text-5xl mb-4 text-4xl font-bold text-gray-900">
            Find Research Mentors & Advisors
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-600">
            Connect with mentors who can guide your capstone, research paper, or
            innovation project.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, organization, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full px-6 py-4 text-lg border border-gray-300 shadow-sm"
            />
            <div className="right-3 top-1/2 absolute transform -translate-y-1/2">
              <button className="hover:bg-blue-700 p-2 text-white bg-blue-600 rounded-lg">
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

        {/* Filters Section */}
        <div className="rounded-2xl p-6 mb-8 bg-white shadow-lg">
          <div className="md:grid-cols-2 lg:grid-cols-5 grid grid-cols-1 gap-6">
            {/* Research Area Filter */}
            <div>
              <label className="block mb-3 text-sm font-semibold text-gray-700">
                RESEARCH AREA
              </label>
              <div className="flex flex-wrap gap-2">
                {researchAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => handleFilterChange("researchArea", area)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      filters.researchArea === area
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Type Filter */}
            <div>
              <label className="block mb-3 text-sm font-semibold text-gray-700">
                PROJECT TYPE
              </label>
              <div className="flex flex-wrap gap-2">
                {projectTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange("projectType", type)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      filters.projectType === type
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div>
              <label className="block mb-3 text-sm font-semibold text-gray-700">
                EXPERIENCE LEVEL
              </label>
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleFilterChange("experienceLevel", level)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      filters.experienceLevel === level
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block mb-3 text-sm font-semibold text-gray-700">
                AVAILABILITY
              </label>
              <div className="flex flex-wrap gap-2">
                {availabilityOptions.map((availability) => (
                  <button
                    key={availability}
                    onClick={() =>
                      handleFilterChange("availability", availability)
                    }
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      filters.availability === availability
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                    }`}
                  >
                    {availability}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block mb-3 text-sm font-semibold text-gray-700">
                LANGUAGE
              </label>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <button
                    key={language}
                    onClick={() => handleFilterChange("language", language)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      filters.language === language
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Mentors
          </h2>
          <span className="text-gray-600">
            {filteredMentors.length} mentors found
          </span>
        </div>

        {/* Mentors Grid */}
        <div className="md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-6 mb-12">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="rounded-2xl hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100 shadow-lg"
            >
              <div className="p-6">
                {/* Mentor Header */}
                <div className="flex items-start mb-4 space-x-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full">
                    <span className="text-lg font-bold text-blue-600">
                      {mentor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {mentor.name}
                    </h3>
                    <p className="text-sm text-gray-600">{mentor.title}</p>
                    <p className="text-sm text-gray-500">
                      {mentor.organization}
                    </p>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.expertise.map((exp, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full"
                    >
                      {exp}
                    </span>
                  ))}
                </div>

                {/* Bio */}
                <p className="line-clamp-3 mb-4 text-sm text-gray-600">
                  {mentor.bio}
                </p>

                {/* Experience and Availability */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    <strong>Experience:</strong> {mentor.experience}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
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

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleViewProfile(mentor.id)}
                    className="hover:bg-gray-50 flex-1 px-4 py-2 font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleRequestMentorship(mentor)}
                    className="hover:bg-blue-700 flex-1 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg"
                  >
                    Request Mentorship
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMentors.length === 0 && (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              No mentors found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* Stats Section */}
        <div className="rounded-2xl p-8 bg-white shadow-lg">
          <div className="md:grid-cols-4 grid grid-cols-1 gap-8 text-center">
            <div>
              <div className="mb-2 text-3xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600">Expert Mentors</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Projects Guided</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-blue-600">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorConnect;
