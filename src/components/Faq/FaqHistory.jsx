import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getFAQHistory } from './api';

function FaqHistory() {
  const { id } = useParams();
  // console.log('useParams output:', useParams());
  // console.log('FAQ ID:', id);
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  // Dark mode colours (same as the Unanswered FAQs page), light colours unchanged
  const darkMode = useSelector(state => state.theme?.darkMode);
  const borderColor = darkMode ? '#4b5563' : '#ddd';
  const textColor = darkMode ? '#f3f4f6' : '#111827';
  const cardBackground = darkMode ? '#1f2937' : '#f9f9f9';
  const panelBackground = darkMode ? '#1f2937' : '#fff';
  const blueText = darkMode ? '#93c5fd' : '#007bff';
  const greenText = darkMode ? '#86efac' : '#28a745';
  const redText = darkMode ? '#fca5a5' : '#dc3545';

  useEffect(() => {
    let isMounted = true;

    const fetchFAQHistory = async () => {
      try {
        const response = await getFAQHistory(id);
        if (isMounted) setFaq(response.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching FAQ History:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFAQHistory();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <p>Loading FAQ...</p>;
  if (!faq) return <p>FAQ not found</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h2
        style={{
          marginBottom: '20px',
          // Thin line under the title; colour follows dark mode
          borderBottom: `1px solid ${borderColor}`,
          paddingBottom: '10px',
        }}
      >
        FAQ History
      </h2>

      <div
        style={{
          padding: '15px',
          border: `1px solid ${borderColor}`,
          borderRadius: '5px',
          backgroundColor: cardBackground,
          color: textColor,
          marginBottom: '20px',
        }}
      >
        <h3 style={{ color: blueText }}>Current Question:</h3>
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
          border: `1px solid ${borderColor}`,
          borderRadius: '5px',
          backgroundColor: panelBackground,
          color: textColor,
          marginBottom: '20px',
        }}
      >
        <h4 style={{ color: greenText }}>Created By:</h4>
        <p>
          <strong>User:</strong> {faq.createdBy ? faq.createdBy : 'Unknown'}
        </p>
        <p>
          <strong>Date:</strong> {new Date(faq.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Line under the heading; colour follows dark mode */}
      <h4 style={{ borderBottom: `2px solid ${borderColor}`, paddingBottom: '5px' }}>
        Change History:
      </h4>
      {faq.changeHistory && faq.changeHistory.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {faq.changeHistory.map(change => (
            <li
              key={`${change.updatedBy}-${change.updatedAt}`}
              style={{
                marginBottom: '15px',
                padding: '15px',
                border: `1px solid ${borderColor}`,
                borderRadius: '5px',
                backgroundColor: panelBackground,
                color: textColor,
              }}
            >
              <p>
                <strong>Updated By:</strong> {change.updatedBy ? change.updatedBy : 'Unknown'}
              </p>
              <p>
                <strong>Updated At:</strong> {new Date(change.updatedAt).toLocaleString()}
              </p>
              <p style={{ color: redText }}>
                <strong>Previous Question:</strong> {change.previousQuestion}
              </p>
              <p style={{ color: redText }}>
                <strong>Previous Answer:</strong> {change.previousAnswer}
              </p>
              <p style={{ color: blueText }}>
                <strong>Updated Question:</strong> {change.updatedQuestion}
              </p>
              <p style={{ color: blueText }}>
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
