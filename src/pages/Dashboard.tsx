import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code } from 'lucide-react';
import { motion } from 'framer-motion';
import UserProfile from '../components/UserProfile';
import CourseCard from '../components/CourseCard';
import { courses } from '../data/courses';
import { Course } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleCourseSelect = (course: Course) => {
    // Here you can add any pre-test checks or validations
    navigate('/test');
  };

  return (
    <div className="min-h-screen bg-pattern-chemistry">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Code className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900 font-serif">Rareminds Test Portal</h1>
          </div>
          <UserProfile />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg px-6 py-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-block p-4 bg-white/20 rounded-full mb-6">
              <Code className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-6 font-serif">
              Welcome to Your Test Portal
            </h1>
            <p className="text-lg text-blue-100">
              Select a course below to begin your assessment. Each test is designed to evaluate your understanding of specific topics.
            </p>
          </motion.div>
        </div>

        {/* Courses Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 font-serif">Available Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={handleCourseSelect}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;