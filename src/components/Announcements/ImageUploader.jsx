import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function ImageUploader({ onFileUpload }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      // Pass the first accepted file to the parent component.
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  const rootProps = getRootProps();

  return (
    <div
      role={rootProps.role}
      onClick={rootProps.onClick}
      onKeyDown={rootProps.onKeyDown}
      tabIndex={rootProps.tabIndex}
      className={rootProps.className}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '10px',
        textAlign: 'center',
        cursor: 'pointer'
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the image here...</p>
      ) : (
        <p>Drag & drop an image here, or click to select one</p>
      )}
    </div>
  );
}

export default ImageUploader;
