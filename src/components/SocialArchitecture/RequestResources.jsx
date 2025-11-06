import { useState } from 'react';
import styles from './ResourceRequestForm.module.css';

function RequestResources() {
  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;

    // Update form data
    setFormData({ ...formData, [name]: value });

    // Clear error for this specific field when user types or selects a valid value
    if (errors[name]) {
      setErrors(prevErrors => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handleFileChange = e => {
    setFormData({ ...formData, materialImage: e.target.files[0] });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validateForm()) return;
    alert('Form validated successfully!');
    if (validateForm()) {
      console.log(formData);
      setSuccessMessage('Your resource request has been submitted successfully.');
      setFormData({
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
      });
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.eventName) newErrors.eventName = 'Event name is required';
    if (!formData.organizerName) newErrors.organizerName = 'Organizer name is required';
    if (!formData.itemName) newErrors.itemName = 'Item name is required';
    if (!formData.requestQuantity) newErrors.requestQuantity = 'Quantity is required';
    if (!formData.requestedDate) newErrors.requestedDate = 'Requested date is required';
    if (!formData.returnDate) newErrors.returnDate = 'Return date is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className={styles.requestResourceContainer}>
      <h2 className={styles.formTitle}>REQUEST MATERIAL</h2>
      {successMessage && <div className={styles.success}>{successMessage}</div>}
      <form className={styles.requestResourceForm} onSubmit={handleSubmit}>
        <div className={`${styles.formGroup} ${styles.largeWidth}`}>
          <label htmlFor="eventName">Event Name</label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            placeholder="Event Name"
          />
          {errors.eventName && <p className={styles.error}>{errors.eventName}</p>}
        </div>

        <div className={`${styles.formGroup} ${styles.largeWidth}`}>
          <label htmlFor="organizerName">Organizer Name</label>
          <input
            type="text"
            id="organizerName"
            name="organizerName"
            value={formData.organizerName}
            onChange={handleChange}
            placeholder="Name"
          />
          {errors.organizerName && <p className={styles.error}>{errors.organizerName}</p>}
        </div>

        <div className={`${styles.formGroup} ${styles.largeWidth}`}>
          <label htmlFor="itemName">Item Name</label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="Name of item you want to request"
          />
          {errors.itemName && <p className={styles.error}>{errors.itemName}</p>}
        </div>

        <div className={`${styles.formGroup} ${styles.largeWidth}`}>
          <label htmlFor="requestQuantity">Request Quantity</label>
          <input
            type="number"
            id="requestQuantity"
            name="requestQuantity"
            value={formData.requestQuantity}
            onChange={handleChange}
            placeholder="Qty"
            min="1"
          />
          {errors.requestQuantity && <p className={styles.error}>{errors.requestQuantity}</p>}
        </div>

        <div className={`${styles.formGroup} ${styles.Date}`}>
          <label htmlFor="requestedDate">Requested Date</label>
          <input
            type="date"
            id="requestedDate"
            name="requestedDate"
            value={formData.requestedDate}
            onChange={handleChange}
          />
          {errors.requestedDate && <p className={styles.error}>{errors.requestedDate}</p>}
        </div>

        <div className={`${styles.formGroup} ${styles.Date}`}>
          <label htmlFor="returnDate">Return Date</label>
          <input
            type="date"
            id="returnDate"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
          />
          {errors.returnDate && <p className={styles.error}>{errors.returnDate}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="organizerPhone">Organizer Phone Number</label>
          <div className="phone-input">
            <input
              type="text"
              id="countryCode"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              placeholder="+1"
            />
            {errors.countryCode && <p className={styles.error}>{errors.countryCode}</p>}
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="XXX-XXX-XXXX"
            />
            {errors.phoneNumber && <p className={styles.error}>{errors.phoneNumber}</p>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="materialImage">Upload Material Picture</label>
          <label htmlFor="materialImage" className={styles.uploadBox}>
            Drag and drop your picture here
            <input
              type="file"
              id="materialImage"
              name="materialImage"
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>

          {formData.materialImage && (
            <div className={styles.uploadPreview}>
              <img src={URL.createObjectURL(formData.materialImage)} alt="Preview" />
            </div>
          )}
          {errors.materialImage && <p className={styles.error}>{errors.materialImage}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Describe your material in detail."
            rows="4"
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="button" className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default RequestResources;
