import { useState, useEffect } from 'react';
import '../styles/imageUrlUploader.css';

/**
 * Component for adding images via URL and previewing them
 * @param {function} onImageSelect - Callback function when image URL is valid
 * @param {number} resetKey - Key to trigger component reset
 * @returns {JSX.Element} Image URL uploader interface
 */
function ImageUrlUploader({ onImageSelect, resetKey = 0 }) {
  const [imageUrl, setImageUrl] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Resets the component when resetKey changes
   */
  useEffect(() => {
    if (resetKey > 0) {
      setImageUrl('');
      setIsValid(false);
      setError(null);
    }
  }, [resetKey]);

  /**
   * Validates the image URL by attempting to load the image
   * @param {string} url - The image URL to validate
   */
  const validateImageUrl = (url) => {
    if (!url) {
      setIsValid(false);
      setError(null);
      onImageSelect(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const img = new Image();
    
    img.onload = () => {
      setIsValid(true);
      setIsLoading(false);
      onImageSelect(url);
    };
    
    img.onerror = () => {
      setIsValid(false);
      setIsLoading(false);
      setError('Unable to load image from this URL. Please check and try again.');
      onImageSelect(null);
    };
    
    img.src = url;
  };

  /**
   * Handles changes to the URL input field
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleUrlChange = (e) => {
    const url = e.target.value.trim();
    setImageUrl(url);
    
    // Validate the URL after a short delay to prevent too many checks while typing
    const timer = setTimeout(() => {
      validateImageUrl(url);
    }, 500);
    
    return () => clearTimeout(timer);
  };

  /**
   * Removes the current image
   * @param {React.MouseEvent} e - Click event
   */
  const handleRemoveImage = (e) => {
    e.preventDefault();
    setImageUrl('');
    setIsValid(false);
    onImageSelect(null);
  };

  return (
    <div className="image-url-uploader">
      <div className="url-input-container">
        <input
          type="url"
          value={imageUrl}
          onChange={handleUrlChange}
          placeholder="Enter image URL (https://example.com/image.jpg)"
          className="url-input"
        />
        {isValid && (
          <button
            type="button"
            className="clear-url-button"
            onClick={handleRemoveImage}
          >
            ×
          </button>
        )}
      </div>
      
      <div className="image-preview-box">
        {isLoading && (
          <div className="image-loading">
            <div className="loading-spinner"></div>
            <p>Validating image...</p>
          </div>
        )}
        
        {error && (
          <div className="image-error">
            <p>{error}</p>
          </div>
        )}
        
        {isValid && imageUrl ? (
          <div className="image-preview-container">
            <img src={imageUrl} alt="Preview" className="image-preview" />
            <button
              type="button"
              className="remove-image"
              onClick={handleRemoveImage}
            >
              Remove
            </button>
          </div>
        ) : !isLoading && !error && (
          <div className="placeholder-content">
            <div className="image-icon">🖼️</div>
            <p>Your image preview will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUrlUploader;