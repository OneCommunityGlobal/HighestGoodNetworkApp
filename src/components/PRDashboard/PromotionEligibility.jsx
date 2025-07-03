import { FaSpinner } from 'react-icons/fa';
import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';

function PromotionEligibility() {
  const [loading, setLoading] = useState(true);
  // const [reviewers, setReviewers] = useState([]);
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
      <h1 className="text-xl font-bold mb-2">Promotion Eligibility</h1>
    </div>
  );
}

export default PromotionEligibility;
