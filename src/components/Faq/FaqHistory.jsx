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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '20px', borderBottom: 'px solid #ddd', paddingBottom: '10px' }}>
        FAQ History
      </h2>

      <div
        style={{
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          backgroundColor: '#f9f9f9',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ color: '#007bff' }}>Current Question:</h3>
        <p>
          <strong>Question:</strong> {faq.question}
        </p>
        <p>
          <strong>Answer:</strong> {faq.answer}
        </p>
      </div>

      <div
        style={{
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          backgroundColor: '#fff',
          marginBottom: '20px',
        }}
      >
        <h4 style={{ color: '#28a745' }}>Created By:</h4>
        <p>
          <strong>User:</strong> {faq.createdBy ? faq.createdBy : 'Unknown'}
        </p>
        <p>
          <strong>Date:</strong> {new Date(faq.createdAt).toLocaleString()}
        </p>
      </div>

      <h4 style={{ borderBottom: '2px', paddingBottom: '5px' }}>Change History:</h4>
      {faq.changeHistory && faq.changeHistory.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {faq.changeHistory.map((change, index) => (
            <li
              key={index}
              style={{
                marginBottom: '15px',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#fff',
              }}
            >
              <p>
                <strong>Updated By:</strong> {change.updatedBy ? change.updatedBy : 'Unknown'}
              </p>
              <p>
                <strong>Updated At:</strong> {new Date(change.updatedAt).toLocaleString()}
              </p>
              <p style={{ color: '#dc3545' }}>
                <strong>Previous Question:</strong> {change.previousQuestion}
              </p>
              <p style={{ color: '#dc3545' }}>
                <strong>Previous Answer:</strong> {change.previousAnswer}
              </p>
              <p style={{ color: '#007bff' }}>
                <strong>Updated Question:</strong> {change.updatedQuestion}
              </p>
              <p style={{ color: '#007bff' }}>
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
