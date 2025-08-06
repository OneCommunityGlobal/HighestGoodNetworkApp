/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useRef } from 'react';
import styles from './reviewForm.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCamera } from '@fortawesome/free-solid-svg-icons';
import { ENDPOINTS } from '../../../utils/URL';
import axios from 'axios';

import logo from '../../../assets/images/logo2.png';

function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const fileInputRef = useRef(null);

  const handleRating = starValue => {
    setRating(starValue);
  };

  const handleReviewChange = e => {
    setReview(e.target.value);
  };

  const handleFileChange = e => {
    setError('');
    const files = Array.from(e.target.files);

    // Validate each file
    const validImages = [];
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('Image file size must not exceed 5 MB.');
        return;
      }
      validImages.push(file);
    }
    // If all files are valid, update state
    setImages([...images, ...validImages]);
  };

  const handleUploadClick = () => {
    //Disabled now since storage is not implemented.
    // fileInputRef.current.click();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Check if rating is provided
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('review', review);

      // Append each image to formData
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      // Submit review to backend
      const response = await axios.post(ENDPOINTS.LB_REVIEWS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        // Reset form after successful submission
        setRating(0);
        setReview('');
        setImages([]);
        // You might want to add success message or redirect here
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className={styles['star-rating']}>
        {stars.map(star => (
          <span
            key={star}
            className={`${styles.star} ${star <= rating ? styles.active : ''}`}
            onClick={() => handleRating(star)}
            onKeyDown={e => e.key === 'Enter' && handleRating(star)}
            role="button"
            tabIndex={0}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles['payment-page']}>
      <div className={styles['logo-container']}>
        <img src={logo} alt="One Community Logo" />
      </div>

      {/* Outer card container */}
      <div className={styles['bid-container']}>
        {/* Green header bar */}
        <div className={styles.header}></div>

        {/* Inner content area */}
        <div className={styles['payment-container']}>
          {/* Gray form container */}
          <div className={styles['form-container']}>
            <div className={styles['map-link-container']}>
              <span>
                <FontAwesomeIcon icon={faMapMarkerAlt} />{' '}
                <a href="#" className={styles['property-map-link']}>
                  View on Property Map
                </a>
              </span>
            </div>
            <h1>Review</h1>

            <form onSubmit={handleSubmit}>
              <div className={styles['review-form']}>
                <div className={styles['review-container']}>
                  <textarea
                    placeholder="Write your review here..."
                    className={styles['review-textarea']}
                    value={review}
                    onChange={handleReviewChange}
                  ></textarea>
                  <button
                    type="button"
                    className={styles['upload-button']}
                    onClick={handleUploadClick}
                  >
                    <FontAwesomeIcon icon={faCamera} style={{ color: 'black' }} /> Upload images
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className={styles['rating-container']}>
                  <>
                    <h2>Choose a rating</h2>
                    <span>{renderStars()}</span>
                  </>
                </div>
                {error && <div className={styles['error-message']}>{error}</div>}
              </div>

              <div className={styles['button-container']}>
                <button type="submit" className={styles['submit-button']} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>

            <div className={styles['back-link']}>
              <a href="">{'<<'} Back to reviews</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewForm;
