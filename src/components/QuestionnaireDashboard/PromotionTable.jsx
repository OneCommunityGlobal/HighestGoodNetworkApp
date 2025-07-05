import { useEffect, useState } from "react";
import axios from "axios";

const names = ['Alice', 'Bob', 'Charlie'];
const dummyMembers = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  reviewer: names[i % names.length],
  hasMetWeekly: i % 2 === 0, // Simulating weekly requirement met
  requiredPRs: 5,
  totalReviews: Math.floor(Math.random() * 10),
  remainingWeeks: Math.max(0, 4 - Math.floor(Math.random() *
  4)), // Random remaining weeks between 0 and 4
  promote: i % 3 === 0, // Randomly decide if they should be promoted
  isNew: i < 15 // First 15 are new members
}));

function PromotionTable() {
  const [eligibilityData, setEligibilityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEligibilityData();
  }, []);

  const fetchEligibilityData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/promotion-eligibility");
      setEligibilityData(response.data);
    } catch (err) {
      console.error("Failed to fetch promotion eligibility", err);
    } finally {
      setLoading(false);
    }
  };

  const renderRows = (members, isNew) =>
    members.map((user, idx) => (
      <tr key={idx}>
        <td>{isNew ? "New Members" : "Existing Members"}</td>
        <td>{user.reviewer}</td>
        <td>{user.hasMetWeekly ? "✅ Has Met" : "❌ Has not Met"}</td>
        <td>{user.requiredPRs}</td>
        <td>{user.totalReviews}</td>
        <td>{user.remainingWeeks}</td>
        <td>{user.promote ? "✔️" : "◯"}</td>
      </tr>
    ));

  const newMembers = eligibilityData.filter((u) => u.isNew);
  const existingMembers = eligibilityData.filter((u) => !u.isNew);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="promotion-table-container">
      <div className="button-group">
        <button className="action-button">Review for this week</button>
        <button className="action-button">Process Promotions</button>
      </div>
      <h2>Promotion Eligibility</h2>
      <table className="promotion-table">
        <thead>
          <tr>
            <th>New/Existing</th>
            <th>Reviewer</th>
            <th>Weekly Requirements</th>
            <th>Required PRs</th>
            <th>Total Reviews</th>
            <th>Remaining Weeks</th>
            <th>Promote?</th>
          </tr>
        </thead>
        <tbody>
          {renderRows(newMembers, true)}
          {renderRows(existingMembers, false)}
        </tbody>
      </table>
    </div>
  );
}

export default PromotionTable;