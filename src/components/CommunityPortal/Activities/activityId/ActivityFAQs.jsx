import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { debounce } from 'lodash';
import { FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './ActivityFAQs.module.css';

function ActivityFAQs() {
  const { activityid } = useParams();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFAQs, setFilteredFAQs] = useState([]);

  useEffect(() => {
    // TODO: Fetch FAQs for this specific activity/event
    // For now, using mock data
    const mockFAQs = [
      {
        id: 1,
        question: 'Lorem ipsum odor amet, consectetuer adipiscing elit?',
        answer:
          'Tellus ullamcorper nascetur mattis condimentum nisi. Montes luctus luctus erat nunc netus primis ridiculus efficitur.',
        category: 'General',
      },
      {
        id: 2,
        question: 'Lorem ipsum odor amet, consectetuer adipiscing elit ?',
        answer: 'This is a sample answer to the FAQ.',
        category: 'Registration',
      },
      {
        id: 3,
        question: 'Lorem ipsum odor amet, consectetuer adipiscing elit ?',
        answer: 'This is a sample answer to the FAQ.',
        category: 'General',
      },
      {
        id: 4,
        question: 'Lorem ipsum odor amet, consectetuer adipiscing elit ?',
        answer: 'This is a sample answer to the FAQ.',
        category: 'Registration',
      },
      {
        id: 5,
        question: 'Lorem ipsum odor amet, consectetuer adipiscing elit ?',
        answer: 'This is a sample answer to the FAQ.',
        category: 'General',
      },
      {
        id: 6,
        question: 'Lorem ipsum odor amet, consectetuer adipiscing elit ?',
        answer: 'This is a sample answer to the FAQ.',
        category: 'Registration',
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setFaqs(mockFAQs);
      setLoading(false);
    }, 500);
  }, [activityid]);

  const toggleFAQ = faqId => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  // Get unique categories for filters
  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query, category, allFaqs) => {
      let filtered = allFaqs;

      // Apply category filter
      if (category !== 'All') {
        filtered = filtered.filter(faq => faq.category === category);
      }

      // Apply search filter
      if (query.trim()) {
        const lowerQuery = query.toLowerCase().trim();
        filtered = filtered.filter(
          faq =>
            faq.question.toLowerCase().includes(lowerQuery) ||
            faq.answer.toLowerCase().includes(lowerQuery),
        );
      }

      setFilteredFAQs(filtered);
    }, 300),
    [],
  );

  // Update filtered FAQs when search query, filter, or FAQs change
  useEffect(() => {
    if (faqs.length > 0) {
      debouncedSearch(searchQuery, selectedFilter, faqs);
    } else {
      setFilteredFAQs([]);
    }
  }, [searchQuery, selectedFilter, faqs, debouncedSearch]);

  // Handle search input change
  const handleSearchChange = e => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading FAQs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error loading FAQs: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Frequently asked questions</h1>
        <p className={styles.subtitle}>
          There are the most commonly asked questions about One Community
        </p>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Q Search"
            className={styles.searchInput}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className={styles.filterSection}>
        {categories.map(category => (
          <button
            key={category}
            type="button"
            className={`${styles.filterButton} ${
              selectedFilter === category ? styles.filterButtonActive : ''
            }`}
            onClick={() => setSelectedFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {filteredFAQs.length > 0 ? (
          <div className={styles.faqList}>
            {filteredFAQs.map(faq => (
              <div key={faq.id} className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestionButton}
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={expandedFAQ === faq.id}
                >
                  <span className={styles.faqQuestion}>{faq.question}</span>
                  {expandedFAQ === faq.id ? (
                    <FaChevronUp className={styles.faqIcon} />
                  ) : (
                    <FaChevronDown className={styles.faqIcon} />
                  )}
                </button>
                {expandedFAQ === faq.id && <div className={styles.faqAnswer}>{faq.answer}</div>}
              </div>
            ))}
          </div>
        ) : searchQuery.trim() || selectedFilter !== 'All' ? (
          <div className={styles.noFaqs}>
            No FAQs found matching your search criteria. Try adjusting your search or filters.
          </div>
        ) : (
          <div className={styles.noFaqs}>No FAQs available for this event.</div>
        )}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Still have questions? Feel free to{' '}
          <a href="#contact" className={styles.footerLink}>
            contact
          </a>{' '}
          with us!
        </p>
      </div>
    </div>
  );
}

export default ActivityFAQs;
