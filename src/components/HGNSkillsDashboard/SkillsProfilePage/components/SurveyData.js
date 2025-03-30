import { useState, useEffect } from 'react';
import axios from 'axios';

function SurveyFormDisplay() {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4500/api/hgnform'); // Your backend API endpoint
        const data = response.data;
        console.log(data);
        if (!data) throw new Error('Failed to fetch data'); // Check response.data, not response
        // Assuming you want the latest response; adjust if multiple responses needed
        setFormData(data[data.length - 1]); // Example: last submitted response
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!formData) return <p>No data available</p>;

  // Render the fetched data
  return (
    <div>
      <h2>Survey Response</h2>
      <h3>User Info</h3>
      <p>Name: {formData.userInfo.name}</p>
      <p>Email: {formData.userInfo.email}</p>
      <p>GitHub: {formData.userInfo.github || 'N/A'}</p>
      <p>Slack: {formData.userInfo.slack || 'N/A'}</p>

      <h3>General</h3>
      <p>Hours: {formData.general.hours || 'N/A'}</p>
      <p>Location: {formData.general.location || 'N/A'}</p>
      <p>Preferences: {formData.general.preferences.join(', ') || 'None'}</p>

      <h3>Frontend Skills</h3>
      <p>Overall: {formData.frontend.overall || 'N/A'}</p>
      <p>React: {formData.frontend.React || 'N/A'}</p>
      <p>Responsive UI: {formData.frontend.ResponsiveUI || 'N/A'}</p>

      <h3>Backend Skills</h3>
      <p>Overall: {formData.backend.overall || 'N/A'}</p>
      <p>MongoDB: {formData.backend.MongoDB || 'N/A'}</p>
      <p>Deployment: {formData.backend.Deployment || 'N/A'}</p>

      <h3>Follow-Up</h3>
      <p>Platform: {formData.followUp.platform || 'N/A'}</p>
      <p>Suggestions: {formData.followUp.suggestion || 'N/A'}</p>
    </div>
  );
}

export default SurveyFormDisplay;
