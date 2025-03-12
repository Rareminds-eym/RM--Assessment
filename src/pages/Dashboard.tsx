import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code } from "lucide-react";
import { motion } from "framer-motion";
import UserProfile from "../components/UserProfile";
import CourseCard from "../components/CourseCard";
import { courses } from "../data/courses";
import { Course } from "../types";
import { fetchStudentById } from "../composables/helpers";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>();
  const [loadCourse, setLoadCourse] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.nmId) {
        const data = await fetchStudentById(user.nmId);
        if (data) {
          setUserData(data);
          setLoadCourse(true);
        }
      }
    };
    fetchData();
  }, [user?.nmId]);

  useEffect(() => {
    const fetchStartTime = async () => {
      try {
        const settingsRef = doc(db, "assessment_settings","global_timing" );
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const { startTime } = settingsSnap.data();
          console.log("Fetched startTime from Firestore:", startTime);

          if (startTime instanceof Timestamp) {
            const startDate = startTime.toDate(); // Convert Firestore Timestamp to JS Date
            console.log("Converted startDate:", startDate);

            updateCountdown(startDate);
            const interval = setInterval(() => updateCountdown(startDate), 1000);
            return () => clearInterval(interval);
          } else {
            console.error("Invalid startTime format:", startTime);
          }
        } else {
          console.error("No startTime found in Firestore!");
        }
      } catch (error) {
        console.error("Error fetching startTime:", error);
      }
    };

    fetchStartTime();
  }, []);

  const updateCountdown = (startDate: Date) => {
    const now = new Date();
    const diff = startDate.getTime() - now.getTime();

    if (diff <= 0) {
      setTestStarted(true);
      setCountdown(null);
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }
  };

  return (
    <div className="min-h-screen bg-pattern-chemistry">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/bulb.png" className="h-14 text-blue-600 mr-3" alt="Rareminds" />
            <h1 className="text-xl font-bold text-gray-900 font-serif">
              Rareminds Hackathon Portal
            </h1>
          </div>
          <UserProfile />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg px-6 py-12 mb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-block p-4 bg-white/20 rounded-full mb-6">
              <Code className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-6 font-serif">
              Welcome to Your Hackathon Portal
            </h1>
            <p className="text-lg text-blue-100">
              Select a course below to begin your assessment.
            </p>
          </motion.div>
        </div>

        {/* Countdown Timer */}
        <div className="text-center mb-8">
          {testStarted ? (
            <h2 className="text-2xl font-bold text-green-600">✅ Test has started!</h2>
          ) : countdown ? (
            <h2 className="text-2xl font-bold text-gray-900">
              ⏳ Test starts in: <span className="text-blue-600">{countdown}</span>
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-red-600">⚠️ Unable to fetch test start time!</h2>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 font-serif">
            Available Hackathons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadCourse &&
              courses.map(
                (course) =>
                  userData?.CourseID == course.courseId && (
                    <CourseCard key={course.id} course={course} onSelect={() => navigate("/test")} />
                  )
              )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
