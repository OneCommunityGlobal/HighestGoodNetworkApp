/* eslint-disable react/function-component-definition */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './DragAndDrop.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

const DragAndDrop = ({ updateUploadedFiles }) => {
  const [dragActive, setDragActive] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleDrag = function handleFileDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles);
      updateUploadedFiles(newFiles);
    }
  };

  const handleChange = function handleFileChange(e) {
    e.preventDefault();
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      updateUploadedFiles(newFiles);
      e.target.value = '';
    }
  };

  return (
    <div
      className={styles.fileUploadForm}
      onDragEnter={handleDrag}
      onSubmit={e => e.preventDefault()}
    >
      <input
        id="file-upload-input"
        className={styles.fileUploadInput}
        type="file"
        name="file-upload-input"
        multiple={true}
        accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
        onChange={handleChange}
      />
      <label
        htmlFor="file-upload-input"
        id="file-upload-label"
        className={`${styles.fileUploadLabel} ${dragActive ? styles.dragActive : ''} ${
          darkMode ? styles.darkMode : ''
        }`}
      >
        <div>
          <FontAwesomeIcon icon={faImage} className={styles.fileUploadIcon} />
          <p>Drag and drop your picture here </p>
          <p className="text-muted small mt-2">Click to browse files</p>
        </div>
      </label>
      {dragActive && (
        <div
          className={`${styles.dragFileElement} ${darkMode ? styles.dragFileElementDark : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        />
      )}
    </div>
  );
};

export default DragAndDrop;
