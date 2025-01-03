import { useState } from 'react';
import './ResourceRequestForm.css';

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

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = e => {
    setFormData({ ...formData, materialImage: e.target.files[0] });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // console.log(formData);
    // alert('Form submitted successfully!');
  };

  return (
    <div className="request-resource-container">
      <h2 className="form-title">REQUEST MATERIAL</h2>
      <form className="request-resource-form" onSubmit={handleSubmit}>
        <div className="form-group large-width">
          <label htmlFor="eventName">Event Name</label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            placeholder="Event Name"
            required
          />
        </div>

        <div className="form-group large-width">
          <label htmlFor="organizerName">Organizer Name</label>
          <input
            type="text"
            id="organizerName"
            name="organizerName"
            value={formData.organizerName}
            onChange={handleChange}
            placeholder="Name"
            required
          />
        </div>

        <div className="form-group large-width">
          <label htmlFor="itemName">Item Name</label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="Name of item you want to request"
            required
          />
        </div>

        <div className="form-group large-width">
          <label htmlFor="requestQuantity">Request Quantity</label>
          <input
            type="number"
            id="requestQuantity"
            name="requestQuantity"
            value={formData.requestQuantity}
            onChange={handleChange}
            placeholder="Qty"
            min="1"
            required
          />
        </div>

        <div className="form-group Date">
          <label htmlFor="requestedDate">Requested Date</label>
          <input
            type="date"
            id="requestedDate"
            name="requestedDate"
            value={formData.requestedDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group Date">
          <label htmlFor="returnDate">Return Date</label>
          <input
            type="date"
            id="returnDate"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizerPhone">Organizer Phone Number</label>
          <div className="phone-input">
            <input
              type="text"
              id="countryCode"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              placeholder="+1"
              required
            />
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="XXX-XXX-XXXX"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="materialImage">Upload Material Picture</label>
          <input
            type="file"
            id="materialImage"
            name="materialImage"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <div className="form-group">
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

        <div className="button-group">
          <button type="button" className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default RequestResources;
