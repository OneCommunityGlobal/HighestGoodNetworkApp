import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllFAQs } from '../Faq/api';
import styles from './FAQSection.module.css';

function FAQSection() {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllFAQs();
        // Filter out the video question if it exists in the DB
        const filteredFaqs = res.data.filter(
          faq => faq.question.toLowerCase() !== 'what is it like working with us?',
        );
        setFaqs(filteredFaqs);
      } catch (error) {
        toast.error('Error fetching categories');
      }
    };
    fetchCategories();
  }, []);

  // Hardcoded video FAQ
  const videoFaq = {
    question: 'What is it like working with us?',
    isVideo: true,
    videoUrl: 'https://www.youtube.com/embed/L7MUY0IJ4FY',
  };

  // Exclude questions 22 and 23 (1-based). These correspond to indices 21 and 22 (0-based).
  const displayedFaqs = faqs.filter((_, index) => index !== 21 && index !== 22);

  return (
    <div className={styles.faqContainer}>
      <h2>Please read this before applying / FAQ</h2>
      <div className={styles.faqTwoColumn}>
        {/* Left column: FAQ list */}
        <div className={styles.faqLeft}>
          {displayedFaqs.map((faq, idx) => (
            <div key={faq._id} className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <strong>
                  {idx + 1}. {faq.question}
                </strong>
              </div>
              <div className={styles.faqAnswer} dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </div>
          ))}
        </div>
        {/* Right column: Video FAQ */}
        <div className={styles.faqRight}>
          <div className={styles.faqItem}>
            <div className={styles.faqQuestion}>
              <strong>{videoFaq.question}</strong>
            </div>
            <div className={styles.videoWrapper}>
              <iframe
                className={styles.videoIframe}
                src={videoFaq.videoUrl}
                title={videoFaq.question}
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
