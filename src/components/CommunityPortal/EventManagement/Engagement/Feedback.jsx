import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './Feedback.module.css';
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
    <div className={`${styles.feedbackContainer} ${darkMode ? styles.feedbackContainerDark : ''}`}>
      <h2 className={`${styles.feedbackTitle} ${darkMode ? styles.feedbackTitleDark : ''}`}>
        Feedback{' '}
        <span className={`${styles.feedbackCount} ${darkMode ? styles.feedbackCountDark : ''}`}>
          {filteredFeedback.length}
        </span>
      </h2>

      <div className={styles.feedbackHeader}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.icon} />
          <input
            type="text"
            placeholder="Search comments"
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.sortOptions}>
          <label className={`${styles.filter} ${darkMode ? styles.filterDark : ''}`}>
            Filter by:
            <select
              value={filterBy}
              onChange={handleFilterChange}
              className={styles.filterDropdown}
            >
              <option value="date">Date</option>
              <option value="rating">Rating</option>
            </select>
          </label>
          <button type="button" className={styles.sortBtn} onClick={handleSortChange}>
            Sort {sortOrder === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />}
          </button>
        </div>
      </div>

      {filteredFeedback.map(feedback => (
        <div
          key={feedback.id}
          className={`${styles.feedbackCard} ${darkMode ? styles.feedbackCardDark : ''}`}
        >
          <img alt="User" className={styles.avatar} />
          <div className={styles.feedbackContent}>
            <div className={styles.feedbackHeader}>
              <strong>{feedback.name}</strong>
              <span className={styles.feedbackDate}>{feedback.date}</span>
            </div>
            <div className={styles.feedbackRating}>{renderStars(feedback)}</div>
            <p className={`${styles.feedbackText} ${darkMode ? styles.feedbackTextDark : ''}`}>
              {feedback.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Feedback;
