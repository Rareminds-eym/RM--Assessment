import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Camera, Mic, MonitorX, AlertTriangle, XCircle, Clock } from 'lucide-react';
import UserProfile from '../components/UserProfile';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState({
    camera: false,
    microphone: false,
  });

  const handleStartTest = async () => {
    // Check if devices are available before showing permission dialog
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');

      if (!hasCamera || !hasMicrophone) {
        throw new Error(
          `Required devices not found: ${!hasCamera ? 'camera' : ''} ${!hasMicrophone ? 'microphone' : ''}`.trim()
        );
      }

      setShowPermissions(true);
      setPermissionError(null);
    } catch (error) {
      setPermissionError(
        error instanceof Error
          ? `${error.message}. Please ensure your devices are properly connected.`
          : "Unable to detect camera or microphone. Please check your device connections."
      );
      setShowPermissions(true);
    }
  };

  const requestPermission = async (name: 'camera' | 'microphone'): Promise<boolean> => {
    try {
      const constraints = name === 'camera' 
        ? { 
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user"
            } 
          } 
        : { 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } 
          };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Test the stream by checking if tracks are active
      const tracks = stream.getTracks();
      const isActive = tracks.every(track => track.readyState === 'live');
      
      // Always clean up the stream
      tracks.forEach(track => track.stop());
      
      if (!isActive) {
        throw new Error(`${name} is not working properly`);
      }

      return true;
    } catch (error) {
      console.error(`Error requesting ${name} permission:`, error);
      
      // Try fallback constraints if initial request fails
      if (name === 'camera') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
          });
          fallbackStream.getTracks().forEach(track => track.stop());
          return true;
        } catch (fallbackError) {
          console.error('Fallback camera request failed:', fallbackError);
          return false;
        }
      }
      
      return false;
    }
  };

  const handleGrantPermissions = async () => {
    try {
      setPermissionError(null);

      // Request camera permission
      const cameraGranted = await requestPermission('camera');
      setPermissionsGranted(prev => ({ ...prev, camera: cameraGranted }));

      // Request microphone permission
      const microphoneGranted = await requestPermission('microphone');
      setPermissionsGranted(prev => ({ ...prev, microphone: microphoneGranted }));

      // Check if both permissions were granted
      if (cameraGranted && microphoneGranted) {
        setTimeout(() => {
          navigate('/test');
        }, 1500);
      } else {
        const missingPermissions = [];
        if (!cameraGranted) missingPermissions.push('camera');
        if (!microphoneGranted) missingPermissions.push('microphone');
        
        throw new Error(
          `Please grant ${missingPermissions.join(' and ')} access to continue. Make sure your devices are properly connected and enabled.`
        );
      }
    } catch (error) {
      setPermissionError(
        error instanceof Error 
          ? error.message 
          : "Failed to get required permissions. Please check your device settings and try again."
      );
    }
  };

  const testRules = [
    "The test duration is 1.5 hours (90 minutes).",
    "You must keep your camera and microphone on during the entire test.",
    "Switching tabs or opening other applications is not allowed.",
    "You cannot copy or paste content during the test.",
    "All questions must be answered to complete the test.",
    "Once submitted, you cannot retake the test.",
    "Any suspicious activity will be flagged and may result in disqualification.",
    "You will receive a warning when 30 minutes remain.",
    "The last 5 minutes will be automatically allocated for review."
  ];

  const questionPattern = [
    {
      section: "Section A: Multiple Choice Questions (MCQs)",
      marks: 30,
      questions: 10,
      description: "Basic knowledge questions about chemical safety in battery production."
    },
    {
      section: "Section B: Scenario-Based Questions (MCQs)",
      marks: 25,
      questions: 10,
      description: "Questions based on real-world scenarios in battery manufacturing."
    },
    {
      section: "Section C: Case Study Analysis (MCQs)",
      marks: 20,
      questions: 4,
      description: "In-depth analysis of case studies related to chemical safety."
    }
  ];

  return (
    <div className="min-h-screen bg-pattern-chemistry">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900 font-serif">Rareminds Test Portal</h1>
          </div>
          <UserProfile />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 sm:px-8">
            <h2 className="text-2xl font-bold text-white font-serif">Final Exam: Chemical Safety in Battery Production and Handling</h2>
            <p className="mt-2 text-blue-100">
              Welcome, {user?.username}! This test will evaluate your understanding of chemical safety in battery production and handling.
            </p>
            <div className="mt-4 flex items-center bg-white bg-opacity-10 rounded-md p-2 w-fit">
              <Clock className="h-5 w-5 text-white mr-2" />
              <span className="text-white font-medium">Duration: 1.5 Hours</span>
              <span className="mx-2 text-white">|</span>
              <span className="text-white font-medium">Total Marks: 75</span>
            </div>
          </div>

          {/* Question Pattern */}
          <div className="px-6 py-6 sm:px-8 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-serif">Question Pattern</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questionPattern.map((pattern, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pattern.section}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pattern.marks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pattern.questions}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{pattern.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Time Allocation */}
          <div className="px-6 py-6 sm:px-8 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-serif">Time Allocation</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2">•</span>
                <div>
                  <p className="text-gray-700 font-medium">Total Duration: 1.5 Hours (90 minutes)</p>
                  <p className="text-sm text-gray-600">Recommended time allocation:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                    <li>Section A: 30 minutes</li>
                    <li>Section B: 30 minutes</li>
                    <li>Section C: 25 minutes</li>
                    <li>Final Review: 5 minutes (automatic)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Test Rules */}
          <div className="px-6 py-6 sm:px-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-serif">Test Rules</h3>
            <ul className="space-y-3 text-gray-600">
              {testRules.map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            {/* Start Test Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleStartTest}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Permissions Modal */}
      {showPermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="text-center mb-6">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 font-serif">Proctoring Permissions Required</h3>
              <p className="mt-2 text-sm text-gray-500">
                To ensure test integrity, we need access to your camera and microphone. Please grant the following permissions:
              </p>
            </div>

            {permissionError && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p>{permissionError}</p>
                </div>
                <p className="mt-1 text-sm">Please check your device settings and try again.</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Camera className={`h-6 w-6 ${permissionsGranted.camera ? 'text-green-500' : 'text-gray-400'} mr-3`} />
                <div>
                  <p className="font-medium text-gray-900">Camera Access</p>
                  <p className="text-sm text-gray-500">Required for proctoring</p>
                </div>
                {permissionsGranted.camera && (
                  <div className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Granted
                  </div>
                )}
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Mic className={`h-6 w-6 ${permissionsGranted.microphone ? 'text-green-500' : 'text-gray-400'} mr-3`} />
                <div>
                  <p className="font-medium text-gray-900">Microphone Access</p>
                  <p className="text-sm text-gray-500">Required for proctoring</p>
                </div>
                {permissionsGranted.microphone && (
                  <div className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Granted
                  </div>
                )}
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <MonitorX className="h-6 w-6 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Tab Switching Restricted</p>
                  <p className="text-sm text-gray-500">You cannot switch tabs during the test</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setShowPermissions(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleGrantPermissions}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Grant Permissions & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;