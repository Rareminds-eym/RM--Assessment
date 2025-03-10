import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Hash, BookOpen, ArrowLeft, GraduationCap, Users, Fingerprint, Building, Code, Book, School } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentsRef = collection(db, "nm-students");
        const q = query(studentsRef, where("NMId", "==", user.nmId), limit(1)); // Firestore query
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("No students found with this NMId.");
          setLoading(false);
          return;
        }

        const studentsData = querySnapshot.docs.map((doc) => ({
          // id: doc.id,
          ...doc.data(),
        }));
        // console.log(studentsData[0]);
        setStudent(studentsData[0]);
      } catch (error) {
        setError("Error fetching students.");
        console.error("Firestore Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user.nmId) fetchStudents();
  }, [user.nmId]);

  return (
    <div className="min-h-screen bg-pattern-chemistry">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 font-serif">
            Profile Information
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-white font-serif">
                  {user.username}
                </h3>
                <p className="text-sm text-blue-100">Student</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  NM ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.nmId}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Semester
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.sem}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Course
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {student?.CourseName}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Book className="h-4 w-4 mr-2" />
                  Department
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{student?.Branch}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Roll No
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {student?.StudentRollNo}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  College Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{student?.CollegeName}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Code className="h-4 w-4 mr-2" />
                  College Code
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{student?.CollegeCode}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Team Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.teamname}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <School className="h-4 w-4 mr-2" />
                  University Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{student?.UniversityName}</dd>
              </div>
            </dl>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <p className="font-medium text-gray-700">Account Status</p>
              <p className="mt-1 text-gray-600">
                Your account is active and in good standing.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
