import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateEquipment } from '~/actions/bmdashboard/equipmentActions';
import {
  Button,
  Form,
  FormGroup,
  Label,
  Container,
  Row,
  Col,
  Input,
  Alert,
  FormFeedback,
  Spinner,
} from 'reactstrap';
import CheckTypesModal from '~/components/BMDashboard/shared/CheckTypesModal';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import {
  validateEquipmentStatus,
  equipmentIdentityError,
  replacementHistoryLabel,
  CONDITIONS,
} from './equipmentStatusValidation';
import DragAndDrop from '~/components/common/DragAndDrop/DragAndDrop';
import FilePreview from '~/components/common/FilePreview/FilePreview'; // Import the new component
import styles from './UpdateEquipment.module.css';
import styles1 from '../../BMDashboard.module.css';

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg']);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const INVALID_IMAGE_MSG = 'Invalid image. Use PNG, JPG, or JPEG under 5MB.';

function isValidImage(file) {
  return (
    file &&
    ALLOWED_MIME_TYPES.has(file.type) &&
    Number.isFinite(file.size) &&
    file.size >= 0 &&
    file.size <= MAX_IMAGE_SIZE_BYTES
  );
}

function buildErrorMessage(error, hasImage) {
  const message = error.response?.data?.error || error.response?.data?.message;
  const baseError =
    (typeof message === 'string' && message.trim() ? message : null) ||
    (error.request ? 'No response from server. Please check your connection.' : null) ||
    error.message ||
    'Failed to update equipment. Please try again.';
  return hasImage
    ? `${baseError} Note: The image was selected and previewed but not saved to database.`
    : baseError;
}

function displayText(value, fallback = 'Not provided') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function FieldInput({ error, id, ...props }) {
  return (
    <>
      <Input
        {...props}
        id={id}
        invalid={Boolean(error)}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [props['aria-describedby'], error ? `${id}-error` : ''].filter(Boolean).join(' ') ||
          undefined
        }
      />
      {error && <FormFeedback id={`${id}-error`}>{error}</FormFeedback>}
    </>
  );
}

