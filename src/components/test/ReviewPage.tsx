import React from 'react';
import { Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Question } from '../../types';

interface ReviewPageProps {
  questions: Question[];
  answers: Record<number, number>;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  onBack: () => void;
  onSubmit: () => void;
  onQuestionSelect: (index: number) => void;
}

const ReviewPage: React.FC<ReviewPageProps> = ({
  questions,
  answers,
  timeLeft,
  formatTime,
  onBack,
  onSubmit,
  onQuestionSelect,
}) => {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6 p-4 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-serif">Review Your Answers</h1>
            <p className="text-sm text-gray-600">
              You have answered {Object.keys(answers).length} out of {questions.length} questions
            </p>
          </div>
          <div className="flex items-center mt-2 md:mt-0">
            <Clock className={`h-5 w-5 ${timeLeft < 1800 ? 'text-red-500' : 'text-gray-500'} mr-2`} />
            <span className={`font-mono font-medium ${timeLeft < 1800 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 font-serif">All Questions</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded-full mr-1"></div>
                <span className="text-sm text-gray-600">Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 rounded-full mr-1"></div>
                <span className="text-sm text-gray-600">Unanswered</span>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {questions.map((question, index) => {
            const isAnswered = answers[index] !== undefined;
            const selectedOption = isAnswered ? answers[index] : -1;
            
            return (
              <div 
                key={index} 
                className={`p-6 hover:bg-gray-50 transition-colors duration-150 ${
                  isAnswered ? 'bg-green-50/50' : 'bg-red-50/50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm font-medium text-gray-500">{question.marks} marks</span>
                    {question.section && (
                      <>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-sm text-blue-600">{question.section.split(':')[0]}</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => onQuestionSelect(index)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {isAnswered ? 'Change Answer' : 'Answer Question'}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  {question.text}
                </h3>
                
                {isAnswered ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 mr-2">
                        {String.fromCharCode(97 + selectedOption)}
                      </span>
                      <span className="text-gray-700 flex-1">{question.options[selectedOption]}</span>
                      <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-red-600 flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                    Not answered yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Test
        </button>
        
        <div className="text-sm text-gray-600">
          <span className="font-medium">{Object.keys(answers).length}</span> of <span className="font-medium">{questions.length}</span> questions answered
        </div>
        
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default ReviewPage;