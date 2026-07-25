/* eslint-disable jsx-a11y/label-has-associated-control */
// eslint-disable-next-line react/function-component-definition
// eslint-disable-next-line no-unused-vars
import React from 'react';

function FileUpload({ name, accept, label, className, maxSizeinKB, error, onUpload, readAsType }) {
  const onChange = async e => {
    const file = e.target.files[0];
    let errorMessage = '';

    if (!file) {
      onUpload?.(null, null, 'Choose a valid file');
      return;
    }

    const validfileTypes = accept?.split(',') || [];
    if (validfileTypes.length && !validfileTypes.includes(file.type)) {
      errorMessage = `File type must be ${accept}.`;
    }

    const filesizeKB = file.size / 1024;
    if (maxSizeinKB && filesizeKB > maxSizeinKB) {
      errorMessage = `The file you are trying to upload exceeds the maximum size of ${maxSizeinKB}KB.`;
    }

    if (errorMessage) {
      onUpload?.(null, null, errorMessage);
    } else {
      onUpload?.(e, readAsType);
    }
  };

  return (
    <>
      <label
        htmlFor={name}
        className="fa fa-edit"
        data-toggle="tooltip"
        data-placement="bottom"
        title={label}
      />
      <input
        data-testid="file-input"
        id={name}
        name={name}
        className={className}
        onChange={e => onChange(e)}
        accept={accept}
        type="file"
      />

      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </>
  );
}

export default FileUpload;
