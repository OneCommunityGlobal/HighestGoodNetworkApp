import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getAllFAQs } from '../Faq/api';
import styles from './FAQSection.module.css';

// Held here rather than in the database so the section always has something to
// show, including for visitors who cannot load the questions.
const VIDEO_FAQ = {
  question: 'What is it like working with us?',
  videoUrl: 'https://www.youtube.com/embed/L7MUY0IJ4FY',
};

function FAQSection() {
  const [faqs, setFaqs] = useState([]);
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await getAllFAQs();
        setFaqs(
          res.data.filter(
            faq => faq.question.trim().toLowerCase() !== VIDEO_FAQ.question.toLowerCase(),
          ),
        );
      } catch (error) {
        // This page is public but GET /faqs requires a token, so a signed-out
        // visitor gets a 401 here. Show an inline note rather than a toast,
        // which would otherwise fire on every anonymous page load.
        if (error.response?.status === 401) {
          setRequiresSignIn(true);
        } else {
          toast.error('Error fetching FAQs');
        }
      }
    };
    fetchFaqs();
  }, []);

  return (
    <div
      className={`${styles.faqContainer} ${darkMode ? styles.dark : ''}`}
      data-testid="faq-section"
    >
      <h2>Please read this before applying / FAQ</h2>
      <div className={styles.faqTwoColumn}>
        {/* Left column: FAQ list */}
        <div className={styles.faqLeft}>
          {requiresSignIn ? (
            <p className={styles.faqNotice}>Sign in to read the frequently asked questions.</p>
          ) : (
            faqs.map((faq, idx) => (
              <div key={faq._id} className={styles.faqItem}>
                <div className={styles.faqQuestion}>
                  <strong>
                    {idx + 1}. {faq.question}
                  </strong>
                </div>
                <div
                  className={styles.faqAnswer}
                  // Answers are authored by admins through FAQ management and may
                  // contain formatting, so they are rendered as HTML. Sanitised
                  // because this page is reachable without signing in.
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer || '') }}
                />
              </div>
            ))
          )}
        </div>
        {/* Right column: Video FAQ */}
        <div className={styles.faqRight}>
          <div className={styles.faqItem}>
            <div className={styles.faqQuestion}>
              <strong>{VIDEO_FAQ.question}</strong>
            </div>
            <div className={styles.videoWrapper}>
              <iframe
                className={styles.videoIframe}
                src={VIDEO_FAQ.videoUrl}
                title={VIDEO_FAQ.question}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQSection;
