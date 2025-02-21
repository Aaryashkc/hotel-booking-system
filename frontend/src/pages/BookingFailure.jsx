import React from 'react';
import { Link } from 'react-router-dom';

const BookingFailure = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h2>
        <p className="text-gray-600 mb-8">
          We couldn't process your payment. Please try again or contact support if the problem persists.
        </p>
        <div className="space-y-4">
          <Link
            to="/search"
            className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Return to Search
          </Link>
          <button
            onClick={() => window.history.back()}
            className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingFailure;
