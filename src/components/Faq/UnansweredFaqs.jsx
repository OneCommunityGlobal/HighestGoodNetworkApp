import React, { useState, useEffect } from 'react';
import { getUnansweredFAQs, deleteUnansweredFAQ } from './api';

function UnansweredFaqs() {
  const [unansweredFaqs, setUnansweredFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnansweredFAQs = async () => {
      try {
        const response = await getUnansweredFAQs();
        setUnansweredFaqs(response.data || []);
      } catch (error) {
        console.error('Error fetching unanswered FAQs:', error);
        setUnansweredFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnansweredFAQs();
  }, []);

  const handleMarkAsLogged = async faqId => {
    try {
      await deleteUnansweredFAQ(faqId);
      setUnansweredFaqs(prevFaqs => prevFaqs.filter(faq => faq._id !== faqId));
    } catch (error) {
      console.error('Error deleting unanswered FAQ:', error);
    }
  };

  return (
    <div>
      <h2>Unanswered FAQs</h2>
      {loading ? (
        <p>Loading unanswered FAQs...</p>
      ) : unansweredFaqs.length === 0 ? (
        <p>No unanswered FAQs found.</p>
      ) : (
        <ul>
          {unansweredFaqs.map(faq => (
            <li key={faq._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div>
                <strong>{faq.question}</strong>
                <p>Logged on: {new Date(faq.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleMarkAsLogged(faq._id)}
                style={{
                  color: 'white',
                  backgroundColor: 'green',
                  border: 'none',
                  padding: '5px 10px',
                  cursor: 'pointer',
                }}
              >
                Mark as Logged
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UnansweredFaqs;