function Radio({ name, value, onChange, error, helpId }) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={`${name}-label`}
      aria-invalid={Boolean(error)}
      aria-describedby={
        [helpId, error ? `${name}-error` : ''].filter(Boolean).join(' ') || undefined
      }
    >
      {['yes', 'no'].map(option => (
        <FormGroup check inline key={option}>
          <Input
            type="radio"
            id={`${name}-${option}`}
            name={name}
            value={option}
            checked={value === option}
            onChange={onChange}
          />
          <Label check for={`${name}-${option}`}>
            {option === 'yes' ? 'Yes' : 'No'}
          </Label>
        </FormGroup>
      ))}
      {error && (
        <div id={`${name}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
}

function equipmentHasName(details) {
  return typeof details?.itemType?.name === 'string' && Boolean(details.itemType.name.trim());
}

function isCompleteEquipment(details, equipmentId) {
  return !equipmentIdentityError(details, equipmentId) && equipmentHasName(details);
}

function buildUpdateData({
  status,
  lastUsedBy,
  lastUsedByOther,
  lastUsedFor,
  lastUsedForOther,
  replacementRequired,
  description,
  notes,
  sendNote,
}) {
  return {
    condition: status,
    lastUsedBy: lastUsedBy === 'other' ? lastUsedByOther.trim() : lastUsedBy,
    lastUsedFor: lastUsedFor === 'other' ? lastUsedForOther.trim() : lastUsedFor,
    replacementRequired,
    description,
    notes: sendNote === 'yes' ? notes.trim() : '',
    sendNote,
  };
}

function previewAlertStyle(hasNotSavedFiles, darkMode) {
  return hasNotSavedFiles
    ? {
        backgroundColor: darkMode ? '#664d03' : '#fff3cd',
        borderColor: darkMode ? '#ffc107' : '#ffeaa7',
        color: darkMode ? '#fff9e6' : '#664d03', // Fixed contrast
      }
    : {
        backgroundColor: darkMode ? '#0a3d4f' : '#d1ecf1',
        borderColor: darkMode ? '#0dcaf0' : '#bee5eb',
        color: darkMode ? '#d1ecf1' : '#0c5460',
      };
}

function EquipmentImageUpload({
  formLabelStyle,
  darkMode,
  hasUploadedFiles,
  uploadedFiles,
  handleFileUpload,
  hasFilePreviews,
  uploadedFilesPreview,
  handleRemoveFile,
  hasNotSavedFiles,
}) {
  return (
    <FormGroup>
      <Label for="file-upload-input" style={formLabelStyle}>
        Upload latest picture of this equipment. (optional){' '}
        <small className="text-muted ms-2" style={{ color: darkMode ? '#b0b7c0' : '#6c757d' }}>
          Accepted: PNG, JPG, JPEG (one image, max 5MB)
        </small>
      </Label>

      {hasUploadedFiles && (
        <Alert
          color="info"
          className="mb-3"
          style={{
            backgroundColor: darkMode ? '#0a3d4f' : '#d1ecf1',
            borderColor: darkMode ? '#0dcaf0' : '#bee5eb',
            color: darkMode ? '#d1ecf1' : '#0c5460',
          }}
        >
          <i className="fas fa-info-circle me-2" />
          {uploadedFiles.length} image{uploadedFiles.length > 1 ? 's' : ''} selected for preview
        </Alert>
      )}

      <DragAndDrop updateUploadedFiles={handleFileUpload} />

      {hasFilePreviews && (
        <div className="mt-3">
          <Label style={formLabelStyle}>Selected Image Preview:</Label>
          <div className="d-flex flex-wrap gap-3 mt-2">
            {uploadedFilesPreview.map((file, index) => (
              <FilePreview
                key={`file-${index}-${file.uploadedAt || Date.now()}`}
                file={file}
                index={index}
                darkMode={darkMode}
                onRemove={handleRemoveFile}
              />
            ))}
          </div>

          <div className="mt-3">
            <Alert
              color={hasNotSavedFiles ? 'warning' : 'info'}
              style={previewAlertStyle(hasNotSavedFiles, darkMode)}
            >
              <small>
                <i className="fas fa-info-circle me-1" />
                {hasNotSavedFiles
                  ? 'The selected image was not saved. Submit again to retry.'
                  : 'The image will be submitted and saved with this status update.'}
              </small>
            </Alert>
          </div>
        </div>
      )}
    </FormGroup>
  );
}

function EquipmentFeedback({
  darkMode,
  isUpdated,
  equipmentId,
  submitError,
  submitSuccess,
  history,
}) {
  return (
    <>
      <Row>
        <Col md={12}>
          <header className={`${styles1.bmDashboardHeader} text-center`}>
            <h1 style={{ color: darkMode ? '#ffffff' : '#212529' }}>Update Equipment Status</h1>
            {isUpdated && (
              <output className="text-success mt-2 d-block" style={{ fontSize: '0.9rem' }}>
                <i className="fas fa-sync-alt me-2" />
                Update saved for Equipment ID: {equipmentId}
              </output>
            )}
          </header>
        </Col>
      </Row>

      {submitError && (
        <Row>
          <Col md={12}>
            <Alert
              color="danger"
              className="mt-3"
              role="alert"
              style={{
                backgroundColor: darkMode ? '#5c1a1a' : '#f8d7da',
                borderColor: darkMode ? '#f5c2c7' : '#f1aeb5',
                color: darkMode ? '#f8d7da' : '#842029',
              }}
            >
              <i className="fas fa-exclamation-circle me-2" aria-hidden="true" />
              {submitError}
            </Alert>
          </Col>
        </Row>
      )}

      {submitSuccess && (
        <Row>
          <Col md={12}>
            <Alert
              color="success"
              className={`mt-3 ${styles.successAlert}`}
              style={{
                backgroundColor: darkMode ? '#0a3a27' : '#d1e7dd',
                borderColor: darkMode ? '#badbcc' : '#a3cfbb',
                color: darkMode ? '#d1e7dd' : '#0f5132',
              }}
            >
              <i className={`fas fa-check-circle ${styles.successIcon}`} aria-hidden="true" />
              <p className={styles.successMessage}>{submitSuccess}</p>
              <div className={`small ${styles.successAction}`}>
                <span>You can continue editing or</span>
                <Button
                  color="link"
                  className={styles.successLink}
                  onClick={() => history.push(`/bmdashboard/equipment/${equipmentId}`)}
                  style={{ color: darkMode ? '#0dcaf0' : '#0d6efd' }}
                >
                  view the equipment details
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      )}
    </>
  );
}

export default function UpdateEquipment() {
  const { equipmentId } = useParams();
  return <EquipmentStatusForm key={equipmentId} equipmentId={equipmentId} />;
}

function EquipmentStatusForm({ equipmentId }) {
  const history = useHistory();
  const [modal, setModal] = useState(false);
  const [lastUsedBy, setLastUsedBy] = useState('');
  const [lastUsedByOther, setLastUsedByOther] = useState('');
  const [lastUsedFor, setLastUsedFor] = useState('');
  const [lastUsedForOther, setLastUsedForOther] = useState('');
  const [replacementRequired, setReplacementRequired] = useState('');
  const [description, setDescription] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [uploadedFilesPreview, setUploadedFilesPreview] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);

  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [metadataError, setMetadataError] = useState('');
  const [retry, setRetry] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const submittingRef = useRef(false);
  const activeRef = useRef(true);
  const previewRef = useRef([]);
  const hasEquipmentName = equipmentHasName(equipmentDetails);
  const metadataReady =
    !metadataLoading && !metadataError && !equipmentIdentityError(equipmentDetails, equipmentId);
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();

  // Cleanup blob URLs
  const cleanupFilePreviews = useCallback(files => {
    files.forEach(file => {
      if (file?.preview?.startsWith?.('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }, []);

  useEffect(() => {
    let active = true;
    activeRef.current = true;
    const controller = new AbortController();
    setMetadataLoading(true);
    setMetadataError('');
    setEquipmentDetails(null);
    if (!/^[a-f\d]{24}$/i.test(equipmentId || '')) {
      setMetadataError('Invalid equipment identifier. Check the equipment link.');
      setMetadataLoading(false);
      return () => {
        active = false;
        activeRef.current = false;
        controller.abort();
      };
    }
    axios
      .get(ENDPOINTS.BM_EQUIPMENT_BY_ID(equipmentId), { signal: controller.signal })
      .then(({ data }) => {
        if (!active) return;
        const identityError = equipmentIdentityError(data, equipmentId);
        if (identityError) setMetadataError(identityError);
        else setEquipmentDetails(data);
      })
      .catch(error => {
        if (!active) return;
        setMetadataError(
          error.response?.status === 404
            ? 'Equipment not found. Check the equipment link.'
            : 'Unable to retrieve equipment. Please retry.',
        );
      })
      .finally(() => {
        if (active) setMetadataLoading(false);
      });
    return () => {
      active = false;
      activeRef.current = false;
      controller.abort();
    };
  }, [equipmentId, retry]);

  useEffect(() => {
    previewRef.current = uploadedFilesPreview;
  }, [uploadedFilesPreview]);

  useEffect(() => () => cleanupFilePreviews(previewRef.current), [cleanupFilePreviews]);

  const handleCancel = useCallback(() => history.goBack(), [history]);

  const calculateDaysLeft = useCallback(endDate => {
    if (!endDate) return 'Not provided';

    const today = new Date();
    const rentalEnd = new Date(endDate);
    if (Number.isNaN(rentalEnd.getTime())) return 'Invalid rental end date';
    const timeDiff = rentalEnd.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft >= 0) {
      return daysLeft.toString();
    }
    return 'Expired';
  }, []);

  const handleFileUpload = useCallback(
    files => {
      if (!metadataReady || !hasEquipmentName || submittingRef.current) return;
      setSubmitSuccess('');
      setIsUpdated(false);
      const validFiles = files.filter(isValidImage);

      if (validFiles.length === 0) {
        setSubmitError(INVALID_IMAGE_MSG);
        return;
      }

      const selectedFile = validFiles[0];

      cleanupFilePreviews(uploadedFilesPreview);

      const newPreview = {
        name: selectedFile.name || 'Image',
        preview: URL.createObjectURL(selectedFile),
        size: selectedFile.size || 0,
        type: selectedFile.type || 'image/*',
        file: selectedFile,
        status: 'uploaded',
        uploadedAt: new Date().toISOString(),
      };

      setUploadedFiles([selectedFile]);
      setUploadedFilesPreview([newPreview]);
      setSubmitError('');
    },
    [metadataReady, hasEquipmentName, uploadedFilesPreview, cleanupFilePreviews],
  );

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();

      if (submittingRef.current) return;
      if (
        !metadataReady ||
        equipmentIdentityError(equipmentDetails, equipmentId) ||
        !hasEquipmentName
      ) {
        setSubmitError('Load the correct equipment record before submitting.');
        return;
      }
      const validationErrors = validateEquipmentStatus({
        status,
        lastUsedBy,
        lastUsedByOther,
        lastUsedFor,
        lastUsedForOther,
        replacementRequired,
        description,
        sendNote,
        notes,
        confirmed,
      });
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length) {
        setSubmitError('Please correct the highlighted fields.');
        const firstField = e.currentTarget.querySelector(
          `[name="${Object.keys(validationErrors)[0]}"]`,
        );
        firstField?.focus();
        return;
      }

      const imageFile = uploadedFiles[0] || null;

      if (imageFile && !isValidImage(imageFile)) {
        setSubmitError(INVALID_IMAGE_MSG);
        return;
      }

      submittingRef.current = true;
      setIsSubmitting(true);
      setSubmitError('');
      setSubmitSuccess('');

      try {
        const updateData = buildUpdateData({
          status,
          lastUsedBy,
          lastUsedByOther,
          lastUsedFor,
          lastUsedForOther,
          replacementRequired,
          description,
          notes,
          sendNote,
        });

        const updatedEquipment = await dispatch(
          updateEquipment(equipmentId, updateData, imageFile, { refresh: false, publish: false }),
        );
        if (!activeRef.current) return;
        // Use a complete returned record, otherwise perform one guarded metadata refresh.
        if (isCompleteEquipment(updatedEquipment, equipmentId)) {
          setEquipmentDetails(updatedEquipment);
        } else {
          setRetry(value => value + 1);
        }
        setIsUpdated(true);
        setSubmitSuccess(
          `Equipment status updated successfully. The update date was recorded by the server.${
            imageFile ? ' Image saved.' : ''
          }`,
        );
        setConfirmed(false);
        cleanupFilePreviews(uploadedFilesPreview);
        setUploadedFiles([]);
        setUploadedFilesPreview([]);
      } catch (error) {
        if (!activeRef.current) return;

        const errorMessage = buildErrorMessage(error, uploadedFiles.length > 0);

        if (uploadedFiles.length > 0) {
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
        submittingRef.current = false;
        if (activeRef.current) setIsSubmitting(false);
      }
    },
    [
      metadataReady,
      hasEquipmentName,
      equipmentDetails,
      confirmed,
      status,
      lastUsedBy,
      lastUsedByOther,
      lastUsedFor,
      lastUsedForOther,
      replacementRequired,
      description,
      sendNote,
      notes,
      dispatch,
      equipmentId,
      uploadedFiles,
      uploadedFilesPreview,
      cleanupFilePreviews,
    ],
  );

  const handleRemoveFile = useCallback(
    index => {
      const fileToRemove = uploadedFilesPreview[index];
      if (fileToRemove?.preview?.startsWith?.('blob:')) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      setUploadedFilesPreview(prev => prev.filter((_, i) => i !== index));
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    },
    [uploadedFilesPreview],
  );

  // Memoized styles
  const formLabelStyle = useMemo(
    () => ({
      fontWeight: '600',
      color: darkMode ? '#ffffff' : '#212529', // Fixed contrast
      display: 'block',
      marginBottom: '0.5rem',
    }),
    [darkMode],
  );

  const selectInputStyle = useMemo(
    () => ({
      borderColor: darkMode ? '#666666' : '#ced4da', // Fixed contrast
      backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
      color: darkMode ? '#ffffff' : '#212529', // Fixed contrast
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='${
        darkMode ? '%23ffffff' : '%23343a40'
      }' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
      backgroundSize: '16px 12px',
      paddingRight: '2.5rem',
    }),
    [darkMode],
  );

  const textInputStyle = useMemo(
    () => ({
      borderColor: darkMode ? '#666666' : '#ced4da', // Fixed contrast
      backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
      color: darkMode ? '#ffffff' : '#212529', // Fixed contrast
    }),
    [darkMode],
  );

  const readonlyStyle = useMemo(
    () => ({
      padding: '10px 12px',
      backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
      border: `1px solid ${darkMode ? '#666666' : '#ced4da'}`, // Fixed contrast
      borderRadius: '6px',
      color: darkMode ? '#ffffff' : '#212529', // Fixed contrast
      fontSize: '1rem',
      minHeight: '48px',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '5px',
      fontWeight: '500',
    }),
    [darkMode],
  );

  const confirmationTextStyle = useMemo(
    () => ({
      color: darkMode ? '#0dcaf0' : '#0d6efd',
      fontWeight: '600',
      margin: '20px 0',
      padding: '12px 16px',
      backgroundColor: darkMode ? '#1a2a3a' : '#f8f9fa',
      border: `1px solid ${darkMode ? '#0dcaf0' : '#cfe2ff'}`,
      borderRadius: '6px',
      fontSize: '1rem',
    }),
    [darkMode],
  );

  const buttonStyle = useMemo(
    () =>
      darkMode
        ? {
            backgroundColor: '#0dcaf0',
            borderColor: '#0dcaf0',
            color: '#000',
          }
        : {
            backgroundColor: '#0d6efd',
            borderColor: '#0d6efd',
            color: '#fff',
          },
    [darkMode],
  );

  const secondaryButtonStyle = useMemo(
    () =>
      darkMode
        ? {
            backgroundColor: '#555555',
            borderColor: '#555555',
            color: '#fff',
          }
        : {
            backgroundColor: '#6c757d',
            borderColor: '#6c757d',
            color: '#fff',
          },
    [darkMode],
  );

  // Derived values
  const historyRecords = Array.isArray(equipmentDetails?.updateRecord)
    ? equipmentDetails.updateRecord
    : [];
  const currentStatus = displayText(
    historyRecords[historyRecords.length - 1]?.condition,
    'No status update recorded',
  );
  const rentalDueDate =
    typeof equipmentDetails?.rentalDueDate === 'string'
      ? equipmentDetails.rentalDueDate.split('T')[0]
      : 'Not provided';

  const hasUploadedFiles = uploadedFiles.length > 0;
  const hasFilePreviews = uploadedFilesPreview.length > 0;
  const hasNotSavedFiles =
    hasFilePreviews && uploadedFilesPreview.some(f => f.status === 'not-saved');

  return (
    <Container className={`${styles1.invFormPageContainer} ${darkMode ? 'dark-mode' : ''}`}>
      <CheckTypesModal modal={modal} setModal={setModal} type="Equipments" />

      <EquipmentFeedback
        darkMode={darkMode}
        isUpdated={isUpdated}
        equipmentId={equipmentId}
        submitError={submitError}
        submitSuccess={submitSuccess}
        history={history}
      />

      {metadataReady && equipmentDetails && (
        <Row className="mb-4">
          <Col md={12}>
            <img
              id="equipment-image"
              src={equipmentDetails.imageUrl || 'https://via.placeholder.com/150'}
              alt={displayText(equipmentDetails.itemType?.name, 'Equipment')}
              className={`${styles.largeSquareImage} mb-3`}
              style={{
                borderColor: darkMode ? '#444444' : '#dee2e6',
                backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
              }}
            />
          </Col>
        </Row>
      )}

      {metadataLoading && (
        <output className={`${styles.metadataMessage} d-block`}>
          <Spinner size="sm" role="presentation" aria-hidden="true" /> Loading equipment…
        </output>
      )}
      {metadataError && (
        <Alert color="danger" role="alert">
          {metadataError}{' '}
          <Button type="button" onClick={() => setRetry(value => value + 1)}>
            Retry
          </Button>
        </Alert>
      )}
      {metadataReady && !hasEquipmentName && (
        <Alert color="warning">
          Equipment name is unavailable. Status updates are disabled until the equipment can be
          identified.
        </Alert>
      )}
      <Form
        className={`${styles1.invForm} ${styles.statusForm} ${darkMode ? styles.dark : ''}`}
        aria-label="Equipment status update"
        onSubmit={handleSubmit}
        onChange={event => {
          const { name } = event.target;
          // Upload validation owns its feedback; do not erase it as the file change bubbles.
          if (name === 'file-upload-input') return;
          setErrors(previous => {
            const next = { ...previous };
            delete next[name];
            if (name === 'sendNote') delete next.notes;
            return next;
          });
          setSubmitError('');
          setSubmitSuccess('');
          setIsUpdated(false);
        }}
        noValidate
      >
        <p>
          Fields marked * are required. The update date is recorded automatically by the server when
          you submit.
        </p>
        <fieldset
          disabled={!metadataReady || isSubmitting || !hasEquipmentName}
          className={styles.fields}
        >
          {metadataReady && (
            <FormGroup className="background-from-db">
              <Row form>
                <Col md={4}>
                  <div style={formLabelStyle}>Name</div>
                  <div style={readonlyStyle}>
                    {displayText(equipmentDetails?.itemType?.name, 'Name unavailable')}
                  </div>
                </Col>
                <Col md={4}>
                  <div style={formLabelStyle}>Equipment ID</div>
                  <div style={readonlyStyle}>{equipmentDetails?._id || 'Record not loaded'}</div>
                </Col>
                <Col md={4}>
                  <div style={formLabelStyle}>Equipment Class</div>
                  <div style={readonlyStyle}>{displayText(equipmentDetails?.equipmentClass)}</div>
                </Col>
              </Row>
              <Row form>
                <Col md={4}>
                  <div style={formLabelStyle}>Project</div>
                  <div style={readonlyStyle}>
                    {displayText(
                      equipmentDetails?.project?.name,
                      equipmentDetails?.project ? 'Project name unavailable' : 'Not assigned',
                    )}
                  </div>
                </Col>
                <Col md={4}>
                  <div style={formLabelStyle}>Latest Status Update Condition</div>
                  <div style={readonlyStyle}>{currentStatus}</div>
                  <small>
                    Latest recorded replacement need:{' '}
                    {replacementHistoryLabel(
                      historyRecords[historyRecords.length - 1]?.replacementRequired,
                    )}
                  </small>
                  <small>
                    Equipment record condition:{' '}
                    {displayText(equipmentDetails?.condition, 'Not provided')}
                  </small>
                </Col>
                <Col md={4}>
                  <div style={formLabelStyle}>Ownership</div>
                  <div style={readonlyStyle}>{displayText(equipmentDetails?.purchaseStatus)}</div>
                </Col>
              </Row>
              {['Rental', 'Rented'].includes(equipmentDetails?.purchaseStatus) && (
                <Row form>
                  <Col md={4}>
                    <div style={formLabelStyle}>Rental End Date</div>
                    <div style={readonlyStyle}>{rentalDueDate}</div>
                  </Col>
                  <Col md={4}>
                    <div style={formLabelStyle}>Days Left</div>
                    <div style={readonlyStyle}>
                      {calculateDaysLeft(equipmentDetails?.rentalDueDate)}
                    </div>
                  </Col>
                </Row>
              )}
            </FormGroup>
          )}

          <Row form>
            <Col md={12}>
              <div style={confirmationTextStyle}>
                <Label check for="equipment-confirmation">
                  <Input
                    type="checkbox"
                    id="equipment-confirmation"
                    name="confirmed"
                    checked={confirmed}
                    onChange={e => setConfirmed(e.target.checked)}
                    required
                    invalid={Boolean(errors.confirmed)}
                    aria-invalid={Boolean(errors.confirmed)}
                    aria-describedby={errors.confirmed ? 'confirmation-error' : undefined}
                  />{' '}
                  I confirm that I am updating the equipment shown above:{' '}
                  {displayText(equipmentDetails?.itemType?.name, 'Name unavailable')} ({equipmentId}
                  ). *
                </Label>
                {errors.confirmed && (
                  <div id="confirmation-error" className="invalid-feedback d-block">
                    {errors.confirmed}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <FormGroup>
                <Label for="status" style={formLabelStyle}>
                  Status/Condition Now *
                </Label>
                <FieldInput
                  id="status"
                  error={errors.status}
                  name="status"
                  type="select"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  required
                  style={selectInputStyle}
                  className={styles['custom-select']}
                >
                  <option value="">Select status</option>
                  {CONDITIONS.map(condition => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </FieldInput>
              </FormGroup>
            </Col>

            <Col md={8}>
              <FormGroup>
                <Label for="lastUsedBy" style={formLabelStyle}>
                  Who used the equipment last time? *
                </Label>
                <FieldInput
                  type="select"
                  name="lastUsedBy"
                  id="lastUsedBy"
                  error={errors.lastUsedBy}
                  value={lastUsedBy}
                  onChange={e => setLastUsedBy(e.target.value)}
                  required
                  style={selectInputStyle}
                  className={styles['custom-select']}
                >
                  <option value="">Select user</option>
                  <option value="Jane Doe (Volunteer #1)">Jane Doe (Volunteer #1)</option>
                  <option value="Jane Doe (Volunteer #2)">Jane Doe (Volunteer #2)</option>
                  <option value="Jane Doe (Volunteer #3)">Jane Doe (Volunteer #3)</option>
                  <option value="Jane Doe (Volunteer #4)">Jane Doe (Volunteer #4)</option>
                  <option value="other">Other (Please specify below)</option>
                </FieldInput>
                {lastUsedBy === 'other' && (
                  <FieldInput
                    type="text"
                    name="lastUsedByOther"
                    id="lastUsedByOther"
                    maxLength={200}
                    error={errors.lastUsedByOther}
                    aria-label="Name of the last equipment user (required)"
                    placeholder="Please specify the name"
                    value={lastUsedByOther}
                    onChange={e => setLastUsedByOther(e.target.value)}
                    className="mt-2"
                    required
                    style={textInputStyle}
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
                <FieldInput
                  type="select"
                  name="lastUsedFor"
                  id="lastUsedFor"
                  error={errors.lastUsedFor}
                  value={lastUsedFor}
                  onChange={e => setLastUsedFor(e.target.value)}
                  required
                  style={selectInputStyle}
                  className={styles['custom-select']}
                >
                  <option value="">Select usage</option>
                  <option value="Kitchen - tiling">Kitchen - tiling</option>
                  <option value="Bathroom - plumbing">Bathroom - plumbing</option>
                  <option value="Living room - painting">Living room - painting</option>
                  <option value="Garden - landscaping">Garden - landscaping</option>
                  <option value="other">Other (Please specify below)</option>
                </FieldInput>
                {lastUsedFor === 'other' && (
                  <FieldInput
                    type="text"
                    name="lastUsedForOther"
                    id="lastUsedForOther"
                    maxLength={500}
                    error={errors.lastUsedForOther}
                    aria-label="Last equipment usage (required)"
                    placeholder="Please specify the task"
                    value={lastUsedForOther}
                    onChange={e => setLastUsedForOther(e.target.value)}
                    className="mt-2"
                    required
                    style={textInputStyle}
                  />
                )}
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label
              className="form-control-label"
              id="replacementRequired-label"
              style={formLabelStyle}
            >
              Require a replacement? (optional)
            </Label>
            <Radio
              name="replacementRequired"
              error={errors.replacementRequired}
              helpId="replacement-help"
              value={replacementRequired}
              onChange={e => setReplacementRequired(e.target.value)}
            />
            <small id="replacement-help">
              Records whether a replacement is needed. This does not create a purchase request.
            </small>
          </FormGroup>

          <EquipmentImageUpload
            formLabelStyle={formLabelStyle}
            darkMode={darkMode}
            hasUploadedFiles={hasUploadedFiles}
            uploadedFiles={uploadedFiles}
            handleFileUpload={handleFileUpload}
            hasFilePreviews={hasFilePreviews}
            uploadedFilesPreview={uploadedFilesPreview}
            handleRemoveFile={handleRemoveFile}
            hasNotSavedFiles={hasNotSavedFiles}
          />

          <FormGroup>
            <Label for="description" style={formLabelStyle}>
              Additional Description (optional)
            </Label>
            <FieldInput
              type="textarea"
              name="description"
              id="description"
              maxLength={2000}
              error={errors.description}
              placeholder="Provide detail description if needed."
              rows="3"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={textInputStyle}
            />
          </FormGroup>

          <FormGroup>
            <Label className="form-control-label" id="sendNote-label" style={formLabelStyle}>
              Do you want to send a note for this update?
            </Label>
            <Radio
              name="sendNote"
              helpId="note-help"
              value={sendNote}
              onChange={e => setSendNote(e.target.value)}
            />
            <small id="note-help">
              Saves a note with this update. No message, email, or notification is sent.
            </small>
          </FormGroup>

          {sendNote === 'yes' && (
            <FormGroup>
              <Label for="notes" style={formLabelStyle}>
                Update note *
              </Label>
              <FieldInput
                type="textarea"
                name="notes"
                id="notes"
                maxLength={2000}
                error={errors.notes}
                placeholder="A short note as a notice or reminder for your co-workers to learn about this update."
                rows="3"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                required={sendNote === 'yes'}
                style={textInputStyle}
              />
            </FormGroup>
          )}
        </fieldset>
        <FormGroup>
          <div className={`${styles1.invFormBtnGroup}`}>
            <Button
              color="secondary"
              type="button"
              className={`${styles1.bmDashboardButton} btn btn-secondary`}
              onClick={handleCancel}
              disabled={isSubmitting}
              style={secondaryButtonStyle}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={isSubmitting || !metadataReady || !hasEquipmentName}
              className="position-relative"
              style={buttonStyle}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2" />
                  Update Status
                  {hasUploadedFiles && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                      style={{
                        backgroundColor: darkMode ? '#0dcaf0' : '#0d6efd',
                        color: darkMode ? '#000' : '#fff',
                      }}
                    >
                      <i className="fas fa-image me-1" />
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
