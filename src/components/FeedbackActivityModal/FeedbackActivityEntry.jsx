// components/FeedbackModal/FeedbackActivityEntry.jsx
import React, { useState } from 'react';
import FeedbackActivityModal from './FeedbackActivityModal';

export default function FeedbackActivityEntry() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async ({ rating, comment }) => {
    // optional: call your API here
    // await axios.post('/api/feedback', { rating, comment });
    // the modal will switch to success view automatically
  };

  return (
    <>
      <div>
        <h1>Submit Feedback</h1>
        <button
          style={{
            display: 'flex',
            displayContent: 'column',
            alignSelf: 'center',
            border: 'black 3px solid',
          }}
          onClick={() => setOpen(true)}
        >
          Open Feedback
        </button>
      </div>

      <FeedbackActivityModal isOpen={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </>
  );
}
