import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './ResourceRequestForm.module.css';

const initialFormData = {
  eventName: '',
  organizerName: '',
  itemName: '',
  requestQuantity: '',
  requestedDate: '',
  returnDate: '',
  countryCode: '+1',
  phoneNumber: '',
  notes: '',
  materialImage: null,
};

function FieldError({ message, darkMode }) {
  if (!message) return null;
  return <p className={`${styles.error} ${darkMode ? styles.errorDark : ''}`}>{message}</p>;
}

function FieldLabel({ htmlFor, darkMode, children }) {
  return (
    <label htmlFor={htmlFor} style={{ color: darkMode ? '#d1d5db' : undefined }}>
      {children}
    </label>
  );
}

function TextField({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  darkMode,
  wide,
  ...rest
}) {
  return (
    <div className={`${styles.formGroup} ${wide ? styles.largeWidth : ''}`}>
      <FieldLabel htmlFor={id} darkMode={darkMode}>
        {label}
      </FieldLabel>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={darkMode ? styles.darkInput : ''}
        {...rest}
      />
      <FieldError message={error} darkMode={darkMode} />
    </div>
  );
}

function DateField({ label, id, name, value, onChange, min, error, darkMode }) {
  return (
    <div className={`${styles.formGroup} ${styles.Date}`}>
      <FieldLabel htmlFor={id} darkMode={darkMode}>
        {label}
      </FieldLabel>
      <input
        type="date"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        className={darkMode ? styles.darkInput : ''}
        style={darkMode ? { colorScheme: 'dark' } : undefined}
      />
      <FieldError message={error} darkMode={darkMode} />
    </div>
  );
}

function PhoneField({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneChange,
  countryCodeError,
  phoneNumberError,
  darkMode,
}) {
  return (
    <div className={styles.formGroup}>
      <FieldLabel htmlFor="organizerPhone" darkMode={darkMode}>
        Organizer Phone Number
      </FieldLabel>
      <div className={styles.phoneInput}>
        <input
          type="text"
          id="countryCode"
          name="countryCode"
          value={countryCode}
          onChange={onCountryCodeChange}
          placeholder="+1"
          className={darkMode ? styles.darkInput : ''}
        />
        <FieldError message={countryCodeError} darkMode={darkMode} />
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          value={phoneNumber}
          onChange={onPhoneChange}
          placeholder="XXX-XXX-XXXX"
          inputMode="numeric"
          className={darkMode ? styles.darkInput : ''}
        />
        <FieldError message={phoneNumberError} darkMode={darkMode} />
      </div>
    </div>
  );
}

function MaterialUploadField({ fileInputKey, materialImage, onFileChange, error, darkMode }) {
  return (
    <div className={styles.formGroup}>
      <FieldLabel htmlFor="materialImage" darkMode={darkMode}>
        Upload Material Picture
      </FieldLabel>
      <label
        htmlFor="materialImage"
        className={`${styles.uploadBox} ${darkMode ? styles.darkUploadBox : ''}`}
      >
        Drag and drop your picture here{' '}
        <input
          key={fileInputKey}
          type="file"
          id="materialImage"
          name="materialImage"
          onChange={onFileChange}
          accept="image/*"
        />
      </label>
      {materialImage && (
        <div className={styles.uploadPreview}>
          <img src={URL.createObjectURL(materialImage)} alt="Preview" />
        </div>
      )}
      <FieldError message={error} darkMode={darkMode} />
    </div>
  );
}

function NotesField({ value, onChange, darkMode }) {
  return (
    <div className={styles.formGroup}>
      <FieldLabel htmlFor="notes" darkMode={darkMode}>
        Notes
      </FieldLabel>
      <textarea
        id="notes"
        name="notes"
        value={value}
        onChange={onChange}
        placeholder="Describe your material in detail."
        rows="4"
        className={darkMode ? styles.darkInput : ''}
      />
    </div>
  );
}

function FormActions({ darkMode, onCancel }) {
  return (
    <div className={styles.buttonGroup}>
      <button
        type="button"
        className={`${styles.cancelButton} ${darkMode ? styles.cancelButtonDark : ''}`}
        onClick={onCancel}
      >
        Cancel
      </button>
      <button type="submit" className={styles.submitButton}>
        Submit
      </button>
    </div>
  );
}

function SuccessBanner({ message, darkMode }) {
  if (!message) return null;
  return <div className={`${styles.success} ${darkMode ? styles.successDark : ''}`}>{message}</div>;
}

