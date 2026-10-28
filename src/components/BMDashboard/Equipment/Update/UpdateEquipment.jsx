import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEquipmentById, updateEquipment } from '~/actions/bmdashboard/equipmentActions';
import { Button, Form, FormGroup, Label, Container, Row, Col, Input, Alert } from 'reactstrap';
import CheckTypesModal from '~/components/BMDashboard/shared/CheckTypesModal';
import { useHistory, useParams } from 'react-router-dom';
import Radio from '~/components/common/Radio';
import DragAndDrop from '~/components/common/DragAndDrop/DragAndDrop';
import Image from '~/components/common/Image/Image';
import FilePreview from '~/components/common/FilePreview/FilePreview'; // Import the new component
import styles from './UpdateEquipment.module.css';
import styles1 from '../../BMDashboard.module.css';

const getLatestRecord = (records, predicate = () => true) =>
  (Array.isArray(records) ? records : []).reduce((latest, record) => {
    if (!predicate(record)) return latest;
    const timestamp = Date.parse(record?.date);
    if (!Number.isFinite(timestamp)) return latest;
    return !latest || timestamp >= Date.parse(latest.date) ? record : latest;
  }, null);

const getDisplayName = user => {
  if (typeof user === 'string') return /^[a-f\d]{24}$/i.test(user) ? '' : user;
  if (!user || typeof user !== 'object') return '';
  return [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
};

const formatHistoryDate = date => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? 'Unknown'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parsedDate);
};

