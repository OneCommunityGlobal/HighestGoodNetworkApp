import PropTypes from 'prop-types';
import { useCallback } from 'react';

const FilePreview = ({ file, index, darkMode, onRemove }) => {
  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const handleImageError = useCallback(
    e => {
      console.error('Failed to load preview for:', file?.name);
      e.target.style.display = 'none';
      const fallback = e.target.parentElement.querySelector('.preview-fallback');
      if (fallback) {
        fallback.style.display = 'flex';
      }
    },
    [file?.name],
  );

  const getFileType = useCallback(() => {
    if (!file?.type) return 'IMAGE';
    const parts = file.type.split('/');
    return parts[1]?.toUpperCase() || 'IMAGE';
  }, [file?.type]);

  const getStatusInfo = useCallback(() => {
    if (!file?.status) return null;

    switch (file.status) {
      case 'uploaded':
        return {
          text: 'Ready for preview',
          color: darkMode ? '#75b798' : '#198754',
          icon: 'fa-check-circle',
        };
      case 'local-only':
        return {
          text: 'Stored locally',
          color: darkMode ? '#6ea8fe' : '#0dcaf0',
          icon: 'fa-save',
        };
      case 'not-saved':
        return {
          text: 'Preview only',
          color: darkMode ? '#ffda6a' : '#ffc107',
          icon: 'fa-exclamation-triangle',
        };
      default:
        return null;
    }
  }, [file?.status, darkMode]);

  const statusInfo = getStatusInfo();

  return (
    <div
      className="border rounded p-2 position-relative"
      style={{
        maxWidth: '200px',
        borderColor: darkMode ? '#444444' : '#dee2e6',
        backgroundColor: darkMode ? '#2d2d2d' : 'transparent',
      }}
    >
      <button
        type="button"
        className="btn btn-sm btn-danger position-absolute"
        style={{ top: '-10px', right: '-10px', zIndex: 1 }}
        onClick={handleRemove}
        title={`Remove ${file?.name || 'image'}`}
        aria-label={`Remove ${file?.name || 'image'}`}
      >
        <span aria-hidden="true">X</span>
      </button>

      {file?.preview ? (
        <>
          <img
            src={file.preview}
            alt={`Preview of ${file.name || 'image'}`}
            style={{
              width: '100%',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
            className="mb-2"
            onError={handleImageError}
          />
          <div
            className="preview-fallback text-center mb-2 d-none align-items-center justify-content-center"
            style={{
              height: '120px',
              backgroundColor: darkMode ? '#374151' : '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            <div>
              <i
                className="fas fa-file-image fa-2x"
                style={{ color: darkMode ? '#adb5bd' : '#6c757d' }}
              />
              <div className="small mt-1" style={{ color: darkMode ? '#adb5bd' : '#6c757d' }}>
                Preview unavailable
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          className="text-center mb-2 d-flex align-items-center justify-content-center"
          style={{
            height: '120px',
            backgroundColor: darkMode ? '#374151' : '#f8f9fa',
            borderRadius: '4px',
          }}
        >
          <div>
            <i
              className="fas fa-file-image fa-2x"
              style={{ color: darkMode ? '#adb5bd' : '#6c757d' }}
            />
            <div className="small mt-1" style={{ color: darkMode ? '#adb5bd' : '#6c757d' }}>
              No Preview
            </div>
          </div>
        </div>
      )}

      <div
        className="text-truncate"
        title={file?.name || 'Unknown file'}
        style={{ color: darkMode ? '#e9ecef' : '#212529' }}
      >
        <strong>{file?.name || 'Unknown file'}</strong>
      </div>
      <div className="small" style={{ color: darkMode ? '#adb5bd' : '#6c757d' }}>
        {file?.size ? `${Math.round(file.size / 1024)} KB` : 'Size unknown'} • {getFileType()}
      </div>
      {statusInfo && (
        <div className="small">
          <span style={{ color: statusInfo.color }}>
            <i className={`fas ${statusInfo.icon} me-1`} />
            {statusInfo.text}
          </span>
        </div>
      )}
      {file?.message && (
        <div
          className="small"
          style={{ color: darkMode ? '#adb5bd' : '#6c757d', marginTop: '4px' }}
        >
          {file.message}
        </div>
      )}
    </div>
  );
};

FilePreview.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string,
    preview: PropTypes.string,
    size: PropTypes.number,
    type: PropTypes.string,
    status: PropTypes.oneOf(['uploaded', 'local-only', 'not-saved']),
    message: PropTypes.string,
  }),
  index: PropTypes.number.isRequired,
  darkMode: PropTypes.bool.isRequired,
  onRemove: PropTypes.func.isRequired,
};

FilePreview.defaultProps = {
  file: {},
};

export default FilePreview;
