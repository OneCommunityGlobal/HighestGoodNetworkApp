import { useState, useRef, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';

function ImageUploader({ onImageSelect, resetKey = 0 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (resetKey > 0) {
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [resetKey]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file) => {
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Call the callback function with the selected file
    onImageSelect(file);
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
            className="remove-image" 
            onClick={(e) => {
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