import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Hash,
  UserPlus,
  Users,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import ProfileInfo from "./ProfileInfo";
import { Toaster, toast } from "react-hot-toast";

const SignupForm: React.FC = () => {
  const [nmId, setNmId] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [viewPassword, setViewPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const [teamname, setTeamname] = useState("");
  const [upload, setUpload] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<any>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const scrollErrorRef = () => {
    errorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollSuccessRef = () => {
    successRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!rollNo || !email || !password || !teamname || !rePassword || !phone) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      scrollErrorRef();
      setIsLoading(false);
      return;
    }

    if (password != rePassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      scrollErrorRef();
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      try {
        const studentsRef = collection(db, "nm-students");
        const q = query(
          studentsRef,
          where("StudentRollNo", "==", rollNo),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError(
            "Roll number not found in records. Please contact the admin."
          );
          toast.error("Roll number not found in records");
          return null;
        }

        const student: any = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        };
        console.log("Fetched Student:", student);

        setStudentData(student);
        setNmId(student.NMId);
        setShowInfo(true);
      } catch (err: any) {
        console.log("Error fetching Firestore document: ", err);
        setError(err.message || "Failed to create an account");
        toast.error(err.message || "Failed to create an account");
      } finally {
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create an account");
      toast.error(err.message || "Failed to create an account");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      if (upload) {
        // console.log("upload", upload);
        const addRecords = async () => {
          await signup(nmId, email, password, teamname)
            .then(() => {
              setSuccess(
                "Account created! Please verify your email before logging in."
              );
              toast.success("Account created! Please verify your email");
              scrollSuccessRef();
              setTimeout(() => navigate("/login"), 3000);
            })
            .catch((error) => {
              setError(error.message || "Failed to create account");
              toast.error(error.message || "Failed to create account");
              scrollErrorRef();
            });
        };
        addRecords();
        setUpload(false);
      }
    } catch (err: any) {
      console.log("err");
      setError(err.message || "Failed to Upload Records");
      toast.error(err.message || "Failed to Upload Records");
      scrollErrorRef();
    } finally {
        setUpload(false);
        setIsLoading(false);
    }
  }, [nmId, upload]);

  const ViewPass = () => {
    if (viewPassword) {
      setViewPassword(false);
    } else {
      setViewPassword(true);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg mx-auto transition-all">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Create an Account
          </h1>
          <p className="mt-2 text-gray-600">
            Sign up to start your online Hackathon
          </p>
        </div>

        {error && (
          <div
            ref={errorRef}
            className="p-3 bg-red-100 border border-red-400 text-red-700 rounded"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            ref={successRef}
            className="p-3 bg-green-100 border border-green-400 text-green-700 rounded"
          >
            {success}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="rollNo"
              className="block text-sm font-medium text-gray-700"
            >
              Roll No
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="rollNo"
                type="text"
                required
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="pl-10 block w-full py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your roll number"
              />
            </div>
          </div>

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
                type={viewPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              {viewPassword ? (
                <EyeOff
                  className="absolute right-2 top-[50%] -translate-y-[50%] text-gray-400 cursor-pointer"
                  onClick={ViewPass}
                />
              ) : (
                <Eye
                  className="absolute right-2 top-[50%] -translate-y-[50%] text-gray-400 cursor-pointer"
                  onClick={ViewPass}
                />
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="re-password"
              className="block text-sm font-medium text-gray-700"
            >
              Re-Enter your Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="re-password"
                type={viewPassword ? "text" : "password"}
                required
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                className="pl-10 block w-full py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              {viewPassword ? (
                <EyeOff
                  className="absolute right-2 top-[50%] -translate-y-[50%] text-gray-400 cursor-pointer"
                  onClick={ViewPass}
                />
              ) : (
                <Eye
                  className="absolute right-2 top-[50%] -translate-y-[50%] text-gray-400 cursor-pointer"
                  onClick={ViewPass}
                />
              )}
            </div>
          </div>

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

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 block w-full py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

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

      {showInfo && studentData && (
        <ProfileInfo
          userData={studentData}
          setUpload={setUpload}
          setError={setError}
          upload={upload}
          onClose={() => setShowInfo(false)}
        />
      )}
    </>
  );
};

export default SignupForm;
