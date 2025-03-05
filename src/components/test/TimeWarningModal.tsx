import React from 'react';
import { AlertCircle } from 'lucide-react';

interface TimeWarningModalProps {
  onClose: () => void;
}

const TimeWarningModal: React.FC<TimeWarningModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 font-serif">Time Warning</h3>
          <p className="mt-2 text-sm text-gray-500">
            You have 30 minutes remaining to complete the test.
            Please review your answers and ensure all questions are answered.
          </p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeWarningModal;