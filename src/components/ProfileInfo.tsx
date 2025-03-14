import {
  User,
  Hash,
  Mail,
  BookOpen,
  GraduationCap,
  Book,
  Fingerprint,
  Building,
  Code,
  Users,
  School,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ProfileInfo: React.FC<any> = ({ userData, setUpload, setError, onClose, upload }) => {
  const handleConfirm = () => {
    setUpload(true);
    // toast.success("Profile confirmed successfully!");
  };
  
  const handleSupport = () => {
    setError("Please recheck your Roll No. Or contact +91 9902326951");
    toast.error("Please recheck your Roll No. Or contact +91 9902326951");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white shadow rounded-lg overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-white font-serif">
                {userData?.StudentName}
              </h3>
              <p className="text-sm text-blue-100">Student</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Hash className="h-4 w-4 mr-2" />
                NM ID
              </dt>
              <dd className="mt-1 text-sm text-gray-900 break-words">
                {userData?.NMId}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Semester
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {userData?.Semester}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <GraduationCap className="h-4 w-4 mr-2" />
                Course
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {userData?.CourseName}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Book className="h-4 w-4 mr-2" />
                Department
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{userData?.Branch}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Fingerprint className="h-4 w-4 mr-2" />
                Roll No
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {userData?.StudentRollNo}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                College Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {userData?.CollegeName}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Code className="h-4 w-4 mr-2" />
                College Code
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {userData?.CollegeCode}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <School className="h-4 w-4 mr-2" />
                University Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {userData?.UniversityName}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex justify-between px-6 py-4 bg-gray-50">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={handleSupport}
          >
            This is not my info
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleConfirm}
            disabled={upload}
          >
            {upload ? "Creating account...":"This is me"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileInfo;