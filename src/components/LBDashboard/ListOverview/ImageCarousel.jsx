import { useState } from 'react';
import './ImageCarousel.css';

export default function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('');

  if (!images || images.length === 0) return <p>No images available</p>;

  const handleNext = () => {
    setDirection('right');
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
      setDirection('');
    }, 300);
  };

  const handlePrev = () => {
    setDirection('left');
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
      setDirection('');
    }, 300);
  };

  return (
    <div className="carousel-container">
      <div className={`carousel-image-container ${direction}`}>
        <img
          className="carousel-image"
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
        />
      </div>
      <button type="button" className="arrow left" onClick={handlePrev}>
        ❮
      </button>
      <button type="button" className="arrow right" onClick={handleNext}>
        ❯
      </button>
    </div>
  );
}
