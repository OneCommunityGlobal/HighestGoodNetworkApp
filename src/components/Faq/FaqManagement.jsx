import { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addFAQ, editFAQ, getAllFAQs, deleteFAQ } from './api';

toast.configure();

function FaqManagement({ editMode = false, faqToEdit = {} }) {
  const [question, setQuestion] = useState(editMode ? faqToEdit.question : '');
  const [answer, setAnswer] = useState(editMode ? faqToEdit.answer : '');
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFAQ, setEditingFAQ] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFAQs = async () => {
      try {
        const allFAQs = await getAllFAQs();

        if (isMounted) {
          setFaqs(Array.isArray(allFAQs.data) ? allFAQs.data : []);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching FAQs:', error);
        if (isMounted) setFaqs([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFAQs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddFAQ = async () => {
    try {
      await addFAQ(question, answer);
      toast.success('FAQ added successfully!');
      setQuestion('');
      setAnswer('');

      const updatedFAQs = await getAllFAQs();
      setFaqs(Array.isArray(updatedFAQs.data) ? updatedFAQs.data : []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding FAQ:', error);
    }
  };

  const handleEditFAQ = async () => {
    if (!editingFAQ || !editingFAQ._id) {
      // eslint-disable-next-line no-console
      console.error('No FAQ selected for editing.');
      return;
    }

    try {
      await editFAQ(editingFAQ._id, question, answer);
      toast.success('FAQ updated successfully!');

      setEditingFAQ(null);
      setQuestion('');
      setAnswer('');

      const updatedFAQs = await getAllFAQs();
      setFaqs(Array.isArray(updatedFAQs.data) ? updatedFAQs.data : []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating FAQ:', error);
    }
  };

  const handleDeleteFAQ = async faqId => {
    try {
      await deleteFAQ(faqId);
      toast.success('FAQ deleted successfully!');

      const updatedFAQs = await getAllFAQs();
      setFaqs(Array.isArray(updatedFAQs.data) ? updatedFAQs.data : []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting FAQ:', error);
    }
  };

  const handleEditClick = faq => {
    setEditingFAQ(faq); // Set the currently selected FAQ to be edited
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  const openFaqDetailInNewTab = faqId => {
    window.open(`/faqs/${faqId}/history`, '_blank');
  };

  let content;
  if (loading) {
    content = <p>Loading FAQs...</p>;
  } else if (!faqs || faqs.length === 0) {
    content = <p>No FAQs available at the moment. Please add new FAQs.</p>;
  } else {
    content = (
      <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
        {faqs.map(faq => (
          <li
            key={faq._id}
            style={{
              marginBottom: '15px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
            }}
          >
            <span
              onClick={() => openFaqDetailInNewTab(faq._id)}
              style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {faq.question}
            </span>
            <p>{faq.answer}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <Button color="primary" onClick={() => handleEditClick(faq)}>
                Edit FAQ
              </Button>
              <Button color="danger" onClick={() => handleDeleteFAQ(faq._id)}>
                Delete FAQ
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h2>{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Enter question"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Enter answer"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <Button color="primary" onClick={editingFAQ ? handleEditFAQ : handleAddFAQ}>
          {editingFAQ ? 'Save Changes' : 'Add FAQ'}
        </Button>
      </div>

      <Link
        to="/unanswered-faqs"
        style={{
          display: 'block',
          margin: '20px 0',
          color: '#007bff',
          textDecoration: 'underline',
        }}
      >
        View Unanswered Questions
      </Link>

      <h4>All FAQs</h4>
      {content}
    </div>
  );
}

export default FaqManagement;
