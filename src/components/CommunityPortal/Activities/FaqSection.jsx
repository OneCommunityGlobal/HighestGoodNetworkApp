import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './FaqSection.module.css';

function FaqSection() {
  const faqs = [
    {
      id: 1,
      question: 'What is One Community?',
      answer:
        'One Community is a global nonprofit organization focused on creating sustainable living models and open-source solutions for a better world.',
      category: 'General',
    },
    {
      id: 2,
      question: 'How can I participate?',
      answer:
        'You can participate by volunteering, donating, or joining our collaborative projects in various fields like engineering, design, and education.',
      category: 'Participation',
    },
    {
      id: 3,
      question: 'Is One Community free to join?',
      answer:
        'Yes, joining One Community is completely free. We welcome anyone interested in sustainability and positive global change.',
      category: 'General',
    },
    {
      id: 4,
      question: 'How can I contact One Community?',
      answer:
        "You can contact us by clicking on the 'Contact Us' link below. Our team will respond as soon as possible.",
      category: 'Other',
    },
    {
      id: 5,
      question: 'What kind of events does One Community organize?',
      answer:
        'We organize workshops, webinars, sustainability summits, and community-building events throughout the year.',
      category: 'Events',
    },
    {
      id: 6,
      question: 'Where is One Community located?',
      answer:
        'One Community is a virtual and physical initiative with a developing sustainable village model in the United States.',
      category: 'Other',
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);

  const toggleFaq = id => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const handleContactClick = () => {
    const email = 'onecommunityglobal@gmail.com';
    navigator.clipboard
      .writeText(email)
      .then(() => setCopied(true))
      // eslint-disable-next-line no-console
      .catch(err => console.error('Failed to copy:', err));

    setTimeout(() => setCopied(false), 2000);
  };

  const handleCategoryClick = category => {
    setSelectedCategory(category);
    setOpenIndex(null);
  };

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    setOpenIndex(null);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.faqContainer}>
      <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
      <p className={styles.faqSubtitle}>
        These are the most frequently asked questions about One Community.
      </p>

      <input
        type="text"
        className={`${styles.faqSearch} ${darkMode ? styles.faqSearchDark : ''}`}
        placeholder="Search FAQs..."
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <div className={styles.faqButtons}>
        {['All', 'General', 'Events', 'Participation', 'Other'].map(category => (
          <button
            key={category}
            type="button"
            className={`${styles.faqCategory} ${
              selectedCategory === category ? styles.active : ''
            } ${darkMode ? styles.faqCategoryDark : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.faqList}>
        {filteredFaqs.length === 0 ? (
          <div className={styles.noResults}>
            <p>No FAQs found matching your criteria.</p>
          </div>
        ) : (
          filteredFaqs.map(faq => (
            <div key={faq.id} className={styles.faqItem}>
              <button
                type="button"
                className={`${styles.faqQuestion} ${darkMode ? styles.faqQuestionDark : ''}`}
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={openIndex === faq.id}
              >
                {faq.question}
                <span className={`${styles.faqArrow} ${openIndex === faq.id ? styles.open : ''}`}>
                  &#9662;
                </span>
              </button>
              <div className={`${styles.faqAnswer} ${openIndex === faq.id ? styles.open : ''}`}>
                <div>{faq.answer}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <p className={styles.faqContact}>
        Still have questions? Feel free to{' '}
        <button type="button" className={styles.contactLink} onClick={handleContactClick}>
          contact us
        </button>
        .{copied && <span className={styles.copiedMessage}> Copied!</span>}
      </p>
    </div>
  );
}

export default FaqSection;
