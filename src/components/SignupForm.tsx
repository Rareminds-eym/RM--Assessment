import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  BookOpen,
  Hash,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig"; // Firestore import
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

const SignupForm: React.FC = () => {
  const [nmId, setNmId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [username, setUsername] = useState("");
  // const [sem, setSem] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const [teamname, setTeamname] = useState("");
  const [upload, setUpload] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nmId || !email || !password || !teamname) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      console.log(nmId);

      // Check if NM ID exists in Firestore
      // const nmRef = doc(db, "nm-students", nmId);

      try {
        // const nmSnap = await getDoc(nmRef);

        const studentsRef = collection(db, "nm-students");
        const q = query(
          studentsRef,
          where("StudentRollNo", "==", nmId),
          limit(1)
        ); // Query with where and limit(1)
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No student found with this roll number.");
          setError("NM ID not found in records. Please contact the admin.");
          return null;
        }

        const student: any = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        };
        console.log("Fetched Student:", student);
        setNmId(student.NMId);
        setUpload(true);

        // console.log("Firestore Document: ", nmSnap.data()); // Check what’s returned

        // if (!nmSnap.exists()) {
        //   setError("NM ID not found in records. Please contact the admin.");
        //   setIsLoading(false);
        //   return;
        // }

        // Extract Data from Firestore
        // const studentData = nmSnap.data();
        // console.log("Student Data: ", studentData);
      } catch (err: any) {
        console.log("Error fetching Firestore document: ", err);
        setError(err.message || "Failed to create an account");
      } finally {
        setIsLoading(false);
      }

      // await signup(nmId, email, password, username, sem, teamname);
      // setSuccess(
      //   "Account created! Please verify your email before logging in."
      // );

      // Redirect after a short delay
      // setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create an account");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      if (upload) {
        const addRecords = async () => {
          await signup(nmId, email, password, teamname);
          setSuccess(
            "Account created! Please verify your email before logging in."
          );

          setTimeout(() => navigate("/login"), 3000);
        };
        addRecords();
      }
    } catch (err: any) {
      setError(err.message || "Failed to Upload Records");
    } finally {
      setIsLoading(false);
    }
  }, [nmId, upload]);

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
        <p className="mt-2 text-gray-600">Sign up to start your online Hackathon</p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {/* NM ID Input */}
        <div>
          <label
            htmlFor="nmId"
            className="block text-sm font-medium text-gray-700"
          >
            Roll No
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="nmId"
              type="text"
              required
              value={nmId}
              onChange={(e) => setNmId(e.target.value)}
              className="pl-10 block w-full py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="NM123456"
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 block w-full py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 block w-full py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Username Input */}
        {/* <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 block w-full py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Username"
            />
          </div>
        </div> */}

        <div>
          <label
            htmlFor="teamname"
            className="block text-sm font-medium text-gray-700"
          >
            Team Name
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="teamname"
              type="text"
              required
              value={teamname}
              onChange={(e) => setTeamname(e.target.value)}
              className="pl-10 block w-full py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter team Name"
            />
          </div>
        </div>

        {/* Semester Dropdown */}
        {/* <div>
          <label
            htmlFor="sem"
            className="block text-sm font-medium text-gray-700"
          >
            Semester
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="sem"
              required
              value={sem}
              onChange={(e) => setSem(e.target.value)}
              className="pl-10 block w-full py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Semester</option>
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{`Semester ${i + 1}`}</option>
              ))}
            </select>
          </div>
        </div> */}

        {/* Signup Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" /> Sign up
              </>
            )}
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
