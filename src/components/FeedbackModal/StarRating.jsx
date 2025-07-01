import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './StarRating.module.css';

function StarRating({ id, rating, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className={`${styles.starRating}`}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;

        return (
          <span
            key={`star-${id}-${starValue}`}
            className={`star ${starValue <= (hover || rating) ? 'filled' : 'empty'}`}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
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
