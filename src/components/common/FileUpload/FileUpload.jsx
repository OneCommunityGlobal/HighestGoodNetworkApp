/* eslint-disable jsx-a11y/label-has-associated-control */
// eslint-disable-next-line react/function-component-definition
import { toast } from 'react-toastify';

function FileUpload({ name, accept, label, className, maxSizeinKB, error, onUpload, readAsType }) {
  const onChange = async e => {
    let errorMessage = '';
    const file = e.target.files[0];
    let isValid = true;
    if (!file) {
      toast.error('Choose a valid file');
      return;
    }
    if (accept) {
      const validfileTypes = accept.split(',');

      if (!validfileTypes.includes(file.type)) {
        errorMessage = `File type must be ${accept}.`;
        isValid = false;
      }
    }

    if (maxSizeinKB) {
      const filesizeKB = file.size / 1024;

      if (filesizeKB > maxSizeinKB) {
        errorMessage = `\n The file you are trying to upload exceed the maximum size of ${maxSizeinKB}KB. You can choose a different file or use an online file compressor.`;
        isValid = false;
      }
    }

    if (isValid) {
      onUpload(e, readAsType);
    } else {
      toast.error(errorMessage);
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
