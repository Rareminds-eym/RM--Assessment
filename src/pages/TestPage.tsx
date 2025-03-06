import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Clock, HelpCircle, X, Mail, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import QuizQuestions from '../data/questions';
import ReviewPage from '../components/test/ReviewPage';
import InstructionsPage from '../components/test/InstructionsPage';
import PermissionsModal from '../components/test/PermissionsModal';
import WarningModal from '../components/test/WarningModal';

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = location.state?.courseId;

  // State for tab switching warnings
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [showTimeWarning, setShowTimeWarning] = useState<'half-time' | 'review-time' | null>(null);

  // Get questions for the selected course
  const questions = QuizQuestions[courseId || ''] || [];

  // Redirect if no courseId is provided
  useEffect(() => {
    if (!courseId) {
      navigate('/dashboard');
      return;
    }
  }, [courseId, navigate]);

  // If no questions are found, show error state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-pattern-chemistry flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Not Found</h2>
          <p className="text-gray-600 mb-6">The requested test could not be loaded.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [showInstructions, setShowInstructions] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [timeTakenPerQuestion, setTimeTakenPerQuestion] = useState<number[]>(new Array(questions.length).fill(0));
  const [totalTimeLeft, setTotalTimeLeft] = useState(3600); // 1 hour in seconds
  const [showHelp, setShowHelp] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [isFromReview, setIsFromReview] = useState(false);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (testStarted && !showInstructions && !showPermissions) {
        const isVisible = !document.hidden;
        setIsTabVisible(isVisible);
        
        if (!isVisible) {
          setWarningCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 3) {
              handleFinish(); // Auto-submit after 3 warnings
              return prev;
            }
            setShowWarning(true);
            return newCount;
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testStarted, showInstructions, showPermissions]);

  useEffect(() => {
    const initializeWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.warn("Webcam not available:", error);
      }
    };

    initializeWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (showResults) {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
      }
      return;
    }

    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft(prev => {
        // Show half-time warning at 30 minutes
        if (prev === 1800) {
          setShowTimeWarning('half-time');
        }
        // Show review-time warning and force review mode at 10 minutes
        else if (prev === 600) {
          setShowTimeWarning('review-time');
          setShowReview(true);
        }
        // Auto-submit at time end
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
      }
    };
  }, [showResults]);

  useEffect(() => {
    const timeTaken = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    const newTimeTakenPerQuestion = [...timeTakenPerQuestion];
    newTimeTakenPerQuestion[currentQuestion] = timeTaken;
    setTimeTakenPerQuestion(newTimeTakenPerQuestion);
    questionStartTimeRef.current = Date.now();
  }, [currentQuestion]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent! Our support team will get back to you soon.');
    setContactMessage('');
    setShowContactForm(false);
    setShowHelp(false);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    const score = selectedAnswers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    navigate('/results', { state: { score, totalQuestions: questions.length } });
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestion(index);
    setShowReview(false);
    setIsFromReview(true);
  };

  const handleNext = () => {
    if (isFromReview) {
      setShowReview(true);
    } else if (currentQuestion === questions.length - 1) {
      setShowReview(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleStartTest = () => {
    setShowInstructions(false);
    setShowPermissions(true);
  };

  const handlePermissionsGranted = () => {
    setShowPermissions(false);
    setTestStarted(true);
  };

  if (showInstructions) {
    return <InstructionsPage onContinue={handleStartTest} />;
  }

  if (showPermissions) {
    return <PermissionsModal onPermissionsGranted={handlePermissionsGranted} />;
  }

  if (showReview) {
    return (
      <ReviewPage
        questions={questions}
        answers={selectedAnswers}
        timeLeft={totalTimeLeft}
        formatTime={formatTime}
        onBack={() => {
          setShowReview(false);
          setCurrentQuestion(questions.length - 1);
        }}
        onSubmit={handleFinish}
        onQuestionSelect={handleQuestionSelect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-pattern-chemistry">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              {isFromReview && (
                <button
                  onClick={() => setShowReview(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Review
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-900 font-serif">
                Question {currentQuestion + 1} of {questions.length}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <span className={`font-medium text-xl ${totalTimeLeft <= 300 ? 'text-red-500' : ''}`}>
                  {formatTime(totalTimeLeft)}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </motion.button>
            </div>
          </div>

          {/* Help Popup */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-20 right-6 w-96 bg-white rounded-lg shadow-xl p-6 z-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Help & Support</h3>
                  <button
                    onClick={() => {
                      setShowHelp(false);
                      setShowContactForm(false);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {!showContactForm ? (
                  <>
                    <div className="space-y-4 text-base text-gray-600">
                      <p>• Total time limit is 1 hour</p>
                      <p>• You can navigate between questions using the number buttons or Previous/Next</p>
                      <p>• Your progress is saved when switching questions</p>
                      <p>• Review all answers before submitting on the last question</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Need more help?</h4>
                      <div className="space-y-3">
                        <a
                          href="mailto:support@rareminds.com"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-base"
                        >
                          <Mail className="w-5 h-5 text-blue-600" />
                          <span>support@rareminds.com</span>
                        </a>
                        <a
                          href="tel:+1234567890"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-base"
                        >
                          <Phone className="w-5 h-5 text-blue-600" />
                          <span>+1 (234) 567-890</span>
                        </a>
                        <button
                          onClick={() => setShowContactForm(true)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-base w-full"
                        >
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <span>Send us a message</span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleContactSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                        rows={4}
                        placeholder="How can we help you?"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-base"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base"
                      >
                        Send
                      </button>
                    </div>
                  </motion.form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Navigation */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {questions.map((_, index) => {
                const status = selectedAnswers[index] !== null ? "attempted" : "unattempted";
                const isActive = currentQuestion === index;
                
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentQuestion(index)}
                    className={`relative w-10 h-10 rounded-md flex items-center justify-center text-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : status === 'attempted'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{index + 1}</span>
                    {status === 'attempted' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeQuestion"
                        className="absolute inset-0 border-2 rounded-md"
                        style={{ borderColor: status === 'attempted' ? '#22c55e' : '#2563eb' }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
            
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-600">Attempted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full" />
                <span className="text-gray-600">Unattempted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <span className="text-gray-600">Current</span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 min-h-[600px]"
          >
            <h2 className="text-2xl text-gray-900 mb-8 text-center font-serif">
              {questions[currentQuestion].text}
            </h2>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    const newAnswers = [...selectedAnswers];
                    newAnswers[currentQuestion] = index;
                    setSelectedAnswers(newAnswers);
                  }}
                  className={`w-full p-6 rounded-lg border-2 transition-all ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-600 bg-blue-50 text-gray-900'
                      : 'border-gray-200 hover:border-blue-300 text-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg ${
                      selectedAnswers[currentQuestion] === index
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(prev => prev - 1);
                  }
                }}
                disabled={currentQuestion === 0}
                className={`flex items-center gap-3 px-8 py-3 rounded-lg text-lg ${
                  currentQuestion === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
                Previous
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="flex items-center gap-3 px-8 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-lg"
              >
                {isFromReview ? (
                  <>
                    Back to Review
                    <ArrowLeft className="w-6 h-6" />
                  </>
                ) : currentQuestion === questions.length - 1 ? (
                  <>
                    Review Answers
                    <ChevronRight className="w-6 h-6" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Webcam display (minimized in corner) */}
      <div className="fixed bottom-4 right-4 w-64 h-48 bg-black rounded-lg overflow-hidden shadow-lg border-2 border-blue-600">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-red-500 h-3 w-3 rounded-full animate-pulse"></div>
      </div>

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <WarningModal
            warningCount={warningCount}
            onClose={() => setShowWarning(false)}
          />
        )}
      </AnimatePresence>

      {/* Time Warning Modal */}
      <AnimatePresence>
        {showTimeWarning && (
          <TimeWarningModal
            type={showTimeWarning}
            onClose={() => setShowTimeWarning(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestPage;