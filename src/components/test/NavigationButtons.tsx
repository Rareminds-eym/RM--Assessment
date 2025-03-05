import React from 'react';

interface NavigationButtonsProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex justify-between">
      <button
        onClick={onPrevious}
        disabled={currentQuestion === 0}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        Previous
      </button>
      
      {currentQuestion < totalQuestions - 1 ? (
        <button
          onClick={onNext}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Next
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Review Answers
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;