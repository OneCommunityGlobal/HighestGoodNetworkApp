import { FaSpinner } from 'react-icons/fa';
import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';

function PromotionEligibility() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch /api/promotion-eligibility
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
      <div>
        <FaSpinner className="animate-spin" /> Loading Reviewer data...
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Promotion Eligibility</h1>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">New Members</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Reviewer</th>
              <th className="border px-2 py-1">Weekly Requirements</th>
              <th className="border px-2 py-1">Required PRs</th>
              <th className="border px-2 py-1">Total Reviews Done</th>
              <th className="border px-2 py-1">Remaining Weeks</th>
              <th className="border px-2 py-1">Promote?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">Alice</td>
              <td className="border px-2 py-1">✅ 10/10</td>
              <td className="border px-2 py-1">10</td>
              <td className="border px-2 py-1">25</td>
              <td className="border px-2 py-1">0</td>
              <td className="border px-2 py-1 text-center">
                <input type="checkbox" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Existing Members</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Reviewer</th>
              <th className="border px-2 py-1">Weekly Requirements</th>
              <th className="border px-2 py-1">Required PRs</th>
              <th className="border px-2 py-1">Total Reviews Done</th>
              <th className="border px-2 py-1">Remaining Weeks</th>
              <th className="border px-2 py-1">Promote?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">Bob</td>
              <td className="border px-2 py-1">❌ 3/5</td>
              <td className="border px-2 py-1">5</td>
              <td className="border px-2 py-1">18</td>
              <td className="border px-2 py-1">1</td>
              <td className="border px-2 py-1 text-center">
                <input type="checkbox" disabled />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PromotionEligibility;