export default function UpdateEquipment() {
  const history = useHistory();
  const { equipmentId } = useParams();
  const [modal, setModal] = useState(false);
  const [lastUsedBy, setLastUsedBy] = useState('');
  const [lastUsedByOther, setLastUsedByOther] = useState('');
  const [lastUsedFor, setLastUsedFor] = useState('');
  const [lastUsedForOther, setLastUsedForOther] = useState('');
  const [replacementRequired, setReplacementRequired] = useState('');
  const [replacementReason, setReplacementReason] = useState('');
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
  const [historyState, setHistoryState] = useState({
    equipmentId: null,
    status: 'loading',
    equipment: null,
  });
  const previewFilesRef = useRef([]);
  const historyRequestIdRef = useRef(0);
  const editedHistoryFieldsRef = useRef({
    equipmentId: null,
    lastUsedBy: false,
    lastUsedFor: false,
  });

  const storedEquipmentDetails = useSelector(state => state.bmEquipments.singleEquipment);
  const equipmentDetails =
    storedEquipmentDetails?._id === equipmentId ? storedEquipmentDetails : null;
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
    const requestId = ++historyRequestIdRef.current;
    let active = true;
    editedHistoryFieldsRef.current = {
      equipmentId,
      lastUsedBy: false,
      lastUsedFor: false,
    };
    setLastUsedBy('');
    setLastUsedByOther('');
    setLastUsedFor('');
    setLastUsedForOther('');
    setStatus('');
    setReplacementRequired('');
    setReplacementReason('');
    setDescription('');
    setNotes('');
    setSendNote('');
    setUploadedFiles([]);
    setUploadedFilesPreview([]);
    previewFilesRef.current = [];
    setSubmitError('');
    setSubmitSuccess('');
    setIsUpdated(false);
    setHistoryState({ equipmentId, status: 'loading', equipment: null });

    if (!equipmentId) {
      setHistoryState({ equipmentId, status: 'error', equipment: null });
      return undefined;
    }

    dispatch(fetchEquipmentById(equipmentId)).then(result => {
      if (!active || requestId !== historyRequestIdRef.current) return;
      if (result?.error || result?._id !== equipmentId) {
        setHistoryState({ equipmentId, status: 'error', equipment: null });
        return;
      }

      setHistoryState({ equipmentId, status: 'loaded', equipment: result });
      const latestStatus = getLatestRecord(result.updateRecord);
      const latestUsage = getLatestRecord(
        result.logRecord,
        record => record?.type === 'Check Out' && Boolean(getDisplayName(record.responsibleUser)),
      );
      const latestPurpose = getLatestRecord(
        result.updateRecord,
        record => typeof record?.lastUsedFor === 'string' && record.lastUsedFor.trim().length > 0,
      );

      if (!editedHistoryFieldsRef.current.lastUsedBy) {
        setLastUsedBy(getDisplayName(latestUsage?.responsibleUser));
      }
      if (!editedHistoryFieldsRef.current.lastUsedFor) {
        setLastUsedFor(latestPurpose?.lastUsedFor || '');
      }
      if (latestStatus) {
        setStatus(latestStatus.condition || '');
        setReplacementRequired(latestStatus.replacementRequired || '');
        setReplacementReason(latestStatus.replacementReason || '');
        setDescription(latestStatus.description || '');
        setNotes(latestStatus.notes || '');
        setSendNote(latestStatus.notes ? 'yes' : 'no');
      }
    });

    return () => {
      active = false;
      cleanupFilePreviews(previewFilesRef.current);
      previewFilesRef.current = [];
    };
  }, [dispatch, equipmentId, cleanupFilePreviews]);

  useEffect(() => {
    if (!isUpdated) return undefined;
    const timer = setTimeout(() => {
      setSubmitSuccess('');
      setIsUpdated(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isUpdated]);

  const handleCancel = useCallback(() => history.goBack(), [history]);

  const calculateDaysLeft = useCallback(endDate => {
    if (!endDate) return 'Unknown';

    const today = new Date();
    const rentalEnd = new Date(endDate);
    const timeDiff = rentalEnd.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft >= 0) {
      return daysLeft.toString();
    }
    return 'Expired';
  }, []);

  const validateForm = useCallback(() => {
    const validations = [
      [!status, 'Status/Condition is required'],
      [!lastUsedBy, 'Please specify who used the tool/equipment last time'],
      [
        lastUsedBy === 'other' && !lastUsedByOther.trim(),
        'Please specify the name of who used the tool/equipment',
      ],
      [!lastUsedFor, 'Please specify what the tool/equipment was used for'],
      [
        lastUsedFor === 'other' && !lastUsedForOther.trim(),
        'Please specify what the tool/equipment was used for',
      ],
      [!replacementRequired, 'Please indicate if replacement is required'],
      [
        replacementRequired === 'yes' && !replacementReason.trim(),
        'Please provide a reason when replacement is required',
      ],
      [sendNote === 'yes' && !notes.trim(), 'Please add a note if you selected to send one'],
    ];

    const failedValidation = validations.find(([condition]) => condition);
    return failedValidation ? failedValidation[1] : null;
  }, [
    status,
    lastUsedBy,
    lastUsedByOther,
    lastUsedFor,
    lastUsedForOther,
    replacementRequired,
    replacementReason,
    sendNote,
    notes,
  ]);

  const handleFileUpload = useCallback(
    files => {
      const validFiles = files.filter(file => {
        const fileType = file.type || '';
        const fileName = file.name || '';
        const isValidType = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(fileType);
        const isValidExtension = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        return isValidType || isValidExtension;
      });

      if (validFiles.length === 0) {
        setSubmitError('Please select a PNG, JPG, JPEG, GIF, or WEBP image.');
        return;
      }

      cleanupFilePreviews(previewFilesRef.current);
      const file = validFiles[0];
      const newPreviews = [
        {
          name: file.name || 'Image',
          preview: URL.createObjectURL(file),
          size: file.size || 0,
          type: file.type || 'image/*',
          file,
          status: 'not-saved',
          message: 'Preview only; this image is not saved with the status update.',
          uploadedAt: new Date().toISOString(),
        },
      ];

      previewFilesRef.current = newPreviews;
      setUploadedFiles([file]);
      setUploadedFilesPreview(newPreviews);
    },
    [cleanupFilePreviews],
  );

  const handleSubmit = useCallback(
    async e => {
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
          replacementReason: replacementRequired === 'yes' ? replacementReason.trim() : '',
          description,
          notes: sendNote === 'yes' ? notes : '',
        };

        const savedEquipment = await dispatch(updateEquipment(equipmentId, updateData));
        setHistoryState({ equipmentId, status: 'loaded', equipment: savedEquipment });
        setIsUpdated(true);

        const savedStatus = getLatestRecord(savedEquipment?.updateRecord);
        const toolName = savedEquipment?.itemType?.name || 'Equipment';
        const replacementText =
          savedStatus?.replacementRequired === 'yes'
            ? `Replacement required. Reason: ${savedStatus.replacementReason}`
            : 'Replacement not required.';
        setSubmitSuccess(
          `${toolName} status saved as ${savedStatus?.condition || 'Unknown'}. ${replacementText}`,
        );

        if (lastUsedBy === 'other') setLastUsedByOther('');
        if (lastUsedFor === 'other') setLastUsedForOther('');
      } catch (error) {
        console.error('Update failed:', error);

        let errorMessage = 'Failed to update equipment. Please try again.';

        if (error.message?.includes('User not authenticated')) {
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
    },
    [
      validateForm,
      status,
      lastUsedBy,
      lastUsedByOther,
      lastUsedFor,
      lastUsedForOther,
      replacementRequired,
      replacementReason,
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

  const handleRemoveFile = useCallback(index => {
    const fileToRemove = previewFilesRef.current[index];
    if (fileToRemove?.preview?.startsWith?.('blob:')) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const remainingPreviews = previewFilesRef.current.filter((_, i) => i !== index);
    previewFilesRef.current = remainingPreviews;
    setUploadedFilesPreview(remainingPreviews);
    setUploadedFiles(remainingPreviews.map(file => file.file));
  }, []);

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
  const currentStatus = useMemo(
    () => getLatestRecord(equipmentDetails?.updateRecord)?.condition || 'Unknown',
    [equipmentDetails],
  );

  const rentalDueDate = useMemo(() => equipmentDetails?.rentalDueDate?.split('T')[0] || 'Unknown', [
    equipmentDetails,
  ]);
  const summaryEquipment =
    historyState.status === 'loaded' && historyState.equipmentId === equipmentId
      ? historyState.equipment
      : null;
  const latestSummaryUpdate = getLatestRecord(summaryEquipment?.updateRecord);
  const latestSummaryUsage = getLatestRecord(
    summaryEquipment?.logRecord,
    record => record?.type === 'Check Out' && Boolean(getDisplayName(record.responsibleUser)),
  );
  const hasStatusHistory = Array.isArray(summaryEquipment?.updateRecord)
    ? summaryEquipment.updateRecord.length > 0
    : false;
  const hasUsageHistory = Array.isArray(summaryEquipment?.logRecord)
    ? summaryEquipment.logRecord.length > 0
    : false;

  const hasUploadedFiles = uploadedFiles.length > 0;
  const hasFilePreviews = uploadedFilesPreview.length > 0;
  const hasNotSavedFiles =
    hasFilePreviews && uploadedFilesPreview.some(f => f.status === 'not-saved');

  return (
    <Container className={`${styles1.invFormPageContainer} ${darkMode ? 'dark-mode' : ''}`}>
      <CheckTypesModal modal={modal} setModal={setModal} type="Equipments" />
      <Row>
        <Col md={12}>
          <header className={`${styles1.bmDashboardHeader} text-center`}>
            <h1 style={{ color: darkMode ? '#ffffff' : '#212529' }}>
              Update Tool or Equipment Status
            </h1>
            {isUpdated && (
              <output className="text-success mt-2 d-block" style={{ fontSize: '0.9rem' }}>
                <i className="fas fa-sync-alt me-2" />
                Showing updated data for Equipment ID: {equipmentId}
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
              style={{
                backgroundColor: darkMode ? '#5c1a1a' : '#f8d7da',
                borderColor: darkMode ? '#f5c2c7' : '#f1aeb5',
                color: darkMode ? '#f8d7da' : '#842029',
              }}
            >
              <i className="fas fa-exclamation-circle me-2" />
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
              className="mt-3"
              style={{
                backgroundColor: darkMode ? '#0a3a27' : '#d1e7dd',
                borderColor: darkMode ? '#badbcc' : '#a3cfbb',
                color: darkMode ? '#d1e7dd' : '#0f5132',
              }}
            >
              <i className="fas fa-check-circle me-2" />
              {submitSuccess}
              <div className="mt-2 small">
                You can continue editing or{' '}
                <Button
                  color="link"
                  className="p-0"
                  onClick={() => history.push(`/bmdashboard/tools/${equipmentId}`)}
                  style={{ color: darkMode ? '#0dcaf0' : '#0d6efd' }}
                >
                  view the equipment details
                </Button>
              </div>
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
              className={`${styles.largeSquareImage} mb-3`}
              style={{
                border: `2px solid ${darkMode ? '#444444' : '#dee2e6'}`,
                backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
              }}
            />
          </Col>
        </Row>
      )}

      <Row>
        <Col md={12}>
          <Alert color="info" className="mb-4" aria-live="polite">
            <h2 className="h5">Last Update Summary</h2>
            {historyState.status === 'loading' && (
              <p className="mb-0">Loading equipment history…</p>
            )}
            {historyState.status === 'error' && (
              <p className="mb-0">Equipment history could not be loaded.</p>
            )}
            {historyState.status === 'loaded' && !hasStatusHistory && !hasUsageHistory && (
              <p className="mb-0">No previous status or usage history.</p>
            )}
            {historyState.status === 'loaded' && (hasStatusHistory || hasUsageHistory) && (
              <dl className="mb-0">
                <dt>Last update date</dt>
                <dd>
                  {latestSummaryUpdate?.date
                    ? formatHistoryDate(latestSummaryUpdate.date)
                    : 'Unknown'}
                </dd>
                <dt>Previous status/condition</dt>
                <dd>{latestSummaryUpdate?.condition || 'Unknown'}</dd>
                <dt>Last known user</dt>
                <dd>{getDisplayName(latestSummaryUsage?.responsibleUser) || 'Unknown'}</dd>
              </dl>
            )}
          </Alert>
        </Col>
      </Row>

      <Form className={`${styles1.invForm}`} onSubmit={handleSubmit} noValidate>
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
              <div style={readonlyStyle}>{currentStatus}</div>
            </Col>
            <Col md={4}>
              <Label for="itemOwnership" style={formLabelStyle}>
                Ownership
              </Label>
              <div style={readonlyStyle}>{equipmentDetails?.purchaseStatus || 'Unknown'}</div>
            </Col>
          </Row>
          {equipmentDetails?.purchaseStatus === 'Rental' && (
            <Row form>
              <Col md={4}>
                <Label style={formLabelStyle}>Rental End Date</Label>
                <div style={readonlyStyle}>{rentalDueDate}</div>
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
            <div style={confirmationTextStyle}>
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
                style={selectInputStyle}
                className={styles['custom-select']}
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
                onChange={e => {
                  editedHistoryFieldsRef.current.lastUsedBy = true;
                  setLastUsedBy(e.target.value);
                }}
                required
                style={selectInputStyle}
                className={styles['custom-select']}
              >
                <option value="">Select user</option>
                <option value="Jane Doe (Volunteer #1)">Jane Doe (Volunteer #1)</option>
                <option value="Jane Doe (Volunteer #2)">Jane Doe (Volunteer #2)</option>
                <option value="Jane Doe (Volunteer #3)">Jane Doe (Volunteer #3)</option>
                <option value="Jane Doe (Volunteer #4)">Jane Doe (Volunteer #4)</option>
                {lastUsedBy &&
                  ![
                    'Jane Doe (Volunteer #1)',
                    'Jane Doe (Volunteer #2)',
                    'Jane Doe (Volunteer #3)',
                    'Jane Doe (Volunteer #4)',
                    'other',
                  ].includes(lastUsedBy) && <option value={lastUsedBy}>{lastUsedBy}</option>}
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
              <Input
                type="select"
                name="lastUsedFor"
                id="lastUsedFor"
                value={lastUsedFor}
                onChange={e => {
                  editedHistoryFieldsRef.current.lastUsedFor = true;
                  setLastUsedFor(e.target.value);
                }}
                required
                style={selectInputStyle}
                className={styles['custom-select']}
              >
                <option value="">Select usage</option>
                <option value="Kitchen - tiling">Kitchen - tiling</option>
                <option value="Bathroom - plumbing">Bathroom - plumbing</option>
                <option value="Living room - painting">Living room - painting</option>
                <option value="Garden - landscaping">Garden - landscaping</option>
                {lastUsedFor &&
                  ![
                    'Kitchen - tiling',
                    'Bathroom - plumbing',
                    'Living room - painting',
                    'Garden - landscaping',
                    'other',
                  ].includes(lastUsedFor) && <option value={lastUsedFor}>{lastUsedFor}</option>}
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
                  style={textInputStyle}
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
            onChange={e => {
              setReplacementRequired(e.target.value);
              if (e.target.value !== 'yes') setReplacementReason('');
            }}
            required
            darkMode={darkMode}
          />
        </FormGroup>

        {replacementRequired === 'yes' && (
          <FormGroup>
            <Label for="replacementReason" style={formLabelStyle}>
              Replacement reason *
            </Label>
            <Input
              type="textarea"
              name="replacementReason"
              id="replacementReason"
              value={replacementReason}
              onChange={e => setReplacementReason(e.target.value)}
              required
              style={textInputStyle}
            />
          </FormGroup>
        )}

        <FormGroup>
          <Label for="file-upload-input" style={formLabelStyle}>
            Select one picture for preview (optional; not saved)
            <small className="text-muted ms-2" style={{ color: darkMode ? '#b0b7c0' : '#6c757d' }}>
              Accepted: PNG, JPG, JPEG, GIF, WEBP
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
              {uploadedFiles.length} image selected for preview only; it will not be saved with this
              update.
            </Alert>
          )}

          <DragAndDrop updateUploadedFiles={handleFileUpload} multiple={false} />

          {hasFilePreviews && (
            <div className="mt-3">
              <Label style={formLabelStyle}>Uploaded Images Preview:</Label>
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
                  style={
                    hasNotSavedFiles
                      ? {
                          backgroundColor: darkMode ? '#664d03' : '#fff3cd',
                          borderColor: darkMode ? '#ffc107' : '#ffeaa7',
                          color: darkMode ? '#fff9e6' : '#664d03', // Fixed contrast
                        }
                      : {
                          backgroundColor: darkMode ? '#0a3d4f' : '#d1ecf1',
                          borderColor: darkMode ? '#0dcaf0' : '#bee5eb',
                          color: darkMode ? '#d1ecf1' : '#0c5460',
                        }
                  }
                >
                  <small>
                    <i className="fas fa-info-circle me-1" />
                    {hasNotSavedFiles
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
            style={textInputStyle}
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
            darkMode={darkMode}
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
              style={textInputStyle}
            />
          </FormGroup>
        )}

        <FormGroup>
          <div className={`${styles1.invFormBtnGroup}`}>
            <Button
              color="secondary"
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
              disabled={isSubmitting}
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
