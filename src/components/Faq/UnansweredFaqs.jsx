import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { getUnansweredFAQs, deleteUnansweredFAQ } from './api';

function UnansweredFaqs() {
  const [unansweredFaqs, setUnansweredFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const darkMode = useSelector(state => state.theme?.darkMode);

  useEffect(() => {
    let isMounted = true;

    const fetchUnansweredFAQs = async () => {
      try {
        const response = await getUnansweredFAQs();
        if (isMounted) setUnansweredFaqs(response.data || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching unanswered FAQs:', error);
        if (isMounted) setUnansweredFaqs([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUnansweredFAQs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkAsLogged = async faqId => {
    try {
      await deleteUnansweredFAQ(faqId);
      setUnansweredFaqs(prevFaqs => prevFaqs.filter(faq => faq._id !== faqId));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting unanswered FAQ:', error);
    }
  };

  if (loading) {
    return (
      <p style={{ textAlign: 'center', color: darkMode ? '#d1d5db' : '#666' }}>
        Loading unanswered FAQs...
      </p>
    );
  }

  if (unansweredFaqs.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: darkMode ? '#d1d5db' : '#888' }}>
        No unanswered FAQs found.
      </p>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h2 style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>Unanswered FAQs</h2>
      <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
        {unansweredFaqs.map(faq => (
          <li
            key={faq._id}
            style={{
              marginBottom: '15px',
              padding: '10px',
              border: `1px solid ${darkMode ? '#4b5563' : '#ddd'}`,
              borderRadius: '5px',
              backgroundColor: darkMode ? '#1f2937' : '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <strong style={{ color: darkMode ? '#f9fafb' : '#333', fontSize: '16px' }}>
                {faq.question}
              </strong>
              <p
                style={{ fontSize: '12px', color: darkMode ? '#d1d5db' : '#777', marginTop: '4px' }}
              >
                Logged on: {new Date(faq.createdAt).toLocaleString()}
              </p>
            </div>
            <Button color="success" onClick={() => handleMarkAsLogged(faq._id)}>
              Mark as Logged
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UnansweredFaqs;
