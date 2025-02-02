import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFAQHistory } from './api';

function FaqHistory() {
  const { id } = useParams();
  // console.log('useParams output:', useParams());
  // console.log('FAQ ID:', id);
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQHistory = async () => {
      try {
        const response = await getFAQHistory(id);
        setFaq(response.data);
        console.log('FAQ History:', response.data);
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
      <h2>FAQ History</h2>

      <h3>Current Question:</h3>
      <p>
        <strong>Question:</strong> {faq.question}
      </p>
      <p>
        <strong>Answer:</strong> {faq.answer}
      </p>

      <h4>Created By:</h4>
      <p>
        <strong>User:</strong> {faq.createdBy ? faq.createdBy : 'Unknown'}
      </p>
      <p>
        <strong>Date:</strong> {new Date(faq.createdAt).toLocaleString()}
      </p>
      <h4>Change History:</h4>
      {faq.changeHistory && faq.changeHistory.length > 0 ? (
        <ul>
          {faq.changeHistory.map((change, index) => (
            <li key={index}>
              <p>
                <strong>Updated By:</strong> {change.updatedBy ? change.updatedBy : 'Unknown'}
              </p>
              <p>
                <strong>Updated At:</strong> {new Date(change.updatedAt).toLocaleString()}
              </p>
              <p>
                <strong>Previous Question:</strong> {change.previousQuestion}
              </p>
              <p>
                <strong>Previous Answer:</strong> {change.previousAnswer}
              </p>
              <p>
                <strong>Updated Question:</strong> {change.updatedQuestion}
              </p>
              <p>
                <strong>Updated Answer:</strong> {change.updatedAnswer}
              </p>
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
