import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { Button } from 'reactstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllFAQs, searchFAQs, logUnansweredQuestion } from './api';
import styles from './FaqSearch.module.css';

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
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchFAQs();
    return () => { isMounted = false; };
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query) => {
        try {
          const response = await searchFAQs(query);
          setSuggestions(response.data);
          setNotFound(response.data.length === 0);
        } catch (error) {
          console.error('Error searching FAQs:', error);
        }
      }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setSuggestions(allFAQs);
      setNotFound(false);
      return;
    }

    debouncedSearch(query);
  };

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleLogUnanswered = async () => {
    if (!searchQuery.trim()) return;

    setLogging(true);
    try {
      const response = await logUnansweredQuestion(searchQuery);
      const { message, emailSent, emailNote } = response?.data || {};

      toast.success(message || 'Your question has been recorded.');
      if (emailSent === false && emailNote) toast.warn(emailNote);
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || '';

      if (status === 409) {
        toast.warn(msg || 'This question is already logged.');
        return;
      }

      toast.error(msg || 'Failed to log question.');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Frequently Asked Questions</h2>

      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search FAQs"
        className={styles.searchInput}
      />

      {suggestions.length > 0 && (
        <ul className={styles.faqList}>
          {suggestions.map((faq) => (
            <li key={faq._id} className={styles.faqItem}>
              <button
                type="button"
                onClick={() => toggleFAQ(faq._id)}
                className={`${styles.faqButton} ${
                  expandedFAQ === faq._id ? styles.faqButtonExpanded : ''
                }`}
              >
                <strong>{faq.question}</strong>
                {expandedFAQ === faq._id ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {expandedFAQ === faq._id && (
                <div className={styles.answerBox}>
                  <p>{faq.answer}</p>
                  <p>
                    <a
                      href="https://onecommunityglobal.org/collaboration/"
                      target="_blank"
                      rel="noopener noreferrer"
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
        <div className={styles.noResults}>
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
