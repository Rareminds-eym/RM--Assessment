import React from 'react';
import { WifiOff, RefreshCw, Mail, Phone } from 'lucide-react';

const NetworkError: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <WifiOff className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Network Connection Error</h1>
          
          <p className="text-gray-600 mb-6">
            We're having trouble connecting to our servers. This could be due to a poor internet connection or our servers might be temporarily unavailable.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Page
            </button>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Need assistance? Contact us:</p>
              
              <div className="flex flex-col space-y-2">
                <a 
                  href="mailto:support@rareminds.com" 
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  support@rareminds.com
                </a>
                
                <a 
                  href="tel:+918001234567" 
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  +91 800 123 4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkError;