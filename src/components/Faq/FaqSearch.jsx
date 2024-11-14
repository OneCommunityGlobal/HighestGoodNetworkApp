import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { searchFAQs, logUnansweredQuestion } from './api';

function FaqSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const fetchSuggestions = debounce(async query => {
    try {
      const response = await searchFAQs(query);
      setSuggestions(response.data);
      setNotFound(response.data.length === 0);
    } catch (error) {
      console.error('Error fetching FAQ suggestions:', error);
    }
  }, 300);

  const handleSearchChange = e => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
      setNotFound(false);
    }
  };

  const handleLogUnanswered = async () => {
    try {
      await logUnansweredQuestion(searchQuery);
      alert('Your question has been recorded and will be reviewed.');
    } catch (error) {
      console.error('Error logging unanswered question:', error);
    }
  };

  return (
    <div>
      <h2>Frequently Asked Questions</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search FAQs"
      />
      {suggestions.length > 0 ? (
        <ul>
          {suggestions.map(faq => (
            <li key={faq._id}>{faq.question}</li>
          ))}
        </ul>
      ) : notFound ? (
        <div>
          <p>No results found.</p>
          <button onClick={handleLogUnanswered}>Log this question</button>
        </div>
      ) : null}
    </div>
  );
}

export default FaqSearch;
