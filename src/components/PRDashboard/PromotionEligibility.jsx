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
        // const response = await axios.get(ENDPOINTS.PromotionEligibility);
        // setReviewers(response.data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch reviewer data.');
        setError('Error loading reviewer data.');
      }
    };

    fetchReviewerData();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <FaSpinner className="spinner" />
        <div>Loading Reviewer data...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="screen-container">
      <h1 className="title">Promotion Eligibility</h1>

      <div className="table-container">
        <div>
          <h2 className="subtitle">New Members</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Weekly Requirements</th>
                <th>Required PRs</th>
                <th>Total Reviews Done</th>
                <th>Remaining Weeks</th>
                <th>Promote?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Alice</td>
                <td>✅ 10/10</td>
                <td>10</td>
                <td>25</td>
                <td>0</td>
                <td className="text-center">
                  <input type="checkbox" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-container">
        <div>
          <h2 className="subtitle">Existing Members</h2>
          <table className="styled-table">
            <thead>
              <tr className="header-row">
                <th>Reviewer</th>
                <th>Weekly Requirements</th>
                <th>Required PRs</th>
                <th>Total Reviews Done</th>
                <th>Remaining Weeks</th>
                <th>Promote?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bob</td>
                <td>❌ 3/5</td>
                <td>5</td>
                <td>18</td>
                <td>1</td>
                <td className="text-center">
                  <input type="checkbox" disabled />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PromotionEligibility;
