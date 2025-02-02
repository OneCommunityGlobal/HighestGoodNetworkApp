import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { addFAQ, editFAQ, getAllFAQs, deleteFAQ } from './api';

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
        console.log('Fetched FAQs:', allFAQs);

        if (isMounted) {
          setFaqs(Array.isArray(allFAQs.data) ? allFAQs.data : []);
        }
      } catch (error) {
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
      alert('FAQ added successfully!');
      setQuestion('');
      setAnswer('');

      const updatedFAQs = await getAllFAQs();
      setFaqs(Array.isArray(updatedFAQs.data) ? updatedFAQs.data : []);
    } catch (error) {
      console.error('Error adding FAQ:', error);
    }
  };

  const handleEditFAQ = async () => {
    if (!editingFAQ || !editingFAQ._id) {
      console.error('No FAQ selected for editing.');
      return;
    }

    try {
      await editFAQ(editingFAQ._id, question, answer);
      alert('FAQ updated successfully!');

      setEditingFAQ(null);
      setQuestion('');
      setAnswer('');

      const updatedFAQs = await getAllFAQs();
      setFaqs(Array.isArray(updatedFAQs.data) ? updatedFAQs.data : []);
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const handleDeleteFAQ = async faqId => {
    try {
      await deleteFAQ(faqId);
      alert('FAQ deleted successfully!');

      const updatedFAQs = await getAllFAQs();
      setFaqs(Array.isArray(updatedFAQs.data) ? updatedFAQs.data : []);
    } catch (error) {
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

  return (
    <div>
      <h2>{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</h2>
      <input
        type="text"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Enter question"
      />
      <input
        type="text"
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Enter answer"
      />
      <button onClick={editingFAQ ? handleEditFAQ : handleAddFAQ}>
        {editingFAQ ? 'Save Changes' : 'Add FAQ'}
      </button>

      <Link to="/unanswered-faqs" style={{ color: 'blue', textDecoration: 'underline' }}>
        View Unanswered Questions
      </Link>

      <h4>All FAQs</h4>
      {loading ? (
        <p>Loading FAQs...</p>
      ) : Array.isArray(faqs) && faqs.length === 0 ? (
        <p>No FAQs available at the moment. Please add new FAQs.</p>
      ) : (
        <ul>
          {Array.isArray(faqs) ? (
            faqs.map(faq => (
              <li key={faq._id}>
                <span
                  onClick={() => openFaqDetailInNewTab(faq._id)}
                  style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {faq.question}
                </span>
                <p>{faq.answer}</p>
                <Button color="primary" onClick={() => handleEditClick(faq)}>
                  Edit FAQ
                </Button>
                <Button color="danger" onClick={() => handleDeleteFAQ(faq._id)}>
                  Delete FAQ
                </Button>
              </li>
            ))
          ) : (
            <p>Error: FAQs data is not in the correct format.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default FaqManagement;
