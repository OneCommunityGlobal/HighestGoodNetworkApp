import React, { useState} from 'react';
import mockPromotionData from './DisplayBoxMockData';
import './DisplayBox.css'

export default function DisplayBox( {onClose }) {
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
                <td>{promotion.weeklyPRs.map(pr => pr.prCount).join(', ')}</td>
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
