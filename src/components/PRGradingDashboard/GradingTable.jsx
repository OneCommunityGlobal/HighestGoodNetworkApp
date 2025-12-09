import React from 'react';
import ReviewerRow from './ReviewerRow';
import AddPRModal from './AddPRModal';

function GradingTable({
  gradings,
  onUpdatePRsReviewed,
  onAddPRClick,
  openAddModal,
  onAddGradedPR,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reviewer Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PRs Reviewed
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PRs Needed
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PR Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {gradings.map((grading, index) => (
            <React.Fragment key={grading.reviewer}>
              <ReviewerRow
                grading={grading}
                onUpdatePRsReviewed={onUpdatePRsReviewed}
                onAddPRClick={onAddPRClick}
              />
              {openAddModal === grading.reviewer && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 bg-gray-50">
                    <AddPRModal
                      reviewer={grading.reviewer}
                      onAdd={onAddGradedPR}
                      onCancel={() => onAddPRClick(null)}
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GradingTable;
