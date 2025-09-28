import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './Feedback.css';
import { FaSearch } from 'react-icons/fa';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

const dummyFeedback = [
  {
    id: 1,
    name: 'Oliver Bennett',
    rating: 4,
    comment: 'Great service and quick response!',
    date: '2025-01-24',
  },
  {
    id: 2,
    name: 'James Carter',
    rating: 5,
    comment: 'Loved the experience! Very professional team.',
    date: '2025-01-22',
  },
];

function Feedback() {
  const [feedbackList] = useState(dummyFeedback);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // Placeholder for API call to fetch feedback data
  }, []);

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = event => {
    setFilterBy(event.target.value);
  };

  const handleSortChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderStars = feedback => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={`star-${feedback.id}-${i}`}>
        {i < feedback.rating ? <AiFillStar /> : <AiOutlineStar />}
      </span>
    ));
  };

  const filteredFeedback = feedbackList
    .filter(
      feedback =>
        feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (filterBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (filterBy === 'rating') {
        return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }
      return 0;
    });

  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`feedback-container ${darkMode ? 'feedback-container-dark' : ''}`}>
      <h2 className={`feedback-title ${darkMode ? 'feedback-title-dark' : ''}`}>
        Feedback{' '}
        <span className={`feedback-count ${darkMode ? 'feedback-count-dark' : ''}`}>
          {filteredFeedback.length}
        </span>
      </h2>

      <div className="feedback-header">
        <div className="search-container">
          <FaSearch className="icon" />
          <input
            type="text"
            placeholder="Search comments"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="sort-options">
          <label className={`filter ${darkMode ? 'filter-dark' : ''}`}>
            Filter by:
            <select value={filterBy} onChange={handleFilterChange} className="filter-dropdown">
              <option value="date">Date</option>
              <option value="rating">Rating</option>
            </select>
          </label>
          <button type="button" className="sort-btn" onClick={handleSortChange}>
            Sort {sortOrder === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />}
          </button>
        </div>
      </div>

      {filteredFeedback.map(feedback => (
        <div key={feedback.id} className={`feedback-card ${darkMode ? 'feedback-card-dark' : ''}`}>
          <img alt="User" className="avatar" />
          <div className="feedback-content">
            <div className="feedback-header">
              <strong>{feedback.name}</strong>
              <span className="feedback-date">{feedback.date}</span>
            </div>
            <div className="feedback-rating">{renderStars(feedback)}</div>
            <p className={`feedback-text ${darkMode ? 'feedback-text-dark' : ''}`}>
              {feedback.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Feedback;
