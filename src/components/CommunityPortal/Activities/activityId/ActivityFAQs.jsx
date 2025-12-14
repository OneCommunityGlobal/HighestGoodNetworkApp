import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ActivityFAQs.module.css';

function ActivityFAQs() {
  const { activityid } = useParams();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Fetch FAQs for this specific activity/event
    // For now, using mock data
    const mockFAQs = [
      {
        id: 1,
        question: 'What is the event about?',
        answer: 'This is a sample answer to the FAQ.',
        category: 'General',
      },
      {
        id: 2,
        question: 'How do I register?',
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
      <div className={styles.content}>
        {faqs.length > 0 ? (
          <div className={styles.faqList}>
            {faqs.map(faq => (
              <div key={faq.id} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noFaqs}>No FAQs available for this event.</div>
        )}
      </div>
    </div>
  );
}

export default ActivityFAQs;
