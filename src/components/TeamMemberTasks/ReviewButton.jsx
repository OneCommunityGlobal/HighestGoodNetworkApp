import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Input,
  Spinner,
} from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dompurify from 'dompurify';
import styles from './style.module.css';
import style from './reviewButton.module.css';
import { boxStyle, boxStyleDark } from '~/styles';
import '../Header/index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPencilAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import httpService from '../../services/httpService';
import { ApiEndpoint } from '~/utils/URL';
import hasPermission from '~/utils/permissions';

// ─── Module-level utilities (no component dependency) ───────────────────────

const sanitizer = dompurify.sanitize;

const DOMAIN_LABEL = '[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?';
const DOMAIN_PATTERN = new RegExp(
  String.raw`^${DOMAIN_LABEL}(?:\.${DOMAIN_LABEL})*\.[a-zA-Z]{2,}$`,
);
const PATH_PATTERN = /^[/\w.\-~:?#[\]@!$&'()*+,;=%]*$/;

const REVIEWER_ROLES = new Set(['Owner', 'Administrator', 'Mentor', 'Manager']);

const INVALID_DOMAIN_DEFAULT_MESSAGE =
  'Nice try, but that link is about as useful as a chocolate teapot! We need a GitHub PR link, Google Doc, Dropbox folder, Figma design, or One Community webpage.';

const INVALID_DROPBOX_MESSAGE =
  'Oops! That link\'s about as helpful as a screen door on a submarine. Please use the "Share" or "Copy link to" option to create a DropBox link that works for people other than just you.';

const sanitizeUrl = url => {
  if (!url) return '';
  return sanitizer(url.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

const sanitizeText = text => {
  if (!text) return '';
  return sanitizer(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

const validURL = url => {
  try {
    if (!url || url.trim() === '') return false;
    if (url.length < 20) return false;

    const protocolPattern = /^https?:\/\//;

    const urlToTest = url.startsWith('http') ? url : `https://${url}`;

    if (!protocolPattern.test(urlToTest)) return false;

    const urlWithoutProtocol = urlToTest.replace(protocolPattern, '');
    const slashIndex = urlWithoutProtocol.indexOf('/');
    const domain =
      slashIndex === -1 ? urlWithoutProtocol : urlWithoutProtocol.substring(0, slashIndex);
    const path = slashIndex === -1 ? '' : urlWithoutProtocol.substring(slashIndex);

    if (!DOMAIN_PATTERN.test(domain)) return false;
    if (path && !PATH_PATTERN.test(path)) return false;

    try {
      new URL(urlToTest);
      return true;
    } catch (e) {
      return false;
    }
  } catch (err) {
    return false;
  }
};

const validateGoogleDoc = normalizedUrl => {
  const isDocType =
    normalizedUrl.includes('/document/d/') ||
    normalizedUrl.includes('/spreadsheets/d/') ||
    normalizedUrl.includes('/presentation/d/') ||
    normalizedUrl.includes('/forms/d/');
  return isDocType
    ? { isValid: true, errorType: null }
    : { isValid: false, errorType: 'general_invalid' };
};

const validateDropbox = normalizedUrl => {
  const isShared =
    normalizedUrl.includes('dropbox.com/s/') || normalizedUrl.includes('dropbox.com/scl/');
  return isShared
    ? { isValid: true, errorType: null }
    : { isValid: false, errorType: 'invalid_dropbox_link' };
};

const validateGitHub = normalizedUrl =>
  normalizedUrl.includes('/pull/')
    ? { isValid: true, errorType: null }
    : { isValid: false, errorType: 'general_invalid' };

const validateFigma = normalizedUrl =>
  normalizedUrl.includes('/design/')
    ? { isValid: true, errorType: null }
    : { isValid: false, errorType: 'general_invalid' };

const validateAllowedDomainTypes = url => {
  if (!url) return { isValid: false, errorType: 'missing_url' };

  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.includes('docs.google.com')) return validateGoogleDoc(normalizedUrl);
  if (normalizedUrl.includes('dropbox.com')) return validateDropbox(normalizedUrl);
  if (normalizedUrl.includes('github.com')) return validateGitHub(normalizedUrl);
  if (
    normalizedUrl.includes('onecommunityglobal.org') ||
    normalizedUrl.includes('onecommunityglobal.com') ||
    normalizedUrl.includes('onecommunity.org') ||
    normalizedUrl.includes('onecommunity.com')
  ) {
    return { isValid: true, errorType: null };
  }
  if (normalizedUrl.includes('figma.com')) return validateFigma(normalizedUrl);

  return { isValid: false, errorType: 'general_invalid' };
};

const handleSafeLink = url => {
  const sanitizedUrl = sanitizeUrl(url);
  const validationResult = validateAllowedDomainTypes(sanitizedUrl);
  return validationResult.isValid && validURL(sanitizedUrl) ? sanitizedUrl : '#';
};

const getInvalidDomainErrorMessage = errorType =>
  errorType === 'invalid_dropbox_link' ? INVALID_DROPBOX_MESSAGE : INVALID_DOMAIN_DEFAULT_MESSAGE;

const getReviewStatus = (task, user) => {
  const resource = task.resources.find(r => r.userID === user.personId);
  return resource ? resource.reviewStatus || 'Unsubmitted' : 'Unsubmitted';
};

const buildResourcesWithStatus = (resources, newStatus) =>
  resources.map(resource => ({
    ...resource,
    reviewStatus: newStatus,
    completedTask: newStatus === 'Reviewed',
  }));

const canActAsReviewer = (myRole, canReview) => REVIEWER_ROLES.has(myRole) || canReview;

const validateLinkInput = sanitizedLink => {
  if (!validURL(sanitizedLink)) {
    return {
      isValid: false,
      error:
        'Please enter a valid URL (must start with http:// or https:// and be at least 20 characters)',
    };
  }
  const domainResult = validateAllowedDomainTypes(sanitizedLink);
  if (!domainResult.isValid) {
    return { isValid: false, errorType: domainResult.errorType };
  }
  return { isValid: true };
};

const sendReviewNotification = (myUserId, user, task, isLinkUpdate = false) => {
  const data = {
    myUserId: sanitizeText(myUserId),
    name: sanitizeText(user.name),
    taskName: sanitizeText(task.taskName),
  };
  if (isLinkUpdate) data.isLinkUpdate = true;
  httpService.post(`${ApiEndpoint}/tasks/reviewreq/${sanitizeText(myUserId)}`, data);
};

const applyLinkValidationError = (validation, setEditLinkState, toggleInvalidDomainModal) => {
  if (validation.error) {
    setEditLinkState(prev => ({ ...prev, error: validation.error }));
    return;
  }
  toggleInvalidDomainModal(validation.errorType);
};

const updateTaskRelatedWorkLink = (task, sanitizedLink) => {
  const updatedTask = { ...task };
  if (Array.isArray(updatedTask.relatedWorkLinks) && updatedTask.relatedWorkLinks.length > 0) {
    updatedTask.relatedWorkLinks[updatedTask.relatedWorkLinks.length - 1] = sanitizedLink;
  } else {
    updatedTask.relatedWorkLinks = [sanitizedLink];
  }
  return updatedTask;
};

const getReadyForReviewDropdownStyle = darkMode => ({
  backgroundColor: '#E5F4E8',
  color: '#326749',
  borderColor: '#C3E6CB',
  ...(darkMode ? boxStyleDark : boxStyle),
});

const getReviewActionHandler = (action, onSelectAction, onToggleVerify) => () => {
  onSelectAction(action);
  onToggleVerify();
};

function OwnerSubmittedDropdown({ task, darkMode, onToggleEditLinkModal }) {
  return (
    <UncontrolledDropdown>
      <DropdownToggle
        className={`${styles['btn--dark-sea-green']} ${style.reviewBtn} ${style['reviewBtn-dropdown-wrapper']}`}
        caret
        style={getReadyForReviewDropdownStyle(darkMode)}
      >
        Ready for Review
      </DropdownToggle>
      <DropdownMenu container="body" strategy="fixed" className={style['review-button-dropdown']}>
        <WorkLinkItems relatedWorkLinks={task.relatedWorkLinks} darkMode={darkMode} />
        <DropdownItem
          onClick={onToggleEditLinkModal}
          className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
        >
          <FontAwesomeIcon icon={faPencilAlt} /> Edit Link
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

OwnerSubmittedDropdown.propTypes = {
  task: PropTypes.shape({
    relatedWorkLinks: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  darkMode: PropTypes.bool.isRequired,
  onToggleEditLinkModal: PropTypes.func.isRequired,
};

function ReviewerSubmittedDropdown({
  task,
  darkMode,
  onToggleEditLinkModal,
  onSelectAction,
  onToggleVerify,
}) {
  return (
    <UncontrolledDropdown>
      <DropdownToggle
        className={`${styles['btn--dark-sea-green']} ${style.reviewBtn}`}
        caret
        style={darkMode ? boxStyleDark : boxStyle}
      >
        Ready for Review
      </DropdownToggle>
      <DropdownMenu container="body" strategy="fixed" className={style['review-button-dropdown']}>
        <WorkLinkItems relatedWorkLinks={task.relatedWorkLinks} darkMode={darkMode} />
        <DropdownItem
          onClick={onToggleEditLinkModal}
          className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
        >
          <FontAwesomeIcon icon={faPencilAlt} /> Edit Link
        </DropdownItem>
        <DropdownItem
          onClick={getReviewActionHandler('Complete and Remove', onSelectAction, onToggleVerify)}
          className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
        >
          <div className={styles['review-dropdown-item']}>
            <FontAwesomeIcon className={styles['team-member-tasks-done']} icon={faCheck} />
            <span>as complete and remove task</span>
          </div>
        </DropdownItem>
        <DropdownItem
          onClick={getReviewActionHandler('More Work Needed', onSelectAction, onToggleVerify)}
          className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
        >
          More work needed, reset this button
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

ReviewerSubmittedDropdown.propTypes = {
  task: PropTypes.shape({
    relatedWorkLinks: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  darkMode: PropTypes.bool.isRequired,
  onToggleEditLinkModal: PropTypes.func.isRequired,
  onSelectAction: PropTypes.func.isRequired,
  onToggleVerify: PropTypes.func.isRequired,
};

// ─── Small presentational sub-components ────────────────────────────────────

function UpdateButtonContent({ isEditing, isSuccess }) {
  if (isEditing) {
    return (
      <>
        <Spinner size="sm" className="mr-2" /> Updating…
      </>
    );
  }
  if (isSuccess) {
    return (
      <>
        <FontAwesomeIcon icon={faCheck} className="mr-2" /> Updated!
      </>
    );
  }
  return 'Update Link';
}

UpdateButtonContent.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  isSuccess: PropTypes.bool.isRequired,
};

function WorkLinkItems({ relatedWorkLinks, darkMode }) {
  if (!relatedWorkLinks) return null;
  return relatedWorkLinks.map(workLink => (
    <DropdownItem
      key={sanitizeText(workLink)}
      href={handleSafeLink(workLink)}
      target="_blank"
      className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
    >
      <FontAwesomeIcon icon={faExternalLinkAlt} /> View Link
    </DropdownItem>
  ));
}

WorkLinkItems.propTypes = {
  relatedWorkLinks: PropTypes.arrayOf(PropTypes.string),
  darkMode: PropTypes.bool.isRequired,
};

WorkLinkItems.defaultProps = {
  relatedWorkLinks: null,
};

// ─── Button display (pure rendering, no state) ───────────────────────────────

function ReviewButtonDisplay({
  user,
  task,
  myUserId,
  myRole,
  canReview,
  reviewStatus,
  darkMode,
  isSubmitting,
  onToggleModal,
  onToggleEditLinkModal,
  onSelectAction,
  onToggleVerify,
}) {
  if (user.personId === myUserId && reviewStatus === 'Unsubmitted') {
    return (
      <button
        className={`${style.reviewBtn} btn btn-primary`}
        onClick={onToggleModal}
        type="button"
        style={darkMode ? boxStyleDark : boxStyle}
        disabled={isSubmitting}
      >
        Submit for Review
      </button>
    );
  }

  if (reviewStatus !== 'Submitted') return null;

  if (user.personId === myUserId) {
    return (
      <OwnerSubmittedDropdown
        task={task}
        darkMode={darkMode}
        onToggleEditLinkModal={onToggleEditLinkModal}
      />
    );
  }

  if (canActAsReviewer(myRole, canReview)) {
    return (
      <ReviewerSubmittedDropdown
        task={task}
        darkMode={darkMode}
        onToggleEditLinkModal={onToggleEditLinkModal}
        onSelectAction={onSelectAction}
        onToggleVerify={onToggleVerify}
      />
    );
  }

  return (
    <Button className={style.reviewBtn} color="success" disabled>
      Ready for Review
    </Button>
  );
}

ReviewButtonDisplay.propTypes = {
  user: PropTypes.shape({
    personId: PropTypes.string.isRequired,
  }).isRequired,
  task: PropTypes.shape({
    relatedWorkLinks: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  myUserId: PropTypes.string.isRequired,
  myRole: PropTypes.string.isRequired,
  canReview: PropTypes.bool.isRequired,
  reviewStatus: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onToggleModal: PropTypes.func.isRequired,
  onToggleEditLinkModal: PropTypes.func.isRequired,
  onSelectAction: PropTypes.func.isRequired,
  onToggleVerify: PropTypes.func.isRequired,
};

const reviewModalClass = darkMode => (darkMode ? 'text-light dark-mode' : '');
const reviewHeaderClass = darkMode => (darkMode ? 'bg-space-cadet' : '');
const reviewSectionClass = darkMode => (darkMode ? 'bg-yinmn-blue' : '');
const reviewButtonStyle = darkMode => (darkMode ? boxStyleDark : boxStyle);

function ReviewVerifyModal({
  darkMode,
  isOpen,
  onToggle,
  selectedAction,
  onConfirm,
  reviewStatus,
}) {
  return (
    <Modal isOpen={isOpen} toggle={onToggle} className={reviewModalClass(darkMode)}>
      <ModalHeader toggle={onToggle} className={reviewHeaderClass(darkMode)}>
        {selectedAction === 'Complete and Remove' && 'Are you sure you have completed the review?'}
        {selectedAction === 'More Work Needed' && 'Are you sure?'}
      </ModalHeader>
      <ModalFooter className={reviewSectionClass(darkMode)}>
        <Button
          onClick={onConfirm}
          color="primary"
          className="float-left"
          style={reviewButtonStyle(darkMode)}
        >
          {reviewStatus === 'Unsubmitted' ? `Submit` : `Complete`}
        </Button>
        <Button onClick={onToggle} style={reviewButtonStyle(darkMode)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

ReviewVerifyModal.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  selectedAction: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  reviewStatus: PropTypes.string.isRequired,
};

function ReviewConfirmSubmitModal({ darkMode, isOpen, onToggle, link, onConfirm }) {
  return (
    <Modal isOpen={isOpen} toggle={onToggle} className={reviewModalClass(darkMode)}>
      <ModalHeader toggle={onToggle} className={reviewHeaderClass(darkMode)}>
        Confirm Submission
      </ModalHeader>
      <ModalBody className={reviewSectionClass(darkMode)}>
        You are about to submit the following link for review:
        <div className="mt-2" style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
          <span>{sanitizeText(link)}</span>
        </div>
        Please confirm if this is the correct link.
      </ModalBody>
      <ModalFooter className={reviewSectionClass(darkMode)}>
        <Button color="primary" onClick={onConfirm} style={reviewButtonStyle(darkMode)}>
          Confirm and Submit
        </Button>
        <Button onClick={onToggle} style={reviewButtonStyle(darkMode)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

ReviewConfirmSubmitModal.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  link: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

function ReviewSubmissionModal({
  darkMode,
  isOpen,
  onToggle,
  reviewStatus,
  link,
  onLinkChange,
  linkError,
  onSubmit,
  onCancel,
}) {
  return (
    <Modal isOpen={isOpen} toggle={onToggle} className={reviewModalClass(darkMode)}>
      <ModalHeader toggle={onToggle} className={reviewHeaderClass(darkMode)}>
        Change Review Status
      </ModalHeader>
      <ModalBody className={reviewSectionClass(darkMode)}>
        {reviewStatus === 'Unsubmitted'
          ? `Are you sure you want to submit for review?`
          : `Are you sure you have completed the review?`}
      </ModalBody>
      <ModalBody className={reviewSectionClass(darkMode)}>
        Please add link to related work:
        <Input type="text" required value={link} onChange={onLinkChange} />
        {linkError && <div className="text-danger">{sanitizeText(linkError)}</div>}
      </ModalBody>
      <ModalFooter className={reviewSectionClass(darkMode)}>
        <Button
          onClick={onSubmit}
          color="primary"
          className="float-left"
          style={reviewButtonStyle(darkMode)}
        >
          {reviewStatus === 'Unsubmitted' ? `Submit` : `Complete`}
        </Button>
        <Button onClick={onCancel} style={reviewButtonStyle(darkMode)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

ReviewSubmissionModal.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  reviewStatus: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  onLinkChange: PropTypes.func.isRequired,
  linkError: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function ReviewEditLinkModal({
  darkMode,
  isOpen,
  onToggle,
  link,
  onLinkChange,
  linkError,
  onSubmit,
  isEditing,
  isSuccess,
}) {
  return (
    <Modal isOpen={isOpen} toggle={onToggle} className={reviewModalClass(darkMode)}>
      <ModalHeader toggle={onToggle} className={reviewHeaderClass(darkMode)}>
        Edit Submitted Link
      </ModalHeader>
      <ModalBody className={reviewSectionClass(darkMode)}>
        <p>Update the link to your submitted work:</p>
        <Input type="text" required value={link} onChange={onLinkChange} />
        {linkError && <div className="text-danger">{sanitizeText(linkError)}</div>}
      </ModalBody>
      <ModalFooter className={reviewSectionClass(darkMode)}>
        <Button
          onClick={onSubmit}
          color="primary"
          className="float-left"
          style={reviewButtonStyle(darkMode)}
          disabled={isEditing}
        >
          <UpdateButtonContent isEditing={isEditing} isSuccess={isSuccess} />
        </Button>
        <Button onClick={onToggle} style={reviewButtonStyle(darkMode)} disabled={isEditing}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

ReviewEditLinkModal.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  link: PropTypes.string.isRequired,
  onLinkChange: PropTypes.func.isRequired,
  linkError: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isSuccess: PropTypes.bool.isRequired,
};

function ReviewInvalidDomainModal({ darkMode, isOpen, onToggle, errorMessage }) {
  return (
    <Modal isOpen={isOpen} toggle={onToggle} className={reviewModalClass(darkMode)}>
      <ModalHeader toggle={onToggle} className={reviewHeaderClass(darkMode)}>
        Invalid Domain Type
      </ModalHeader>
      <ModalBody className={reviewSectionClass(darkMode)}>
        <div className="text-center mb-3">
          <span role="img" aria-label="warning" style={{ fontSize: '2rem' }}>
            ⚠️
          </span>
        </div>
        <p>{sanitizeText(errorMessage)}</p>
        <div className="mt-3">
          <strong>Acceptable link types:</strong>
          <ul className="mt-2" style={{ paddingLeft: '25px' }}>
            <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>
              Google Doc (docs.google.com)
            </li>
            <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>
              Dropbox shared link (must contain /s/ or /scl/)
            </li>
            <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>
              GitHub PR link (must contain /pull/)
            </li>
            <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>
              One Community webpage (onecommunityglobal.org)
            </li>
            <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>Figma design (figma.com)</li>
          </ul>
        </div>
      </ModalBody>
      <ModalFooter className={reviewSectionClass(darkMode)}>
        <Button color="primary" onClick={onToggle} style={reviewButtonStyle(darkMode)}>
          Got it!
        </Button>
      </ModalFooter>
    </Modal>
  );
}

ReviewInvalidDomainModal.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

function ReviewButtonModals({
  darkMode,
  verifyModal,
  onToggleVerifyModal,
  selectedAction,
  onVerifyConfirm,
  reviewStatus,
  confirmSubmitModal,
  onToggleConfirmSubmitModal,
  link,
  onFinalSubmit,
  modal,
  onToggleModal,
  onSubmissionModalSubmit,
  onModalCancel,
  onLinkChange,
  editLinkState,
  onToggleEditLinkModal,
  onEditLink,
  onEditLinkChange,
  invalidDomainModal,
  onToggleInvalidDomainModal,
}) {
  return (
    <>
      <ReviewVerifyModal
        darkMode={darkMode}
        isOpen={verifyModal}
        onToggle={onToggleVerifyModal}
        selectedAction={selectedAction}
        onConfirm={onVerifyConfirm}
        reviewStatus={reviewStatus}
      />
      <ReviewConfirmSubmitModal
        darkMode={darkMode}
        isOpen={confirmSubmitModal}
        onToggle={onToggleConfirmSubmitModal}
        link={link}
        onConfirm={onFinalSubmit}
      />
      <ReviewSubmissionModal
        darkMode={darkMode}
        isOpen={modal}
        onToggle={onToggleModal}
        reviewStatus={reviewStatus}
        link={link}
        onLinkChange={onLinkChange}
        linkError={editLinkState.error}
        onSubmit={onSubmissionModalSubmit}
        onCancel={onModalCancel}
      />
      <ReviewEditLinkModal
        darkMode={darkMode}
        isOpen={editLinkState.isOpen}
        onToggle={onToggleEditLinkModal}
        link={editLinkState.link}
        onLinkChange={onEditLinkChange}
        linkError={editLinkState.error}
        onSubmit={onEditLink}
        isEditing={editLinkState.isEditing}
        isSuccess={editLinkState.isSuccess}
      />
      <ReviewInvalidDomainModal
        darkMode={darkMode}
        isOpen={invalidDomainModal.isOpen}
        onToggle={onToggleInvalidDomainModal}
        errorMessage={invalidDomainModal.errorMessage}
      />
    </>
  );
}

ReviewButtonModals.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  verifyModal: PropTypes.bool.isRequired,
  onToggleVerifyModal: PropTypes.func.isRequired,
  selectedAction: PropTypes.string,
  onVerifyConfirm: PropTypes.func.isRequired,
  reviewStatus: PropTypes.string.isRequired,
  confirmSubmitModal: PropTypes.bool.isRequired,
  onToggleConfirmSubmitModal: PropTypes.func.isRequired,
  link: PropTypes.string.isRequired,
  onFinalSubmit: PropTypes.func.isRequired,
  modal: PropTypes.bool.isRequired,
  onToggleModal: PropTypes.func.isRequired,
  onSubmissionModalSubmit: PropTypes.func.isRequired,
  onModalCancel: PropTypes.func.isRequired,
  onLinkChange: PropTypes.func.isRequired,
  editLinkState: PropTypes.shape({
    isOpen: PropTypes.bool,
    link: PropTypes.string,
    isEditing: PropTypes.bool,
    isSuccess: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
  onToggleEditLinkModal: PropTypes.func.isRequired,
  onEditLink: PropTypes.func.isRequired,
  onEditLinkChange: PropTypes.func.isRequired,
  invalidDomainModal: PropTypes.shape({
    isOpen: PropTypes.bool,
    errorMessage: PropTypes.string,
  }).isRequired,
  onToggleInvalidDomainModal: PropTypes.func.isRequired,
};

// ─── Main component ──────────────────────────────────────────────────────────

function ReviewButton({ user, task, updateTask }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const myUserId = useSelector(state => state.auth.user.userid);
  const myRole = useSelector(state => state.auth.user.role);
  const canReview = dispatch(hasPermission('putReviewStatus'));

  const [modal, setModal] = useState(false);
  const [link, setLink] = useState('');
  const [verifyModal, setVerifyModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [editLinkState, setEditLinkState] = useState({
    isOpen: false,
    link: '',
    isEditing: false,
    isSuccess: false,
    error: null,
  });
  const [invalidDomainModal, setInvalidDomainModal] = useState({
    isOpen: false,
    errorType: null,
    errorMessage: '',
  });

  const reviewStatus = useMemo(() => getReviewStatus(task, user), [task, user]);

  // ── Toggles ───────────────────────────────────────────────────────────────

  const toggleModal = () => {
    setModal(prev => {
      if (!prev) setEditLinkState(s => ({ ...s, error: null }));
      return !prev;
    });
  };

  const toggleEditLinkModal = () => {
    setEditLinkState(prev => {
      if (prev.isOpen) return { ...prev, isOpen: false, isEditing: false };
      const userLink = task.relatedWorkLinks?.[task.relatedWorkLinks.length - 1] || '';
      return { ...prev, isOpen: true, isEditing: false, link: sanitizeUrl(userLink), error: null };
    });
  };

  const toggleInvalidDomainModal = (errorType = null) => {
    if (!invalidDomainModal.isOpen && errorType) {
      setInvalidDomainModal({
        isOpen: true,
        errorType,
        errorMessage: getInvalidDomainErrorMessage(errorType),
      });
    } else {
      setInvalidDomainModal({ isOpen: false, errorType: null, errorMessage: '' });
    }
  };

  // ── Core actions ──────────────────────────────────────────────────────────

  const updReviewStat = newStatus => {
    const newResources = buildResourcesWithStatus(task.resources, newStatus);
    let updatedTask = { ...task, resources: newResources };
    const taskRelatedWorkLinks = Array.isArray(task.relatedWorkLinks) ? task.relatedWorkLinks : [];

    if (newStatus === 'Submitted' && link) {
      const sanitizedLink = sanitizeUrl(link);
      if (validURL(sanitizedLink)) {
        updatedTask = {
          ...updatedTask,
          relatedWorkLinks: [...taskRelatedWorkLinks, sanitizedLink],
        };
        setLink('');
      } else {
        setIsSubmitting(false);
        return;
      }
    }
    updateTask(task._id, updatedTask);
    setModal(false);
    setIsSubmitting(true);
  };

  const submitReviewRequest = event => {
    event.preventDefault();
    const validation = validateLinkInput(sanitizeUrl(link));
    if (!validation.isValid) {
      applyLinkValidationError(validation, setEditLinkState, toggleInvalidDomainModal);
      return;
    }
    setConfirmSubmitModal(prev => !prev);
  };

  const handleFinalSubmit = () => {
    updReviewStat('Submitted');
    setConfirmSubmitModal(prev => !prev);
    sendReviewNotification(myUserId, user, task);
  };

  const completeEditLinkUpdate = sanitizedLink => {
    sendReviewNotification(myUserId, user, task, true);
    setEditLinkState(prev => ({ ...prev, isSuccess: true }));
    setTimeout(() => {
      setEditLinkState(prev => ({ ...prev, isSuccess: false, isOpen: false }));
    }, 1500);
  };

  const runEditLinkUpdate = sanitizedLink => {
    const updatedTask = updateTaskRelatedWorkLink(task, sanitizedLink);
    const result = updateTask(task._id, updatedTask);

    if (result && typeof result.then === 'function') {
      result
        .then(() => completeEditLinkUpdate(sanitizedLink))
        .catch(error => {
          toast.error('Error updating link:', error);
          setEditLinkState(prev => ({
            ...prev,
            error: 'Failed to update link. Please try again.',
          }));
        })
        .finally(() => {
          setEditLinkState(prev => ({ ...prev, isEditing: false }));
        });
      return;
    }

    completeEditLinkUpdate(sanitizedLink);
    setEditLinkState(prev => ({ ...prev, isEditing: false }));
  };

  const handleEditLink = () => {
    const sanitizedLink = sanitizeUrl(editLinkState.link);
    const validation = validateLinkInput(sanitizedLink);

    if (!validation.isValid) {
      applyLinkValidationError(validation, setEditLinkState, toggleInvalidDomainModal);
      return;
    }

    setEditLinkState(prev => ({ ...prev, isEditing: true }));
    runEditLinkUpdate(sanitizedLink);
  };

  // ── Input handlers ────────────────────────────────────────────────────────

  const handleLink = e => {
    const url = sanitizeUrl(e.target.value);
    setLink(url);
    if (!url) {
      setEditLinkState(prev => ({ ...prev, error: 'A valid URL is required for review' }));
    } else if (!validURL(url)) {
      setEditLinkState(prev => ({
        ...prev,
        error: "Please enter a valid URL starting with 'https://'.",
      }));
    } else {
      setEditLinkState(prev => ({ ...prev, error: null }));
    }
  };

  const handleEditLinkChange = e => {
    const rawValue = e?.target?.value ?? '';
    setEditLinkState(prev => ({ ...prev, link: sanitizeUrl(rawValue) }));
  };

  const handleVerifyConfirm = e => {
    setVerifyModal(false);
    if (selectedAction === 'More Work Needed') {
      updReviewStat('Unsubmitted');
      setIsSubmitting(false);
    } else if (reviewStatus === 'Unsubmitted') {
      submitReviewRequest(e);
    } else {
      updReviewStat('Reviewed');
    }
  };

  const handleSubmissionModalSubmit = e => {
    e.preventDefault();
    const sanitizedLink = sanitizeUrl(link);
    if (!sanitizedLink || !validURL(sanitizedLink)) {
      setEditLinkState(prev => ({
        ...prev,
        error: "Please enter a valid URL starting with 'https://'.",
      }));
      return;
    }
    const validationResult = validateAllowedDomainTypes(sanitizedLink);
    if (!validationResult.isValid) {
      toggleInvalidDomainModal(validationResult.errorType);
      return;
    }
    if (reviewStatus === 'Unsubmitted') {
      submitReviewRequest(e);
    } else {
      updReviewStat('Reviewed');
    }
  };

  const modalCancelButtonHandler = () => {
    toggleModal();
    setIsSubmitting(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ReviewButtonModals
        darkMode={darkMode}
        verifyModal={verifyModal}
        onToggleVerifyModal={() => setVerifyModal(prev => !prev)}
        selectedAction={selectedAction}
        onVerifyConfirm={handleVerifyConfirm}
        reviewStatus={reviewStatus}
        confirmSubmitModal={confirmSubmitModal}
        onToggleConfirmSubmitModal={() => setConfirmSubmitModal(prev => !prev)}
        link={link}
        onFinalSubmit={handleFinalSubmit}
        modal={modal}
        onToggleModal={toggleModal}
        onSubmissionModalSubmit={handleSubmissionModalSubmit}
        onModalCancel={modalCancelButtonHandler}
        onLinkChange={handleLink}
        editLinkState={editLinkState}
        onToggleEditLinkModal={toggleEditLinkModal}
        onEditLink={handleEditLink}
        onEditLinkChange={handleEditLinkChange}
        invalidDomainModal={invalidDomainModal}
        onToggleInvalidDomainModal={() => toggleInvalidDomainModal()}
      />

      <ReviewButtonDisplay
        user={user}
        task={task}
        myUserId={myUserId}
        myRole={myRole}
        canReview={canReview}
        reviewStatus={reviewStatus}
        darkMode={darkMode}
        isSubmitting={isSubmitting}
        onToggleModal={toggleModal}
        onToggleEditLinkModal={toggleEditLinkModal}
        onSelectAction={setSelectedAction}
        onToggleVerify={() => setVerifyModal(prev => !prev)}
      />
    </>
  );
}

ReviewButton.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    personId: PropTypes.string.isRequired,
  }).isRequired,
  task: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    taskName: PropTypes.string.isRequired,
    resources: PropTypes.arrayOf(
      PropTypes.shape({
        userID: PropTypes.string.isRequired,
        reviewStatus: PropTypes.string,
        completedTask: PropTypes.bool,
      }),
    ).isRequired,
    relatedWorkLinks: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  updateTask: PropTypes.func.isRequired,
};

export default ReviewButton;
