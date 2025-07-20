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
    {
      reviewer: 'Akshay - Jayaram',
      weekly: '✅ Has Met',
      prs: 10,
      reviews: 20,
      weeks: 0,
      promote: true,
    },
    {
      reviewer: 'Ghazi1212',
      weekly: '✅ Has Met',
      prs: 10,
      reviews: 20,
      weeks: 0,
      promote: true,
    },
    {
      reviewer: 'jaissica',
      weekly: '❌ Has not Met',
      prs: 10,
      reviews: 7,
      weeks: 2,
      promote: false,
    },
  ];

  const existingMembers = [
    {
      reviewer: 'SunilKotte',
      weekly: '❌ Has not Met',
      prs: 7,
      reviews: 7,
      weeks: 1,
      promote: false,
    },
    {
      reviewer: '20Chen7',
      weekly: '❌ Has not Met',
      prs: 10,
      reviews: 10,
      weeks: 1,
      promote: false,
    },
    {
      reviewer: '666saofeng',
      weekly: '✅ Has Met',
      prs: 10,
      reviews: 20,
      weeks: 0,
      promote: true,
    },
    {
      reviewer: 'aaronleechan',
      weekly: '❌ Has not Met',
      prs: 10,
      reviews: 8,
      weeks: 1,
      promote: false,
    },
    {
      reviewer: 'AaronPersaud',
      weekly: '❌ Has not Met',
      prs: 7,
      reviews: 5,
      weeks: 1,
      promote: false,
    },
  ];

  const renderGroupRows = (label, members) => [
    <tr key={label} className="promo-group-row">
      <td colSpan="7" className="promo-group-header">
        {label}
      </td>
    </tr>,
    ...members.map(r => (
      <tr key={r.reviewer}>
        <td>{r.reviewer}</td>
        <td>{r.weekly}</td>
        <td>{r.prs}</td>
        <td>{r.reviews}</td>
        <td>{r.weeks}</td>
        <td className="promo-text-center">
          <input type="checkbox" checked={r.promote} disabled={!r.promote} />
        </td>
      </tr>
    )),
  ];

  return (
    <div className="promo-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="promo-title">Promotion Eligibility</h1>
      <div
        className="promo-controls"
        style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}
      >
        <button type="button" className="promo-button">
          Review for this week
        </button>
        <button type="button" className="promo-button">
          Process Promotions
        </button>
      </div>
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
          {renderGroupRows('New Members', newMembers)}
          {renderGroupRows('Existing Members', existingMembers)}
        </tbody>
      </table>
    </div>
  );
}

export default PromotionEligibility;
