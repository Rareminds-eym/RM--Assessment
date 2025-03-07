import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Clock, HelpCircle, X, Mail, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import { getQuestions } from '../data/questions';
import { Question } from '../types';
import ReviewPage from '../components/test/ReviewPage';
import InstructionsPage from '../components/test/InstructionsPage';
import PermissionsModal from '../components/test/PermissionsModal';
import WarningModal from '../components/test/WarningModal';
import TimeWarningModal from '../components/test/TimeWarningModal';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface TestAttempt {
  nmId: string;
  courseId: string;
  timestamp: Date;
  questions: {
    questionId: number;
    question: string;
    attemptedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    timeTaken: number;
  }[];
  totalScore: number;
  totalQuestions: number;
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const courseId = location.state?.courseId;
  const videoRef = useRef<HTMLVideoElement>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showInstructions, setShowInstructions] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isFromReview, setIsFromReview] = useState(false);

  // Test state
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([]);
  const [timeTakenPerQuestion, setTimeTakenPerQuestion] = useState<number[]>([]);
  const [totalTimeLeft, setTotalTimeLeft] = useState(60);

  // Warning and modal state
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [showTimeWarning, setShowTimeWarning] = useState<'half-time' | 'review-time' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Submit test attempt to Firestore
  const submitTestAttempt = async (score: number) => {
    if (!user?.nmId) return;

    const attempt: TestAttempt = {
      nmId: user.nmId,
      courseId,
      timestamp: new Date(),
      questions: questions.map((q, index) => ({
        questionId: q.id,
        question: q.text,
        attemptedAnswer: selectedAnswers[index] ?? "Not attempted",
        correctAnswer: q.correctAnswer,
        isCorrect: selectedAnswers[index] === q.correctAnswer,
        timeTaken: timeTakenPerQuestion[index] || 0,
      })),
      totalScore: score,
      totalQuestions: questions.length
    };

    try {
      await addDoc(collection(db, "attempts"), attempt);
    } catch (error) {
      console.error("Error submitting test attempt:", error);
    }
  };

  const handleFinish = async () => {
    console.log("Test is being auto-submitted...");
    
    // Ensure all unanswered questions are marked as "Not attempted"
    const finalSelectedAnswers = selectedAnswers.map(ans => ans ?? "Not attempted");
  
    const score = finalSelectedAnswers.filter((answer, index) => 
      answer !== "Not attempted" && answer === questions[index].correctAnswer
    ).length;
    
    await submitTestAttempt(score);
    
    navigate('/results', { 
      state: { 
        score, 
        totalQuestions: questions.length,
        courseId 
      } 
    });
  };
  

  // Fetch questions when component mounts
  useEffect(() => {
    const loadQuestions = async () => {
      if (!courseId) {
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        const fetchedQuestions = await getQuestions(courseId);
        if (fetchedQuestions.length === 0) {
          throw new Error('No questions found for this course');
        }
        setQuestions(fetchedQuestions);
        setSelectedAnswers(new Array(fetchedQuestions.length).fill(null));
        setTimeTakenPerQuestion(new Array(fetchedQuestions.length).fill(0));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [courseId, navigate]);

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
              handleFinish();
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

  // Initialize webcam
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

  // Timer effect
  useEffect(() => {
    if (showResults) {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
      }
      return;
    }

    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev === 1800) {
          setShowTimeWarning('half-time');
        }
        else if (prev === 600) {
          setShowTimeWarning('review-time');
          setShowReview(true);
        }
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

  // Auto-submit when timer reaches zero
  useEffect(() => {
    if (totalTimeLeft <= 0) {
      console.log("Timer ended! Auto-submitting test...");
      setTimeout(handleFinish, 1000); // Delay by 1 second to ensure final state update
    }
  }, [totalTimeLeft]);

  // Question timer effect
  useEffect(() => {
    if (!testStarted || showReview) return;

    // Clear any existing timer
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }

    // Start a new timer that updates every second
    questionTimerRef.current = setInterval(() => {
      setTimeTakenPerQuestion(prev => {
        const newTimes = [...prev];
        newTimes[currentQuestion] = (newTimes[currentQuestion] || 0) + 1;
        return newTimes;
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, [currentQuestion, testStarted, showReview]);

  // Add cleanup for question timer when test ends
  useEffect(() => {
    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, []);

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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-pattern-chemistry flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-pattern-chemistry flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-base font-bold text-gray-900 mb-4">Error Loading Test</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
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
        timeTakenPerQuestion={timeTakenPerQuestion}
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
            <div className="flex items-center gap-4">
              {isFromReview && (
                <button
                  onClick={() => setShowReview(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Review
                </button>
              )}
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Question {currentQuestion + 1} of {questions.length}
                </h2>
                <p className="text-xs text-gray-500">
                  Time spent: {formatTime(timeTakenPerQuestion[currentQuestion] || 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className={`font-medium text-base ${totalTimeLeft <= 300 ? 'text-red-500' : ''}`}>
                  {formatTime(totalTimeLeft)}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <HelpCircle className="w-5 h-5 text-blue-600" />
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
                  <h3 className="text-base font-semibold text-gray-900">Help & Support</h3>
                  <button
                    onClick={() => {
                      setShowHelp(false);
                      setShowContactForm(false);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {!showContactForm ? (
                  <>
                    <div className="space-y-4 text-sm text-gray-600">
                      <p>• Total time limit is 1 hour</p>
                      <p>• You can navigate between questions using the number buttons or Previous/Next</p>
                      <p>• Your progress is saved when switching questions</p>
                      <p>• Review all answers before submitting on the last question</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-base font-medium text-gray-900 mb-4">Need more help?</h4>
                      <div className="space-y-3">
                        <a
                          href="mailto:support@rareminds.com"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        >
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span>support@rareminds.com</span>
                        </a>
                        <a
                          href="tel:+1234567890"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        >
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span>+1 (234) 567-890</span>
                        </a>
                        <button
                          onClick={() => setShowContactForm(true)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm w-full"
                        >
                          <MessageSquare className="w-4 h-4 text-blue-600" />
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        rows={4}
                        placeholder="How can we help you?"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
                    className={`relative w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : status === 'attempted'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{(index + 1).toString()}</span>
                    {status === 'attempted' && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
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
            
            <div className="flex justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600">Attempted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-200 rounded-full" />
                <span className="text-gray-600">Unattempted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
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
            <h2 className="text-base text-gray-900 mb-8 text-center">
              {questions[currentQuestion].text}
            </h2>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    const newAnswers = [...selectedAnswers];
                    newAnswers[currentQuestion] = option;
                    setSelectedAnswers(newAnswers);
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedAnswers[currentQuestion] === option
                      ? 'border-blue-600 bg-blue-50 text-gray-900'
                      : 'border-gray-200 hover:border-blue-300 text-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${
                      selectedAnswers[currentQuestion] === option
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-sm">{option}</span>
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
                className={`flex items-center gap-3 px-6 py-2 rounded-lg text-sm ${
                  currentQuestion === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="flex items-center gap-3 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                {isFromReview ? (
                  <>
                    Back to Review
                    <ArrowLeft className="w-4 h-4" />
                  </>
                ) : currentQuestion === questions.length - 1 ? (
                  <>
                    Review Answers
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
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