import { FaSpinner } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './PromotionEligibility.css';

function PromotionEligibility() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviewerData = async () => {
      try {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (err) {
        toast.error('Failed to fetch reviewer data.');
        setError('Error loading reviewer data.');
      }
    };

    fetchReviewerData();
  }, []);

  if (loading) {
    return (
      <div className="promo-text-center">
        <FaSpinner className="promo-spinner" />
        <div>Loading Reviewer data...</div>
      </div>
    );
  }

  if (error) {
    return <div className="promo-error">{error}</div>;
  }

  const newMembers = [
    { reviewer: 'Akshay - Jayaram', weekly: '✅ Has Met', prs: 10, reviews: 20, weeks: 0, promote: true },
    { reviewer: 'Ghazi1212', weekly: '✅ Has Met', prs: 10, reviews: 20, weeks: 0, promote: true },
    { reviewer: 'jaissica', weekly: '❌ Has not Met', prs: 10, reviews: 7, weeks: 2, promote: false },
  ];

  const existingMembers = [
    { reviewer: 'SunilKotte', weekly: '❌ Has not Met', prs: 7, reviews: 7, weeks: 1, promote: false },
    { reviewer: '20Chen7', weekly: '❌ Has not Met', prs: 10, reviews: 10, weeks: 1, promote: false },
    { reviewer: '666saofeng', weekly: '✅ Has Met', prs: 10, reviews: 20, weeks: 0, promote: true },
    { reviewer: 'aaronleechan', weekly: '❌ Has not Met', prs: 10, reviews: 8, weeks: 1, promote: false },
    { reviewer: 'AaronPersaud', weekly: '❌ Has not Met', prs: 7, reviews: 5, weeks: 1, promote: false },
  ];

  const renderTable = (title, data) => (
    <div className="promo-table-wrapper">
      <h2 className="promo-subtitle">{title}</h2>
      <table className="promo-table">
        <thead>
          <tr>
            <th>Reviewer</th>
            <th>Weekly Requirements</th>
            <th>Required PRs</th>
            <th>Total Reviews</th>
            <th>Remaining Weeks</th>
            <th>Promote?</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => (
            <tr key={idx}>
              <td>{r.reviewer}</td>
              <td>{r.weekly}</td>
              <td>{r.prs}</td>
              <td>{r.reviews}</td>
              <td>{r.weeks}</td>
              <td className="promo-text-center">
                <input type="checkbox" checked={r.promote} disabled={!r.promote} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="promo-container">
      <h1 className="promo-title">Promotion Eligibility</h1>
      {renderTable('New Members', newMembers)}
      {renderTable('Existing Members', existingMembers)}
    </div>
  );
}

export default PromotionEligibility;