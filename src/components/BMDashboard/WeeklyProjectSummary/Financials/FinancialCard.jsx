import React, { useState } from 'react';

export default function FinancialCard({ title, value, monthOverMonth, additionalInfo = {} }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine the color and icon for the month-over-month change.
  const isPositive = monthOverMonth > 0;
  const isNegative = monthOverMonth < 0;
  const changeColor = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500';
  const changeIcon = isPositive ? (
    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
  ) : isNegative ? (
    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  ) : null;

  return (
    <div
      className="relative flex flex-col p-6 bg-white rounded-3xl shadow-lg border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl w-72 h-64"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Title */}
      <div className="flex-1">
        <h3 className="text-gray-900 text-lg font-semibold mb-2">{title}</h3>
      </div>

      {/* Value */}
      <div className="flex-1 flex flex-col justify-end mb-4">
        <p className="text-4xl font-bold text-gray-900">
          {value === '-' ? '-' : value.toLocaleString()}
        </p>
      </div>

      {/* Month-over-month change and 'View more' link */}
      <div className="flex justify-between items-center text-sm font-medium">
        <div className={`flex items-center gap-1 ${changeColor}`}>
          {changeIcon}
          {monthOverMonth === '-' ? '-' : `${monthOverMonth > 0 ? '+' : ''}${monthOverMonth}%`}
        </div>
        <button type="button" className="text-blue-600 hover:underline">
          View more
        </button>
      </div>

      {/* Tooltip */}
      {showTooltip && Object.keys(additionalInfo).length > 0 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-xl whitespace-nowrap z-10 opacity-90">
          {Object.entries(additionalInfo).map(([key, val]) => (
            <div
              key={key}
              className="flex justify-between py-1 border-b border-gray-700 last:border-b-0"
            >
              <span className="font-semibold text-gray-300 mr-4">{key}:</span>
              <span>{val.toLocaleString ? val.toLocaleString() : val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
