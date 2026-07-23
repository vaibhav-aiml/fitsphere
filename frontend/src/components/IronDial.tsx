'use client';

import React from 'react';

interface IronDialProps {
  value: number | string;
  max?: number;
  label: string;
  sublabel?: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IronDial: React.FC<IronDialProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  unit = '',
  size = 'md'
}) => {
  const numericVal = typeof value === 'number' ? value : parseFloat(value as string) || 0;
  const percentage = Math.min(100, Math.max(0, (numericVal / max) * 100));
  
  // Dimensions based on size
  const dimension = size === 'sm' ? 120 : size === 'lg' ? 220 : 160;
  const strokeWidth = size === 'sm' ? 10 : size === 'lg' ? 16 : 14;
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center group">
      {/* Outer Tactile Dial Housing */}
      <div 
        className="relative flex items-center justify-center rounded-full bg-[#11161F] p-3 border border-[#202938] neu-raised shadow-[8px_8px_20px_rgba(0,0,0,0.7),-5px_-5px_15px_rgba(255,255,255,0.03)]"
        style={{ width: dimension + 20, height: dimension + 20 }}
      >
        {/* SVG Ring Track */}
        <svg 
          width={dimension} 
          height={dimension} 
          className="transform -rotate-90"
        >
          {/* Inner embossed track groove */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#0D1117"
            strokeWidth={strokeWidth}
            fill="none"
            className="shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
          />
          {/* Track Outline Stroke */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#202938"
            strokeWidth={strokeWidth - 4}
            fill="none"
          />
          {/* Glowing Blaze Accent Progress Arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#FF5500"
            strokeWidth={strokeWidth - 2}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="iron-dial-glow transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-[#FF5500] text-xs font-black uppercase tracking-wider font-heading mb-0.5">
            {label}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className={`font-black font-heading text-white tracking-tight ${
              size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-3xl'
            }`}>
              {value}
            </span>
            {unit && (
              <span className="text-gray-400 text-xs font-bold">{unit}</span>
            )}
          </div>
          {sublabel && (
            <span className="text-gray-400 text-[10px] font-semibold mt-0.5 truncate max-w-[90%]">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default IronDial;
