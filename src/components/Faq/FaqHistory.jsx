import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFAQHistory } from './api';

function FaqHistory() {
  const { id } = useParams();
  console.log('useParams output:', useParams());
  console.log('FAQ ID:', id);
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQHistory = async () => {
      try {
        const response = await getFAQHistory(id);
        setFaq(response.data);
      } catch (error) {
        console.error('Error fetching FAQ History:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQHistory();
  }, [id]);

  if (loading) return <p>Loading FAQ...</p>;
  if (!faq) return <p>FAQ not found</p>;

  return (
    <div>
      <h2>{faq.question}</h2>
      <p>{faq.answer}</p>
      <h4>Change History:</h4>
      {faq.changeHistory && faq.changeHistory.length > 0 ? (
        <ul>
          {faq.changeHistory.map((change, index) => (
            <li key={index}>
              <p><strong>Modified By:</strong> {change.modifiedBy}</p>
              <p><strong>Date:</strong> {new Date(change.modifiedAt).toLocaleString()}</p>
              <p><strong>Previous Question:</strong> {change.previousQuestion}</p>
              <p><strong>Previous Answer:</strong> {change.previousAnswer}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No modification history available.</p>
      )}
    </div>
  );
}

export default FaqHistory;
