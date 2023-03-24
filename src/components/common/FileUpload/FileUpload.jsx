import React from 'react';

const FileUpload = ({
  name,
  accept,
  label,
  className,
  maxSizeinKB,
  error,
  onUpload,
  readAsType,
}) => {
  const onChange = async e => {
    let errorMessage = '';
    const file = e.target.files[0];
    let isValid = true;
    if (!file) {
      return alert('Choose a valid file');
    }
    if (!!accept) {
      let validfileTypes = accept.split(',');

      if (!validfileTypes.includes(file.type)) {
        errorMessage = `File type must be ${accept}.`;
        isValid = false;
      }
    }

    if (!!maxSizeinKB) {
      let filesizeKB = file.size / 1024;

      if (filesizeKB > maxSizeinKB) {
        errorMessage = `\n The file you are trying to upload exceed the maximum size of ${maxSizeinKB}KB. You can choose a different file or use an online file compressor.`;
        isValid = false;
      }
    }

    return isValid ? onUpload(e, readAsType) : alert(errorMessage);
  };
  return (
    <React.Fragment>
      <label
        htmlFor={name}
        className="fa fa-edit"
        data-toggle="tooltip"
        data-placement="bottom"
        title={label}
      ></label>
      <input
        id={name}
        name={name}
        className={className}
        onChange={e => onChange(e)}
        accept={accept}
        type="file"
      />

      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </React.Fragment>
  );
};

export default FileUpload;
