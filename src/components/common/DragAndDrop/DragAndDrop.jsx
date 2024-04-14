/* eslint-disable react/function-component-definition */
import { useState } from 'react';
import './DragAndDrop.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

const DragAndDrop = ({ updateUploadedFiles }) => {

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = function handleFileDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles[0]) {
      const newFiles = Array.from(droppedFiles);
      updateUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleChange = function handleFileChange(e) {
    e.preventDefault();
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles[0]) {
      const newFiles = Array.from(selectedFiles);
      updateUploadedFiles(prev => [...prev, ...newFiles]);
    }
  }

  return (
    <div id="file-upload-form" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
      <input
        id="file-upload-input"
        type="file"
        name="file-upload-input"
        multiple={false}
        accept="image/jpeg, image/jpg, image/png"
        onChange={handleChange}
      />
      <label
        htmlFor="file-upload-input"
        id="file-upload-label"
        className={dragActive ? "drag-active" : ""}>
        <div>
          <FontAwesomeIcon icon={faImage} className="file-upload-icon" />
          <p>Drag and drop your picture here </p>
        </div>
        <input
          type="file"
          id="file-upload-input"
          className="file-upload-input"
        />
      </label>
      {/* invisible element to cover the entire form when dragActive is true so that dragleave event is not triggeredwhen drag goes over other elements in the form. */}
      {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} />}
    </div>
  )
}

export default DragAndDrop;
