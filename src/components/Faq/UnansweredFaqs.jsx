import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h2>Unanswered FAQs</h2>
      {loading ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Loading unanswered FAQs...</p>
      ) : unansweredFaqs.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No unanswered FAQs found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          {unansweredFaqs.map(faq => (
            <li
              key={faq._id}
              style={{
                marginBottom: '15px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#333', fontSize: '16px' }}>{faq.question}</strong>
                <p style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
                  Logged on: {new Date(faq.createdAt).toLocaleString()}
                </p>
              </div>
              <Button color="success" onClick={() => handleMarkAsLogged(faq._id)}>
                Mark as Logged
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UnansweredFaqs;
