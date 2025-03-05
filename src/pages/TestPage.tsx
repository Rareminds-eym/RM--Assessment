import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TestHeader from '../components/test/TestHeader';
import ProgressBar from '../components/test/ProgressBar';
import QuestionCard from '../components/test/QuestionCard';
import NavigationButtons from '../components/test/NavigationButtons';
import WarningModal from '../components/test/WarningModal';
import TimeWarningModal from '../components/test/TimeWarningModal';
import ReviewPage from '../components/test/ReviewPage';
import HelpSupport from '../components/test/HelpSupport';
import NotificationModal from '../components/test/NotificationModal';
import { Question } from '../types';
import { testQuestions } from '../data/testQuestions';

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [tabWarning, setTabWarning] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [timeWarning, setTimeWarning] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [autoReviewTriggered, setAutoReviewTriggered] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const questions: Question[] = testQuestions;

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 30 * 60) {
          setTimeWarning(true);
        }
        
        if (prev === 5 * 60 && !autoReviewTriggered) {
          setShowReview(true);
          setAutoReviewTriggered(true);
          setNotification({
            show: true,
            type: 'warning',
            title: 'Time Running Out',
            message: 'You have 5 minutes remaining. Please review your answers before the test ends.',
            confirmText: 'Review Now'
          });
        }
        
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoReviewTriggered]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarning(true);
        setWarningCount(prev => prev + 1);
        
        if (warningCount >= 2) {
          setNotification({
            show: true,
            type: 'error',
            title: 'Test Termination',
            message: 'You have switched tabs too many times. The test will be submitted automatically.',
            onConfirm: handleSubmit,
            confirmText: 'Submit Test'
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [warningCount]);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowReview(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    navigate('/results');
  };

  const handleHelpSubmit = (issue: string) => {
    setNotification({
      show: true,
      type: 'info',
      title: 'Support Request Submitted',
      message: 'Your issue has been reported. Our support team will look into it.',
      confirmText: 'Continue Test'
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateTotalMarks = () => {
    return questions.reduce((total, question) => total + (question.marks || 0), 0);
  };

  return (
    <div className="min-h-screen bg-pattern-chemistry">
      {tabWarning && (
        <WarningModal
          warningCount={warningCount}
          onClose={() => setTabWarning(false)}
        />
      )}

      {timeWarning && (
        <TimeWarningModal
          onClose={() => setTimeWarning(false)}
        />
      )}

      {notification.show && (
        <NotificationModal
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
          onConfirm={notification.onConfirm}
          confirmText={notification.confirmText}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showReview ? (
          <ReviewPage
            questions={questions}
            answers={answers}
            timeLeft={timeLeft}
            formatTime={formatTime}
            onBack={() => setShowReview(false)}
            onSubmit={handleSubmit}
            onQuestionSelect={(index) => {
              setCurrentQuestion(index);
              setShowReview(false);
            }}
          />
        ) : (
          <>
            <TestHeader
              timeLeft={timeLeft}
              totalMarks={calculateTotalMarks()}
              formatTime={formatTime}
            />

            <ProgressBar
              currentQuestion={currentQuestion}
              totalQuestions={questions.length}
              answeredQuestions={Object.keys(answers).length}
            />

            <QuestionCard
              question={questions[currentQuestion]}
              currentQuestion={currentQuestion}
              answers={answers}
              onAnswerSelect={handleAnswerSelect}
            />

            <NavigationButtons
              currentQuestion={currentQuestion}
              totalQuestions={questions.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          </>
        )}
      </div>

      <HelpSupport onSubmit={handleHelpSubmit} />
    </div>
  );
};

export default TestPage;