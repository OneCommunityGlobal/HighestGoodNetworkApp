import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from './StarRating.module.css';

function StarRating({ id, rating, onChange }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [hover, setHover] = useState(0);

  return (
    <div className={`${styles.starRating} ${darkMode ? styles.darkMode : ''}`}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;

        return (
          <button
            key={`star-${id}-${starValue}`}
            type="button"
            className={`${styles.star} ${
              starValue <= (hover || rating) ? styles.filled : styles.empty
            }`}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

StarRating.propTypes = {
  id: PropTypes.number.isRequired,
  rating: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default StarRating;
