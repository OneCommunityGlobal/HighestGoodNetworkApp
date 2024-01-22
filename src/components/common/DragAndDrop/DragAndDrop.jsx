import { useEffect, useState, useCallback } from 'react';
import './DragAndDrop.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

const DragAndDrop = ({onFilesSelected, updateUploadedFiles}) => {

  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]); 
//try useRef
  const memoizedOnFilesSelected = useCallback((files) => {
    onFilesSelected(files);
  }, [onFilesSelected]);

  const memoizedUpdateUploadedFiles = useCallback((newFiles) => {
    updateUploadedFiles((prevUploadedFiles) => [...prevUploadedFiles, ...newFiles]);
  }, [updateUploadedFiles]);

  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles[0]) {
      const newFiles = Array.from(droppedFiles);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      console.log("DROPPED", files);
      memoizedUpdateUploadedFiles(newFiles);
    }
  };
  
  const handleChange = function (e) {
    e.preventDefault();
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles[0]) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      console.log('INPUT CHANGED', files)
    }
  }

  // const handleRemoveFile = function (index) {
  //   setFiles((prevFiles) => prevFiles.filter((file, i) => i !== index));
  //   updateUploadedFiles((prevUploadedFiles) => prevUploadedFiles.filter((file, i) => i !== index))
  // }

  useEffect(() => {
    memoizedOnFilesSelected(files)
  }, [files, memoizedOnFilesSelected])

  return (
    <div id="file-upload-form" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
      <input
        id="file-upload-input"
        type="file"
        name="file-upload-input"
        multiple={false}
        accept="image/jpeg, image/jpg, image/png"
        onChange={handleChange} />
      <label
        htmlFor="file-upload-input"
        id="file-upload-label"
        className={dragActive ? "drag-active" : ""}>
          <div>
              <FontAwesomeIcon icon={faImage} className="file-upload-icon" />
                <p>Drag and drop your picture here </p>
              </div>
      </label>
      {/* invisible element to cover the entire form when dragActive is true so that dragleave event is not triggeredwhen drag goes over other elements in the form. */}
      {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
    </div>
  )
}

export default DragAndDrop;
