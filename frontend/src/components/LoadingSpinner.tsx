import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading FitSphere...' }) => {
  return (
    <div className="min-h-screen bg-[#090C10] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-14 h-14">
        <div className="w-14 h-14 border-4 border-[#202938] border-t-[#FF5500] rounded-full animate-spin shadow-[0_0_15px_rgba(255,85,0,0.3)]"></div>
        <div className="absolute inset-0 flex items-center justify-center text-[#FF5500] text-xs font-black">⚡</div>
      </div>
      <p className="text-gray-400 text-sm font-semibold font-heading tracking-wide uppercase">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
