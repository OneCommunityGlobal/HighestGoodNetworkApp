import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ImageCarousel.module.css';

const getClassNames = (baseClass, darkClass, darkMode) =>
  `${baseClass} ${darkMode ? darkClass : ''}`;

export default function ImageCarousel({ images, darkMode = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0)
    return (
      <p className={getClassNames('', styles['no-images--dark'], darkMode)}>No images available</p>
    );

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleIndicatorClick = index => {
    setCurrentIndex(index);
  };

  return (
    <div
      className={getClassNames(
        styles.carouselContainer,
        styles['carouselContainer--dark'],
        darkMode,
      )}
    >
      <div className={styles.carouselWrapper}>
        <div
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <img
              key={image}
              className={styles.carouselImage}
              src={image}
              alt={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        className={`${getClassNames(styles.imgArrow, styles['imgArrow--dark'], darkMode)} ${
          styles.left
        }`}
        onClick={handlePrev}
      >
        ❮
      </button>
      <button
        type="button"
        className={`${getClassNames(styles.imgArrow, styles['imgArrow--dark'], darkMode)} ${
          styles.right
        }`}
        onClick={handleNext}
      >
        ❯
      </button>
      <div className={styles.carouselIndicators}>
        {images.map((image, index) => (
          <span
            key={image}
            role="button"
            tabIndex={0}
            className={`${getClassNames(styles.indicator, styles['indicator--dark'], darkMode)} ${
              index === currentIndex
                ? getClassNames(styles.active, styles['active--dark'], darkMode)
                : ''
            }`}
            onClick={() => handleIndicatorClick(index)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleIndicatorClick(index);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

ImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  darkMode: PropTypes.bool,
};
