import React from 'react';
import { Plus } from 'lucide-react';

function ReviewerRow({ grading, onUpdatePRsReviewed, onAddPRClick }) {
  const handlePRsReviewedChange = e => {
    const value = e.target.value;
    // Allow empty string for better UX, but convert to 0 on blur if invalid
    if (value === '' || (!isNaN(value) && parseInt(value, 10) >= 0)) {
      onUpdatePRsReviewed(grading.reviewer, value === '' ? 0 : parseInt(value, 10));
    }
  };

  const handleBlur = e => {
    const value = e.target.value;
    if (value === '' || isNaN(value) || parseInt(value, 10) < 0) {
      onUpdatePRsReviewed(grading.reviewer, 0);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{grading.reviewer}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="number"
          min="0"
          value={grading.prsReviewed}
          onChange={handlePRsReviewedChange}
          onBlur={handleBlur}
          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-700">{grading.prsNeeded}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onAddPRClick(grading.reviewer)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </button>
      </td>
    </tr>
  );
}

export default ReviewerRow;
