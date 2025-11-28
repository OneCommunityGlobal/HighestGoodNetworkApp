import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { Button } from 'reactstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllFAQs, searchFAQs, logUnansweredQuestion } from './api';

toast.configure();

function FaqSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allFAQs, setAllFAQs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [logging, setLogging] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFAQs = async () => {
      try {
        const response = await getAllFAQs();
        if (isMounted) {
          setAllFAQs(response.data);
          setSuggestions(response.data);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchFAQs();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchSuggestions = debounce(async query => {
    try {
      const response = await searchFAQs(query);
      setSuggestions(response.data);
      setNotFound(response.data.length === 0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching FAQ suggestions:', error);
    }
  }, 300);

  const handleSearchChange = e => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 1) {
      fetchSuggestions(query);
    } else {
      setSuggestions(allFAQs);
      setNotFound(false);
    }
  };

  const toggleFAQ = faqId => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

 const handleLogUnanswered = async () => {
  if (!searchQuery.trim()) return;

  setLogging(true);
  try {
    const response = await logUnansweredQuestion(searchQuery);
    const { message, emailSent, emailNote } = response?.data || {};

    toast.success(message || 'Your question has been recorded.');

    // show a warning toast if owners not emailed
    if (emailSent === false && emailNote) {
      toast.warn(emailNote);
    }
  } catch (error) {
    const status = error?.response?.status;
    const msg = (error?.response?.data?.message || '').toString();
    if (status === 409) {
      toast.error(msg || 'This question is already logged.');
      return;
    }

    // If backend complains about missing owner email, treat as success + warning
    if (/owner/i.test(msg) && /email/i.test(msg)) {
      toast.success('Your question has been recorded.');
      toast.warn(msg || 'Owner email not configured; email skipped.');
      return;
    }

    toast.error(msg || 'Failed to log question.');
  } finally {
    setLogging(false);
  }
};

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Frequently Asked Questions</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search FAQs"
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      />

      {suggestions.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {suggestions.map(faq => (
            <li key={faq._id} style={{ marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => toggleFAQ(faq._id)}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  backgroundColor: expandedFAQ === faq._id ? '#e0e0e0' : '#f9f9f9',
                  transition: 'background-color 0.3s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  textAlign: 'left',
                }}
                aria-expanded={expandedFAQ === faq._id}
                aria-controls={`faq-answer-${faq._id}`}
              >
                <strong>{faq.question}</strong>
                {expandedFAQ === faq._id ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {expandedFAQ === faq._id && (
                <div
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    marginTop: '5px',
                    backgroundColor: '#fff',
                  }}
                >
                  <p>{faq.answer}</p>
                  <p>
                    <a
                      href="https://onecommunityglobal.org/collaboration/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#007bff', textDecoration: 'underline' }}
                    >
                      Visit here to learn more
                    </a>
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {notFound && (
        <div style={{ textAlign: 'center' }}>
          <p>No results found.</p>
          <Button color="primary" onClick={handleLogUnanswered} disabled={logging}>
            {logging ? 'Logging...' : 'Log this question and notify Owner'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default FaqSearch;
