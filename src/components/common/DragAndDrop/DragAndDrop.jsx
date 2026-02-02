/* eslint-disable react/function-component-definition */
import { useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import styles from './DragAndDrop.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faUpload } from '@fortawesome/free-solid-svg-icons';

const DragAndDrop = ({ updateUploadedFiles }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleDrag = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      dragCounterRef.current += 1;
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      dragCounterRef.current -= 1;
      if (dragCounterRef.current === 0) {
        setDragActive(false);
      }
    }
  }, []);

  const handleDrop = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      dragCounterRef.current = 0;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        const newFiles = Array.from(droppedFiles);
        updateUploadedFiles(newFiles);
      }
    },
    [updateUploadedFiles],
  );

  const handleChange = useCallback(
    e => {
      e.preventDefault();
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        const newFiles = Array.from(selectedFiles);
        updateUploadedFiles(newFiles);
        e.target.value = '';
      }
    },
    [updateUploadedFiles],
  );

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleKeyDown = useCallback(
    e => {
      // Handle Enter and Space key for keyboard navigation
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleButtonClick();
      }
    },
    [handleButtonClick],
  );

  const handleDragAreaKeyDown = useCallback(
    e => {
      // Allow keyboard navigation within the drag area
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleButtonClick();
      }
    },
    [handleButtonClick],
  );

  return (
    <div
      className={styles.fileUploadForm}
      onDragEnter={handleDrag}
      onSubmit={e => e.preventDefault()}
      role="region"
      aria-label="File upload area"
    >
      <input
        id="file-upload-input"
        ref={fileInputRef}
        className={styles.fileUploadInput}
        type="file"
        name="file-upload-input"
        multiple={true}
        accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
        onChange={handleChange}
        aria-label="Upload image files"
      />

      {/* Container with dotted border */}
      <div
        className={`${styles.dragDropContainer} ${dragActive ? styles.dragActive : ''} ${
          darkMode ? styles.darkMode : ''
        }`}
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Native button inside the container */}
        <button
          type="button"
          className={styles.uploadButton}
          onClick={handleButtonClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-describedby="file-upload-description"
          style={{
            width: '100%',
            height: '100%',
            textAlign: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            outline: 'none',
            padding: 0,
          }}
        >
          <div
            role="button"
            tabIndex={0}
            onKeyDown={handleDragAreaKeyDown}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
              outline: 'none',
              padding: '20px',
            }}
          >
            <FontAwesomeIcon icon={faImage} className={styles.fileUploadIcon} aria-hidden="true" />
            <p style={{ margin: '8px 0' }}>
              Drag and drop your picture here or{' '}
              <span
                className={styles.browseLink}
                role="button"
                tabIndex={0}
                onClick={e => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleButtonClick();
                  }
                }}
                style={{
                  color: darkMode ? '#0dcaf0' : '#0d6efd',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                browse files
              </span>
            </p>
            <p
              className="text-muted small"
              id="file-upload-description"
              style={{ margin: '4px 0' }}
            >
              Accepted: PNG, JPG, JPEG, GIF, WEBP
            </p>
            <div
              className={styles.uploadIndicator}
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: darkMode ? '#adb5bd' : '#6c757d',
              }}
              aria-hidden="true"
            >
              <FontAwesomeIcon icon={faUpload} size="sm" />
              <span>Click or drag to upload</span>
            </div>
          </div>
        </button>
      </div>

      {dragActive && (
        <div
          className={`${styles.dragFileElement} ${darkMode ? styles.dragFileElementDark : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          role="region"
          aria-label="Active drag and drop area"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
};

export default DragAndDrop;
