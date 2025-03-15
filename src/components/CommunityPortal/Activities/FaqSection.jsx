import { useState } from 'react';
import './FaqSection.css';

function FaqSection() {
  const faqs = [
    {
      id: 1,
      question: 'What is One Community?',
      answer:
        'One Community is a global nonprofit organization focused on creating sustainable living models and open-source solutions for a better world.',
    },
    {
      id: 2,
      question: 'How can I participate?',
      answer:
        'You can participate by volunteering, donating, or joining our collaborative projects in various fields like engineering, design, and education.',
    },
    {
      id: 3,
      question: 'Is One Community free to join?',
      answer:
        'Yes, joining One Community is completely free. We welcome anyone interested in sustainability and positive global change.',
    },
    {
      id: 4,
      question: 'How can I contact One Community?',
      answer:
        "You can contact us by clicking on the 'Contact Us' link below. Our team will respond as soon as possible.",
    },
    {
      id: 5,
      question: 'What kind of events does One Community organize?',
      answer:
        'We organize workshops, webinars, sustainability summits, and community-building events throughout the year.',
    },
    {
      id: 6,
      question: 'Where is One Community located?',
      answer:
        'One Community is a virtual and physical initiative with a developing sustainable village model in the United States.',
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const [copied, setCopied] = useState(false);

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

    setTimeout(() => setCopied(false), 2000); // Hide message after 2 sec
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <p className="faq-subtitle">
        These are the most frequently asked questions about One Community.
      </p>

      <input type="text" className="faq-search" placeholder="Search FAQs..." />

      <div className="faq-buttons">
        <button type="button" className="faq-category">
          General
        </button>
        <button type="button" className="faq-category">
          Events
        </button>
        <button type="button" className="faq-category">
          Participation
        </button>
        <button type="button" className="faq-category">
          Other
        </button>
      </div>

      <div className="faq-list">
        {faqs.map(faq => (
          <div key={faq.id} className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(faq.id)}>
              {faq.question}
              <span className={`faq-arrow ${openIndex === faq.id ? 'open' : ''}`}>&#9662;</span>
            </div>
            {openIndex === faq.id && <div className="faq-answer">{faq.answer}</div>}
          </div>
        ))}
      </div>

      <p className="faq-contact">
        Still have questions? Feel free to{' '}
        <span className="contact-link" onClick={handleContactClick}>
          contact us
        </span>
        .{copied && <span className="copied-message"> Copied!</span>}
      </p>
    </div>
  );
}

export default FaqSection;
