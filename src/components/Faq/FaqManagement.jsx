import React, { useState } from 'react';
import { addFAQ, editFAQ } from '../../utils/api';

function FaqManagement({ editMode = false, faqToEdit = {} }) {
  const [question, setQuestion] = useState(editMode ? faqToEdit.question : '');
  const [answer, setAnswer] = useState(editMode ? faqToEdit.answer : '');

  const handleAddFAQ = async () => {
    try {
      await addFAQ(question, answer);
      alert('FAQ added successfully!');
      setQuestion('');
      setAnswer('');
    } catch (error) {
      console.error('Error adding FAQ:', error);
    }
  };

  const handleEditFAQ = async () => {
    try {
      await editFAQ(faqToEdit._id, question, answer);
      alert('FAQ updated successfully!');
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  return (
    <div>
      <h3>{editMode ? 'Edit FAQ' : 'Add FAQ'}</h3>
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
      <button onClick={editMode ? handleEditFAQ : handleAddFAQ}>
        {editMode ? 'Save Changes' : 'Add FAQ'}
      </button>
    </div>
  );
}

export default FaqManagement;
