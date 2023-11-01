import { Alert } from 'reactstrap';

function FileUpload({ name, accept, label, className, maxSizeinKB, error, onUpload, readAsType }) {
  const onChange = async e => {
    let errorMessage = '';
    const file = e.target.files[0];
    let isValid = true;
    if (!file) {
      return <Alert>Choose a valid file</Alert>;
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
        // eslint-disable-next-line no-unused-vars
        errorMessage = `\n The file you are trying to upload exceed the maximum size of ${maxSizeinKB}KB. You can choose a different file or use an online file compressor.`;
        isValid = false;
      }
    }

    return isValid ? onUpload(e, readAsType) : <Alert>${maxSizeinKB}</Alert>;
  };
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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
