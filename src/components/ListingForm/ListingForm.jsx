import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function ListingForm() {
  const [formData, setFormData] = useState({
    hostName: '',
    hostEmail: '',
    hostPhoneNumber: '',
    unitNumber: '',
    village: '',
    amenities: '',
    pricePerNight: '',
    includesMeals: '',
    landmarks: '',
    nearbyPlaces: '',
    exactAddress: '',
    availableFrom: '',
    propertyImages: [],
  });

  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [skippedFiles, setSkippedFiles] = useState([]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const processFiles = files => {
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
  
    if (invalidFiles.length > 0) {
      setSkippedFiles(invalidFiles.map(file => file.name));
      setErrors(prev => ({ ...prev, propertyImages: 'Some files exceed 5MB and were not uploaded.' }));
    } else {
      setSkippedFiles([]);
      setErrors(prev => ({ ...prev, propertyImages: '' }));
    }

    if (validFiles.length > 0) {
      const newUploadProgress = {};
      validFiles.forEach((file, index) => {
        newUploadProgress[file.name] = 0;
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        }, (index + 1) * 500);
      });

      setUploadProgress(prev => ({ ...prev, ...newUploadProgress }));
      setFormData(prev => ({
        ...prev,
        propertyImages: [...prev.propertyImages, ...validFiles]
      }));
    }
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDrop = e => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeImage = index => {
    const updatedImages = [...formData.propertyImages];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, propertyImages: updatedImages });
  };

  const reorderImages = (fromIndex, toIndex) => {
    const updatedImages = [...formData.propertyImages];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setFormData({ ...formData, propertyImages: updatedImages });
  };

  const handleSubmit = e => {
    e.preventDefault();
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: "600px", backgroundColor: "#f0f0f0" }}>
        <h2 className="text-center text-dark mb-4">Create a Listing</h2>
        <form onSubmit={handleSubmit}>
          {/* Input Fields */}
          {[
            { label: 'Host Name', name: 'hostName' },
            { label: 'Host Email', name: 'hostEmail', type: 'email' },
            { label: 'Unit Number', name: 'unitNumber' },
            { label: 'Village', name: 'village' },
            { label: 'Amenities', name: 'amenities' },
            { label: 'Price Per Night', name: 'pricePerNight', type: 'number' },
            { label: 'Nearby Property Landmarks', name: 'landmarks' },
            { label: 'Places to Visit Nearby', name: 'nearbyPlaces' },
            { label: 'Exact Address', name: 'exactAddress' },
          ].map(({ label, name, type = 'text' }) => (
            <div className="mb-3" key={name}>
              <label className="form-label fw-bold">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                required
              />
              <div className="invalid-feedback">{errors[name]}</div>
            </div>
          ))}

          {/* Date Picker */}
          <div className="mb-3">
            <label className="form-label fw-bold">Available From</label>
            <input
              type="date"
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleChange}
              className={`form-control ${errors.availableFrom ? "is-invalid" : ""}`}
              required
            />
            <div className="invalid-feedback">{errors.availableFrom}</div>
          </div>

          {/* Drag and Drop Upload */}
          <div
            className="mb-3 p-3 border rounded bg-light text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <label className="form-label fw-bold">Drag & Drop or Select Images (Max: 5MB, PNG/JPEG)</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              multiple
              onChange={handleFileChange}
              className="form-control"
            />
            <div className="invalid-feedback">{errors.propertyImages}</div>
            {skippedFiles.length > 0 && (
              <div className="text-danger mt-2">
              <small>Files not uploaded due to size limit: {skippedFiles.join(', ')}</small>
              </div>
            )}
          </div>

          {/* Image Previews */}
          <div key={index} className="me-2 mb-2 position-relative text-center">
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              width="80"
              height="80"
              className="border rounded"
            />
            <div className="btn-group mt-1">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={index === 0}
                onClick={() => reorderImages(index, index - 1)}
            >
              ↑
             </button>
             <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={index === formData.propertyImages.length - 1}
                onClick={() => reorderImages(index, index + 1)}
            >
              ↓
            </button>
          </div>
          <button
            type="button"
            className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle"
            onClick={() => removeImage(index)}
          >
            ✕
          </button>
        </div>


          {/* Submit Button */}
          <button type="submit" className="btn btn-success w-100 fw-bold">
            Submit Listing
          </button>
        </form>
      </div>
    </div>
  );
}

export default ListingForm;
