import React, { useState, useEffect } from 'react';
import { getFAQHistory } from './api';

function FaqHistory({ faqId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await getFAQHistory(faqId);
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching FAQ history:', error);
      }
    }

    fetchHistory();
  }, [faqId]);

  return (
    <div>
      <h3>FAQ History</h3>
      <ul>
        {history.map((record, index) => (
          <li key={index}>
            <p>Modified by: {record.modifiedBy}</p>
            <p>Modified at: {new Date(record.modifiedAt).toLocaleString()}</p>
            <p>Previous Question: {record.previousQuestion}</p>
            <p>Previous Answer: {record.previousAnswer}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FaqHistory;
