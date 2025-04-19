import { useState } from 'react';
import './ImageCarousel.css';

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
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <img key={image} className="carousel-image" src={image} alt={`Slide ${index + 1}`} />
          ))}
        </div>
      </div>
      <button type="button" className="arrow left" onClick={handlePrev}>
        ❮
      </button>
      <button type="button" className="arrow right" onClick={handleNext}>
        ❯
      </button>
      <div className="carousel-indicators">
        {images.map((image, index) => (
          <span
            key={image}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleIndicatorClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
