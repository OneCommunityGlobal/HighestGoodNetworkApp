import { useState } from 'react';
import styles from './ImageCarousel.module.css';

export default function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return <p>No images available</p>;

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
    <div className={`${styles.carouselContainer}`}>
      <div className={`${styles.carouselWrapper}`}>
        <div
          className={`${styles.carouselTrack}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <img
              key={image}
              className={`${styles.carouselImage}`}
              src={image}
              alt={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <button type="button" className={`${styles.imgArrow} ${styles.left}`} onClick={handlePrev}>
        ❮
      </button>
      <button type="button" className={`${styles.imgArrow} ${styles.right}`} onClick={handleNext}>
        ❯
      </button>
      <div className={`${styles.carouselIndicators}`}>
        {images.map((image, index) => (
          <span
            key={image}
            role="button"
            tabIndex={0}
            className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
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
