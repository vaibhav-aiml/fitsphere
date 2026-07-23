import React from 'react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Failed to load data. Please try again.',
  onRetry
}) => {
  return (
    <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-center my-4">
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
