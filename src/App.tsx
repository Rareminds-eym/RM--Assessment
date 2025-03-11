import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
import { TestProvider } from "./context/TestContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import TestPage from "./pages/TestPage";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import NetworkError from "./pages/NetworkError";
import Footer from "./components/Footer";

function App() {
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    // Check for network connectivity
    const checkNetwork = () => {
      if (!navigator.onLine) {
        setNetworkError(true);
      } else {
        setNetworkError(false);
      }
    };

    // Initial check
    checkNetwork();

    // Add event listeners for online/offline status
    window.addEventListener("online", checkNetwork);
    window.addEventListener("offline", checkNetwork);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", checkNetwork);
      window.removeEventListener("offline", checkNetwork);
    };
  }, []);

  if (loading) {
    return <Loader />;
  }

  // if (networkError) {
  //   return <NetworkError />;
  // }

  return (
    // <AuthProvider>
      <TestProvider>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Router>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/network-error" element={<NetworkError />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/test"
                  element={
                    <ProtectedRoute>
                      <TestPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/results"
                  element={
                    <ProtectedRoute>
                      <Results />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </div>
          <Footer />
        </div>
      </TestProvider>
    // </AuthProvider>
  );
}

export default App;
