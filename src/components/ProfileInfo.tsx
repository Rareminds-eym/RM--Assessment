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
} from "lucide-react";

const ProfileInfo: React.FC<any> = ({ userData, setUpload, setError }) => {
  const handleConfirm = () => {
    setUpload(true);
  };
  const handleSupport = () => {
    setError("Please recheck your Roll No. Or contact +91 9902326951");
  };
  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden mt-10 lg:mt-0 h-full">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
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
            {/* <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{userData?.email}</dd>
            </div> */}
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
            {/* <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Team Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.teamname}</dd>
            </div> */}
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
        <div className="flex justify-between px-6 mt-auto py-5">
          <button
            className="bg-red-500 px-5 py-2 rounded-[10px] text-white"
            onClick={handleSupport}
          >
            This is not my info
          </button>
          <button
            className="bg-green-500 px-5 py-2 rounded-[10px] text-white"
            onClick={handleConfirm}
          >
            This is me
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileInfo;
