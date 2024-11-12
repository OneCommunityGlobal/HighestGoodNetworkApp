import React, { useState } from 'react';
import { suggestFAQs, logUnansweredQuestion } from '../../utils/api';

function FaqSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const handleSearchChange = async e => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      try {
        const response = await suggestFAQs(query);
        setSuggestions(response.data);
        setNotFound(response.data.length === 0); // 标记未找到的结果
      } catch (error) {
        console.error('Error fetching FAQ suggestions:', error);
      }
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
        <button onClick={handleLogUnanswered}>No results. Log this question.</button>
      ) : null}
    </div>
  );
}

export default FaqSearch;
