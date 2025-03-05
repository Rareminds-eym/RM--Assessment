import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, BookOpen, Award } from 'lucide-react';

const Results: React.FC = () => {
  const navigate = useNavigate();
  
  // In a real app, this would come from the server or state
  const mockResults = {
    feedback: 'Good understanding of chemical safety in battery production. You demonstrated strong knowledge in handling emergency situations and regulatory compliance. Areas for improvement include sustainable waste management practices and AI applications in safety monitoring.'
  };

  return (
    <div className="min-h-screen bg-pattern-chemistry py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 sm:px-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white bg-opacity-20 mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white font-serif">Test Completed!</h2>
            <p className="mt-2 text-green-100">
              You've successfully completed the Chemical Safety in Battery Production and Handling exam.
            </p>
          </div>

          {/* Results */}
          <div className="px-6 py-6 sm:px-8">
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center font-serif">
                <Award className="h-5 w-5 text-blue-500 mr-2" />
                Feedback
              </h3>
              <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                {mockResults.feedback}
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;