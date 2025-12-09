import React from 'react';
import { Trash2 } from 'lucide-react';

const GRADE_OPTIONS = ['Unsatisfactory', 'Okay', 'Exceptional', 'No Correct Image'];

function SummaryList({ gradings, onUpdateGrade, onRemovePR }) {
  return (
    <div className="space-y-6">
      {gradings.map(grading => (
        <div key={grading.reviewer} className="border-b border-gray-200 pb-4 last:border-b-0">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">{grading.reviewer}</h3>
          {grading.gradedPrs.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No graded PRs yet</p>
          ) : (
            <div className="space-y-3">
              {grading.gradedPrs.map((gradedPR, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      PR: <span className="text-gray-900">{gradedPR.prNumbers}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {GRADE_OPTIONS.map(grade => (
                        <label key={grade} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`grade-${grading.reviewer}-${index}`}
                            value={grade}
                            checked={gradedPR.grade === grade}
                            onChange={() => onUpdateGrade(grading.reviewer, index, grade)}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span
                            className={`text-sm px-3 py-1 rounded-md transition-colors ${
                              gradedPR.grade === grade
                                ? 'bg-blue-100 text-blue-800 font-medium'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            {grade}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemovePR(grading.reviewer, index)}
                    className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove PR"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SummaryList;
