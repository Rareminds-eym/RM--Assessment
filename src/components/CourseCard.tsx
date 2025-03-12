import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust import path
import { Course } from "../types";
import { useAuth } from "../context/AuthContext"; // Import authentication context

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  const Icon = course.icon;
  const navigate = useNavigate();
  const { user } = useAuth(); // Get logged-in user
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isWithinTime, setIsWithinTime] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  useEffect(() => {
    const checkAssessmentTiming = async () => {
      try {
        const scheduleRef = doc(db, "assessment_settings", "global_timing");
        const scheduleSnap = await getDoc(scheduleRef);

        if (scheduleSnap.exists()) {
          const { startTime, endTime } = scheduleSnap.data();

          // Convert Firestore Timestamp to JavaScript Date
          const start = startTime?.toDate();
          const end = endTime?.toDate();

          setStartTime(start);
          setEndTime(end);

          const currentTime = new Date();
          if (start && end && currentTime >= start && currentTime <= end) {
            setIsWithinTime(true);
          } else {
            setIsWithinTime(false);
          }
        }
      } catch (error) {
        console.error("Error fetching assessment schedule:", error);
      }
    };

    checkAssessmentTiming();
  }, []);

  const handleStartTest = async () => {
    if (!user?.nmId) {
      setError("You must be logged in to start the test.");
      return;
    }

    if (!isWithinTime) {
      setError(
        `Test is scheduled from ${startTime?.toLocaleString()} to ${endTime?.toLocaleString()}`
      );
      return;
    }

    setLoading(true);
    try {
      // Step 1: Check Firestore if nmId already exists in "attempts"
      const attemptsRef = collection(db, "attempts");
      const q = query(attemptsRef, where("nmId", "==", user.nmId), where("courseId", "==", course.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("Test already taken.");
        setLoading(false);
        return;
      }

      // Step 3: If not found, allow test to start
      navigate("/test", { state: { courseId: course.id } });
    } catch (error) {
      console.error("Error checking test attempt:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-600">{course.description}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 flex flex-col items-center">
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartTest}
          disabled={loading || !isWithinTime}
          className={`px-4 py-2 rounded-lg font-medium w-full max-w-xs text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading || !isWithinTime
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          }`}
        >
          {loading ? "Checking..." : isWithinTime ? "Start Assessment" : "Assessment Not Started"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CourseCard;
