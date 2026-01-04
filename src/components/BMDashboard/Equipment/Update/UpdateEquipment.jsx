import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEquipmentById, updateEquipment } from '~/actions/bmdashboard/equipmentActions';
import { Button, Form, FormGroup, Label, Container, Row, Col, Input, Alert } from 'reactstrap';
import CheckTypesModal from '~/components/BMDashboard/shared/CheckTypesModal';
import { useHistory, useParams } from 'react-router-dom';
import Radio from '~/components/common/Radio';
import DragAndDrop from '~/components/common/DragAndDrop/DragAndDrop';
import Image from '~/components/common/Image/Image';
import styles from './UpdateEquipment.module.css';

export default function UpdateEquipment() {
  const history = useHistory();
  const { equipmentId } = useParams();
  const [modal, setModal] = useState(false);
  const [lastUsedBy, setLastUsedBy] = useState('');
  const [lastUsedByOther, setLastUsedByOther] = useState('');
  const [lastUsedFor, setLastUsedFor] = useState('');
  const [lastUsedForOther, setLastUsedForOther] = useState('');
  const [replacementRequired, setReplacementRequired] = useState('');
  const [description, setDescription] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [uploadedFilesPreview, setUploadedFilesPreview] = useState([]);
  const equipmentDetails = useSelector(state => state.bmEquipments.singleEquipment);
  const dispatch = useDispatch();

  useEffect(() => {
    if (equipmentId) {
      dispatch(fetchEquipmentById(equipmentId));
    }

    return () => {
      uploadedFilesPreview.forEach(file => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [dispatch, equipmentId]);

  useEffect(() => {
    return () => {
      uploadedFilesPreview.forEach(file => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFilesPreview]);

  const handleCancel = () => history.goBack();

  const calculateDaysLeft = endDate => {
    if (!endDate) return '';

    const today = new Date();
    const rentalEnd = new Date(endDate);
    const timeDiff = rentalEnd.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysLeft >= 0 ? daysLeft : 'Expired';
  };

  const validateForm = () => {
    if (!status) {
      return 'Status/Condition is required';
    }
    if (!lastUsedBy) {
      return 'Please specify who used the tool/equipment last time';
    }
    if (lastUsedBy === 'other' && !lastUsedByOther.trim()) {
      return 'Please specify the name of who used the tool/equipment';
    }
    if (!lastUsedFor) {
      return 'Please specify what the tool/equipment was used for';
    }
    if (lastUsedFor === 'other' && !lastUsedForOther.trim()) {
      return 'Please specify what the tool/equipment was used for';
    }
    if (!replacementRequired) {
      return 'Please indicate if replacement is required';
    }
    if (sendNote === 'yes' && !notes.trim()) {
      return 'Please add a note if you selected to send one';
    }
    return null;
  };

  const handleFileUpload = files => {
    uploadedFilesPreview.forEach(file => {
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });

    const validFiles = files.filter(file => {
      const fileType = file.type || '';
      const fileName = file.name || '';
      const isValidType = fileType.startsWith('image/');
      const isValidExtension = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      return isValidType || isValidExtension;
    });

    if (validFiles.length === 0) {
      console.warn('No valid image files found');
      return;
    }

    const newPreviews = validFiles.map(file => {
      const previewUrl = URL.createObjectURL(file);
      return {
        name: file.name || 'Image',
        preview: previewUrl,
        size: file.size || 0,
        type: file.type || 'image/*',
        file: file,
        status: 'uploaded',
        uploadedAt: new Date().toISOString(),
      };
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setUploadedFilesPreview(prev => [...prev, ...newPreviews]);
  };

  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const updateData = {
        condition: status,
        lastUsedBy: lastUsedBy === 'other' ? lastUsedByOther : lastUsedBy,
        lastUsedFor: lastUsedFor === 'other' ? lastUsedForOther : lastUsedFor,
        replacementRequired,
        description,
        notes: sendNote === 'yes' ? notes : '',
      };

      await dispatch(updateEquipment(equipmentId, updateData));

      let successMessage = 'Equipment status updated successfully!';

      if (uploadedFiles.length > 0) {
        successMessage += ' Note: Images were uploaded and stored locally for preview.';
        setUploadedFilesPreview(prev =>
          prev.map(file => ({
            ...file,
            status: 'local-only',
            message: 'Stored locally for preview',
          })),
        );
      }

      setSubmitSuccess(successMessage);

      setTimeout(() => {
        history.goBack();
      }, 2000);
    } catch (error) {
      console.error('Update failed:', error);

      let errorMessage = 'Failed to update equipment. Please try again.';

      if (error.message && error.message.includes('User not authenticated')) {
        errorMessage = 'Authentication error. Please check if you are logged in.';
      } else if (error.response?.data?.error?.includes('Invalid user ID format')) {
        errorMessage = 'User ID format error. Please contact support.';
      }

      if (uploadedFiles.length > 0) {
        errorMessage += ' Note: Images were selected and previewed but not saved to database.';
        setUploadedFilesPreview(prev =>
          prev.map(file => ({
            ...file,
            status: 'not-saved',
            message: 'Selected but not saved to database',
          })),
        );
      }

      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = index => {
    if (uploadedFilesPreview[index]?.preview) {
      URL.revokeObjectURL(uploadedFilesPreview[index].preview);
    }

    const newPreviews = [...uploadedFilesPreview];
    newPreviews.splice(index, 1);
    setUploadedFilesPreview(newPreviews);

    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const formLabelStyle = {
    fontWeight: '600',
    color: '#212529',
    display: 'block',
    marginBottom: '0.5rem',
  };

  const formInputStyle = {
    borderColor: '#ced4da',
    backgroundColor: '#ffffff',
    color: '#212529',
  };

  const readonlyStyle = {
    padding: '10px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    color: '#212529',
    fontSize: '1rem',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px',
    fontWeight: '500',
  };

  return (
    <Container className={`${styles['inv-form-page-container']} inv-form-page-container`}>
      <CheckTypesModal modal={modal} setModal={setModal} type="Equipments" />
      <Row>
        <Col md={12}>
          <header className="bm-dashboard__header text-center">
            <h1 style={{ color: '#212529' }}>Update Tool or Equipment Status</h1>
          </header>
        </Col>
      </Row>

      {submitError && (
        <Row>
          <Col md={12}>
            <Alert color="danger" className="mt-3">
              <i className="fas fa-exclamation-circle me-2"></i>
              {submitError}
            </Alert>
          </Col>
        </Row>
      )}

      {submitSuccess && (
        <Row>
          <Col md={12}>
            <Alert color="success" className="mt-3">
              <i className="fas fa-check-circle me-2"></i>
              {submitSuccess}
            </Alert>
          </Col>
        </Row>
      )}

      {equipmentDetails && (
        <Row className="mb-4">
          <Col md={3}>
            <Image
              name="equipment-image"
              src={equipmentDetails.imageUrl || 'https://via.placeholder.com/150'}
              alt="Equipment image"
              className={`${styles.squareImage} mb-3`}
              style={{ border: '2px solid #dee2e6' }}
            />
          </Col>
        </Row>
      )}

      <Form onSubmit={handleSubmit} className="inv-form">
        <FormGroup className="background-from-db">
          <Row form>
            <Col md={4}>
              <Label for="itemName" style={formLabelStyle}>
                Name
              </Label>
              <div style={readonlyStyle}>{equipmentDetails?.itemType?.name || 'Unknown'}</div>
            </Col>
            <Col md={4}>
              <Label for="itemNumber" style={formLabelStyle}>
                Number
              </Label>
              <div style={readonlyStyle}>{equipmentDetails?._id || 'Unknown'}</div>
            </Col>
            <Col md={4}>
              <Label for="itemClass" style={formLabelStyle}>
                Class
              </Label>
              <div style={readonlyStyle}>{equipmentDetails?.itemType?.category || 'Unknown'}</div>
            </Col>
          </Row>
          <Row form>
            <Col md={4}>
              <Label for="itemProject" style={formLabelStyle}>
                Project
              </Label>
              <div style={readonlyStyle}>{equipmentDetails?.project?.name || 'Unknown'}</div>
            </Col>
            <Col md={4}>
              <Label for="itemStatus" style={formLabelStyle}>
                Current Status
              </Label>
              <div style={readonlyStyle}>
                {equipmentDetails?.updateRecord?.length > 0
                  ? equipmentDetails.updateRecord[equipmentDetails.updateRecord.length - 1]
                      .condition
                  : 'Unknown'}
              </div>
            </Col>
            <Col md={4}>
              <Label for="itemOwnership" style={formLabelStyle}>
                Ownership
              </Label>
              <div style={readonlyStyle}>{equipmentDetails?.purchaseStatus || 'Unknown'}</div>
            </Col>
          </Row>
          {equipmentDetails && equipmentDetails.purchaseStatus === 'Rental' && (
            <Row form>
              <Col md={4}>
                <Label style={formLabelStyle}>Rental End Date</Label>
                <div style={readonlyStyle}>
                  {equipmentDetails.rentalDueDate?.split('T')[0] || 'Unknown'}
                </div>
              </Col>
              <Col md={4}>
                <Label style={formLabelStyle}>Days Left</Label>
                <div style={readonlyStyle}>
                  {calculateDaysLeft(equipmentDetails?.rentalDueDate)}
                </div>
              </Col>
            </Row>
          )}
        </FormGroup>

        <Row form>
          <Col md={12}>
            <div
              style={{
                color: '#0d6efd',
                fontWeight: '600',
                margin: '20px 0',
                padding: '12px 16px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #cfe2ff',
                borderRadius: '6px',
                fontSize: '1rem',
              }}
            >
              Please confirm you are updating the status of the tool or equipment shown above.
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={8}>
            <FormGroup>
              <Label for="status" style={formLabelStyle}>
                Status/Condition Now *
              </Label>
              <Input
                id="status"
                name="status"
                type="select"
                value={status}
                onChange={e => setStatus(e.target.value)}
                required
                style={formInputStyle}
              >
                <option value="">Select status</option>
                <option value="Working well">Working well</option>
                <option value="Broken/Needs repair">Broken/Needs repair</option>
                <option value="Stolen/Lost">Stolen/Lost</option>
                <option value="End of life">End of life</option>
                <option value="Returned">Returned</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md={8}>
            <FormGroup>
              <Label for="lastUsedBy" style={formLabelStyle}>
                Who used the tool/equipment last time? *
              </Label>
              <Input
                type="select"
                name="lastUsedBy"
                id="lastUsedBy"
                value={lastUsedBy}
                onChange={e => setLastUsedBy(e.target.value)}
                required
                style={formInputStyle}
              >
                <option value="">Select user</option>
                <option value="Jane Doe (Volunteer #1)">Jane Doe (Volunteer #1)</option>
                <option value="Jane Doe (Volunteer #2)">Jane Doe (Volunteer #2)</option>
                <option value="Jane Doe (Volunteer #3)">Jane Doe (Volunteer #3)</option>
                <option value="Jane Doe (Volunteer #4)">Jane Doe (Volunteer #4)</option>
                <option value="other">Other (Please specify below)</option>
              </Input>
              {lastUsedBy === 'other' && (
                <Input
                  type="text"
                  name="lastUsedByOther"
                  id="lastUsedByOther"
                  placeholder="Please specify the name"
                  value={lastUsedByOther}
                  onChange={e => setLastUsedByOther(e.target.value)}
                  className="mt-2"
                  required
                  style={formInputStyle}
                />
              )}
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col md={8}>
            <FormGroup>
              <Label for="lastUsedFor" style={formLabelStyle}>
                What was it used for last time? *
              </Label>
              <Input
                type="select"
                name="lastUsedFor"
                id="lastUsedFor"
                value={lastUsedFor}
                onChange={e => setLastUsedFor(e.target.value)}
                required
                style={formInputStyle}
              >
                <option value="">Select usage</option>
                <option value="Kitchen - tiling">Kitchen - tiling</option>
                <option value="Bathroom - plumbing">Bathroom - plumbing</option>
                <option value="Living room - painting">Living room - painting</option>
                <option value="Garden - landscaping">Garden - landscaping</option>
                <option value="other">Other (Please specify below)</option>
              </Input>
              {lastUsedFor === 'other' && (
                <Input
                  type="text"
                  name="lastUsedForOther"
                  id="lastUsedForOther"
                  placeholder="Please specify the task"
                  value={lastUsedForOther}
                  onChange={e => setLastUsedForOther(e.target.value)}
                  className="mt-2"
                  required
                  style={formInputStyle}
                />
              )}
            </FormGroup>
          </Col>
        </Row>

        <FormGroup>
          <Label
            className="form-control-label"
            for="replacementRequired-yes"
            style={formLabelStyle}
          >
            Require a replacement? *
          </Label>
          <Radio
            name="replacementRequired"
            options={[
              { label: 'Yes', value: 'yes', id: 'replacementRequired-yes' },
              { label: 'No', value: 'no', id: 'replacementRequired-no' },
            ]}
            value={replacementRequired}
            onChange={e => setReplacementRequired(e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label for="file-upload-input" style={formLabelStyle}>
            Upload latest picture of this tool or equipment. (optional)
            <small className="text-muted ms-2">Accepted: PNG, JPG, JPEG, GIF, WEBP</small>
          </Label>

          {uploadedFiles.length > 0 && (
            <Alert color="info" className="mb-3">
              <i className="fas fa-info-circle me-2"></i>
              {uploadedFiles.length} image{uploadedFiles.length > 1 ? 's' : ''} uploaded and ready
              for preview
            </Alert>
          )}

          <DragAndDrop updateUploadedFiles={handleFileUpload} />

          {uploadedFilesPreview.length > 0 && (
            <div className="mt-3">
              <Label style={formLabelStyle}>Uploaded Images Preview:</Label>
              <div className="d-flex flex-wrap gap-3 mt-2">
                {uploadedFilesPreview.map((file, index) => (
                  <div
                    key={`file-${index}-${file.uploadedAt || Date.now()}`}
                    className="border rounded p-2 position-relative"
                    style={{ maxWidth: '200px', borderColor: '#dee2e6' }}
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute"
                      style={{ top: '-10px', right: '-10px', zIndex: 1 }}
                      onClick={() => handleRemoveFile(index)}
                      title="Remove image"
                    >
                      X
                    </button>

                    {file.preview ? (
                      <>
                        <img
                          src={file.preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                          className="mb-2"
                          onError={e => {
                            console.error('Failed to load preview for:', file.name);
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector(
                              '.preview-fallback',
                            );
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                        <div
                          className="preview-fallback text-center mb-2 d-none align-items-center justify-content-center"
                          style={{
                            height: '120px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                          }}
                        >
                          <div>
                            <i className="fas fa-file-image fa-2x text-muted"></i>
                            <div className="small mt-1">Preview unavailable</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div
                        className="text-center mb-2 d-flex align-items-center justify-content-center"
                        style={{
                          height: '120px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '4px',
                        }}
                      >
                        <div>
                          <i className="fas fa-file-image fa-2x text-muted"></i>
                          <div className="small mt-1">No Preview</div>
                        </div>
                      </div>
                    )}

                    <div className="text-truncate" title={file.name} style={{ color: '#212529' }}>
                      <strong>{file.name}</strong>
                    </div>
                    <div className="small" style={{ color: '#6c757d' }}>
                      {formatFileSize(file.size)} •{' '}
                      {file.type.split('/')[1]?.toUpperCase() || 'IMAGE'}
                    </div>
                    <div className="small">
                      {file.status === 'uploaded' && (
                        <span className="text-success">
                          <i className="fas fa-check-circle me-1"></i>
                          Ready for preview
                        </span>
                      )}
                      {file.status === 'local-only' && (
                        <span className="text-info">
                          <i className="fas fa-save me-1"></i>
                          Stored locally
                        </span>
                      )}
                      {file.status === 'not-saved' && (
                        <span className="text-warning">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Preview only
                        </span>
                      )}
                    </div>
                    {file.message && (
                      <div className="small" style={{ color: '#6c757d', marginTop: '4px' }}>
                        {file.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <Alert
                  color={
                    uploadedFilesPreview.some(f => f.status === 'not-saved') ? 'warning' : 'info'
                  }
                >
                  <small>
                    <i className="fas fa-info-circle me-1"></i>
                    {uploadedFilesPreview.some(f => f.status === 'not-saved')
                      ? 'Images are shown for preview purposes only and are not saved to the database.'
                      : 'Images are uploaded for preview. Form data will be saved to database.'}
                  </small>
                </Alert>
              </div>
            </div>
          )}
        </FormGroup>

        <FormGroup>
          <Label for="description" style={formLabelStyle}>
            Additional Description (optional)
          </Label>
          <Input
            type="textarea"
            name="description"
            id="description"
            placeholder="Provide detail description if needed."
            rows="3"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={formInputStyle}
          />
        </FormGroup>

        <FormGroup>
          <Label className="form-control-label" for="sendNote-yes" style={formLabelStyle}>
            Do you want to send a note for this update?
          </Label>
          <Radio
            name="sendNote"
            options={[
              { label: 'Yes', value: 'yes', id: 'sendNote-yes' },
              { label: 'No', value: 'no', id: 'sendNote-no' },
            ]}
            value={sendNote}
            onChange={e => setSendNote(e.target.value)}
          />
        </FormGroup>

        {sendNote === 'yes' && (
          <FormGroup>
            <Label for="notes" style={formLabelStyle}>
              Note (All the managers in this project can see this) *
            </Label>
            <Input
              type="textarea"
              name="notes"
              id="notes"
              placeholder="A short note as a notice or reminder for your co-workers to learn about this update."
              rows="3"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              required={sendNote === 'yes'}
              style={formInputStyle}
            />
          </FormGroup>
        )}

        <FormGroup>
          <div className="inv-form-btn-group">
            <Button
              color="secondary"
              className="bm-dashboard__button btn btn-secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={isSubmitting}
              className="position-relative"
              style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Update Status
                  {uploadedFiles.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info">
                      <i className="fas fa-image me-1"></i>
                      {uploadedFiles.length}
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </FormGroup>
      </Form>
    </Container>
  );
}
