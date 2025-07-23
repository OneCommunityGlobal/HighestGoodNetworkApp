import { useState, useRef, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import '../styles/imageUploader.css';

/**
 * Component for uploading and previewing Imgur post images
 * @param {function} onImageSelect - Callback function when image is selected
 * @param {number} resetKey - Key to trigger component reset
 * @returns {JSX.Element} Image uploader interface
 */
function ImageUploader({ onImageSelect, resetKey = 0 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  /**
   * Resets the component when resetKey changes
   */
  useEffect(() => {
    if (resetKey > 0) {
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [resetKey]);

  /**
   * Handles drag enter event for drag and drop functionality
   * @param {React.DragEvent} e - Drag event
   */
  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /**
   * Handles drag leave event for drag and drop functionality
   * @param {React.DragEvent} e - Drag event
   */
  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Handles drag over event for drag and drop functionality
   * @param {React.DragEvent} e - Drag event
   */
  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  /**
   * Processes selected file and creates preview URL
   * @param {File} file - Selected image file
   */
  const handleFiles = file => {
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Call the callback function with the selected file
    onImageSelect(file);
  };

  /**
   * Handles file drop event for drag and drop functionality
   * @param {React.DragEvent} e - Drop event containing files
   */
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  /**
   * Triggers file input click when upload area is clicked
   */
  const handleClick = () => {
    fileInputRef.current.click();
  };

  /**
   * Handles file selection from file input
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  return (
    <div
      className={`image-uploader ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="file-input"
      />

      {previewUrl ? (
        <div className="image-preview-container">
          <img src={previewUrl} alt="Preview" className="image-preview" />
          <button
            type="button"
            className="remove-image"
            onClick={e => {
              e.stopPropagation();
              setPreviewUrl(null);
              onImageSelect(null);
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="upload-placeholder">
          <FaPlus className="plus-icon" />
          <p>Drag an image here or click to upload</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;