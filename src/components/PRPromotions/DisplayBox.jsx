import React, { useState} from 'react';
import './DisplayBox.css'

export default function DisplayBox( {onClose }) {

    const mockPromotionData = [
  {
    prReviewer: 'Akshay - Jayram',
    teamCode: '123',
    teamReviewerName: '""',
    weeklyPRs: [
      { week: '2024-06-01', prCount: 12 },
      { week: '2024-06-08', prCount: 15 },
      { week: '2024-06-15', prCount: 10 },
      { week: '2024-06-22', prCount: 18 },
      { week: '2024-06-29', prCount: 14 },
    ],
  },  
  {
    prReviewer: 'Ghazi1212',
    teamCode: '456',
    teamReviewerName: '""',
    weeklyPRs: [
      { week: '2024-06-01', prCount: 12 },
      { week: '2024-06-08', prCount: 15 },
      { week: '2024-06-15', prCount: 10 },
      { week: '2024-06-22', prCount: 18 },
      { week: '2024-06-29', prCount: 14 },
    ],
  }
]

  const[checkedItems, setCheckedItems] = useState(Array(mockPromotionData.length).fill(false));
  const allChecked = checkedItems.every(Boolean);
  const handleCheckedBoxChange = (index) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  
  }
  const handleSelectAll = () => {
    setCheckedItems(Array(mockPromotionData.length).fill(!allChecked));
  }

  return (
    <div className="overlay">
      <div className="popup">
        <h2 className="popup-heading">
          Are you sure you want to promote these PR reviewers?
        </h2>
        <table className="popup-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={allChecked} onChange={handleSelectAll}></input></th>
              <th>PR Reviewer</th>
              <th>Team Code</th>
              <th>Team Reviewer Name</th>
              <th>Weekly PR Counts</th>
            </tr>
          </thead>
          <tbody>
            {mockPromotionData.map((promotion, index) => (
              <tr key={index}>
                <td>< input type="checkbox" checked={checkedItems[index]} onChange={() => handleCheckedBoxChange(index)}></input></td>
                <td>{promotion.prReviewer}</td>
                <td>{promotion.teamCode}</td>
                <td>{promotion.teamReviewerName}</td>
                {/* <td>{promotion.weeklyPRs.map(pr => pr.prCount).join(', ')}</td> */}
                <td>
                  {promotion.weeklyPRs.map((pr, i) => (
                    <span key={i} className={`pr-count-badge color-${i % 5}`}>
                      {pr.prCount}
                    </span>
                  ))}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        <div className="button-row">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="button">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
