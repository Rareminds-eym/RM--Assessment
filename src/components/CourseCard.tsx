import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  const Icon = course.icon;
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate('/test', { state: { courseId: course.id } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 font-serif">{course.title}</h3>
            <p className="text-xs text-gray-600">Course ID: {course.courseId}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-gray-600">
            {course.description}
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartTest}
          className="px-4 py-2 rounded-lg font-medium w-full max-w-xs bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start Hackathon
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CourseCard;