function getRequiredFieldErrors(formData) {
  const newErrors = {};
  if (!formData.eventName) newErrors.eventName = 'Event name is required';
  if (!formData.organizerName) newErrors.organizerName = 'Organizer name is required';
  if (!formData.itemName) newErrors.itemName = 'Item name is required';
  if (!formData.requestQuantity) newErrors.requestQuantity = 'Quantity is required';
  if (!formData.requestedDate) newErrors.requestedDate = 'Requested date is required';
  if (!formData.returnDate) newErrors.returnDate = 'Return date is required';
  return newErrors;
}

function RequestResources() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  const clearFieldError = name => {
    setErrors(prevErrors => {
      if (!prevErrors[name]) return prevErrors;
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[name];
      return updatedErrors;
    });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    if (name === 'requestedDate' && formData.returnDate && value > formData.returnDate) {
      updatedFormData.returnDate = '';
    }
    setFormData(updatedFormData);
    clearFieldError(name);
  };

  const handlePhoneChange = e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    const formatted = digits
      .replace(/(\d{3})(\d)/, '$1-$2')
      .replace(/(\d{3})-(\d{3})(\d)/, '$1-$2-$3');
    setFormData({ ...formData, phoneNumber: formatted });
    clearFieldError('phoneNumber');
  };

  const handleCountryCodeChange = e => {
    const value = e.target.value.replace(/[^\d+]/g, '');
    setFormData({ ...formData, countryCode: value });
  };

  const handleFileChange = e => {
    setFormData({ ...formData, materialImage: e.target.files[0] });
  };

  const validateForm = () => {
    const newErrors = getRequiredFieldErrors(formData);
    const phoneDigits = formData.phoneNumber?.replace(/\D/g, '') ?? '';
    if (phoneDigits.length !== 10) newErrors.phoneNumber = 'Enter a valid 10-digit phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFileInputKey(prev => prev + 1);
    setErrors({});
  };

  const handleCancel = () => {
    setSuccessMessage('');
    resetForm();
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSuccessMessage('');
    if (!validateForm()) return;

    console.log(formData);
    setSuccessMessage('Your resource request has been submitted successfully.');
    resetForm();
  };

  return (
    <div className={`${styles.requestResourceContainer} ${darkMode ? styles.darkContainer : ''}`}>
      <h2 className={styles.formTitle} style={{ color: darkMode ? '#fff' : undefined }}>
        REQUEST MATERIAL
      </h2>

      <SuccessBanner message={successMessage} darkMode={darkMode} />

      <form className={styles.requestResourceForm} onSubmit={handleSubmit}>
        <TextField
          label="Event Name"
          id="eventName"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          placeholder="Event Name"
          error={errors.eventName}
          darkMode={darkMode}
          wide
        />

        <TextField
          label="Organizer Name"
          id="organizerName"
          name="organizerName"
          value={formData.organizerName}
          onChange={handleChange}
          placeholder="Name"
          error={errors.organizerName}
          darkMode={darkMode}
          wide
        />

        <TextField
          label="Item Name"
          id="itemName"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          placeholder="Name of item you want to request"
          error={errors.itemName}
          darkMode={darkMode}
          wide
        />

        <TextField
          label="Request Quantity"
          id="requestQuantity"
          name="requestQuantity"
          type="number"
          value={formData.requestQuantity}
          onChange={handleChange}
          placeholder="Qty"
          min="1"
          error={errors.requestQuantity}
          darkMode={darkMode}
          wide
        />

        <DateField
          label="Requested Date"
          id="requestedDate"
          name="requestedDate"
          value={formData.requestedDate}
          onChange={handleChange}
          min={today}
          error={errors.requestedDate}
          darkMode={darkMode}
        />

        <DateField
          label="Return Date"
          id="returnDate"
          name="returnDate"
          value={formData.returnDate}
          onChange={handleChange}
          min={formData.requestedDate || today}
          error={errors.returnDate}
          darkMode={darkMode}
        />

        <PhoneField
          countryCode={formData.countryCode}
          phoneNumber={formData.phoneNumber}
          onCountryCodeChange={handleCountryCodeChange}
          onPhoneChange={handlePhoneChange}
          countryCodeError={errors.countryCode}
          phoneNumberError={errors.phoneNumber}
          darkMode={darkMode}
        />

        <MaterialUploadField
          fileInputKey={fileInputKey}
          materialImage={formData.materialImage}
          onFileChange={handleFileChange}
          error={errors.materialImage}
          darkMode={darkMode}
        />

        <NotesField value={formData.notes} onChange={handleChange} darkMode={darkMode} />

        <FormActions darkMode={darkMode} onCancel={handleCancel} />
      </form>
    </div>
  );
}

export default RequestResources;
