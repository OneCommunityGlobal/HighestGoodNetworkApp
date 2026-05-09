import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { CopyToClipboard, generateShareContent } from '../../../../utils/shareAvailabilityUtils';

import styles from './ShareAvailability.module.css';

const isValidEmail = email => {
  const input = document.createElement('input');
  input.type = 'email';
  input.value = email;

  return input.checkValidity();
};

const buildSocialShareUrl = (platform, shareContent) => {
  const url = encodeURIComponent(shareContent.shareUrl);

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;

    case 'x':
      return `https://x.com/intent/tweet?url=${url}&text=${encodeURIComponent(shareContent.title)}`;

    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${encodeURIComponent(
        shareContent.fullText,
      )}`;

    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(
        `${shareContent.title}\n${shareContent.shareUrl}`,
      )}`;

    default:
      return '';
  }
};

const getErrorMessage = action => {
  const messages = {
    copyLink: 'Failed to copy link. Please try again.',
    copyText: 'Failed to copy text. Please try again.',
    email: 'Failed to share via email. Please try again.',
    social: 'Sharing failed. Try again.',
  };

  return messages[action];
};

function ShareAvailability({ activity, availability, activityId }) {
  const darkMode = useSelector(state => state.theme?.darkMode);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [emailInput, setEmailInput] = useState('');

  const shareModalRef = useRef(null);

  const shareContent = generateShareContent(activity, availability, activityId);

  const resetModalState = () => {
    setSelectedMethod(null);
    setShareMessage(null);
    setEmailInput('');
  };

  const closeModal = () => {
    setShowShareModal(false);
    resetModalState();
  };

  const showSuccessMessage = text => {
    setShareMessage({
      type: 'success',
      text,
    });
  };

  const showErrorMessage = text => {
    setShareMessage({
      type: 'error',
      text,
    });
  };

  const handleShareClick = () => {
    setShowShareModal(true);
    resetModalState();
  };

  const handleCopyLink = async () => {
    try {
      await CopyToClipboard(shareContent.shareUrl);

      showSuccessMessage('Event link copied to clipboard.');

      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error) {
      console.error('Copy link failed:', error);

      showErrorMessage(getErrorMessage('copyLink'));
    }
  };

  const handleCopyText = async () => {
    try {
      await CopyToClipboard(shareContent.fullText);

      showSuccessMessage('Event details copied to clipboard.');

      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error) {
      console.error('Copy text failed:', error);

      showErrorMessage(getErrorMessage('copyText'));
    }
  };

  const handleEmailShare = () => {
    if (!emailInput.trim()) {
      showErrorMessage('Please enter an email address');
      return;
    }

    if (!isValidEmail(emailInput)) {
      showErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      const emailSubject = encodeURIComponent(shareContent.title);
      const emailBody = encodeURIComponent(shareContent.fullText);

      globalThis.location.href = `mailto:${emailInput}?subject=${emailSubject}&body=${emailBody}`;

      showSuccessMessage('Opening email client.');

      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      console.error('Email share failed:', error);

      showErrorMessage(getErrorMessage('email'));
    }
  };

  const handleSocialShare = async platform => {
    try {
      if (platform === 'facebook') {
        await CopyToClipboard(shareContent.fullText);

        showSuccessMessage('Copied! Paste it into Facebook.');
      }

      const socialUrl = buildSocialShareUrl(platform, shareContent);

      if (!socialUrl) {
        return;
      }

      globalThis.open(socialUrl, '_blank', 'width=600,height=400');
    } catch (error) {
      console.error('Social share failed:', error);

      showErrorMessage(getErrorMessage('social'));
    }
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (shareModalRef.current && !shareModalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (showShareModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareModal]);

  return (
    <>
      <button
        type="button"
        className={`${styles.shareButton} ${darkMode ? styles.shareButtonDark : ''}`}
        onClick={handleShareClick}
        title="Share event availability with others"
      >
        <span className={styles.shareIcon}>📤</span>
        Share Availability
      </button>

      {showShareModal && (
        <div className={`${styles.overlay} ${darkMode ? styles.darkMode : ''}`}>
          <div className={`${styles.modal} ${darkMode ? styles.darkMode : ''}`} ref={shareModalRef}>
            <div className={`${styles.modalHeader} ${darkMode ? styles.modalHeaderDark : ''}`}>
              <h2 className={`${styles.modalTitle} ${darkMode ? styles.modalTitleDark : ''}`}>
                Share Event Availability
              </h2>

              <button
                type="button"
                className={`${styles.closeButton} ${darkMode ? styles.closeButtonDark : ''}`}
                onClick={closeModal}
                aria-label="Close share modal"
              >
                ✕
              </button>
            </div>

            <div className={`${styles.eventPreview} ${darkMode ? styles.eventPreviewDark : ''}`}>
              <h3 className={`${styles.previewTitle} ${darkMode ? styles.previewTitleDark : ''}`}>
                {activity.name}
              </h3>

              <div className={styles.previewDetails}>
                <p>
                  <strong>📅 Date:</strong> {activity.date}
                </p>

                <p>
                  <strong>⏰ Time:</strong> {activity.time}
                </p>

                <p>
                  <strong>📍 Location:</strong> {activity.location || 'Not specified'}
                </p>

                <p>
                  <strong>🎯 Availability:</strong>&nbsp;
                  <span className={styles.spotsBadge}>{availability} spots left</span>
                </p>
              </div>
            </div>

            <div className={`${styles.shareContent} ${darkMode ? styles.shareContentDark : ''}`}>
              <p className={`${styles.contentLabel} ${darkMode ? styles.contentLabelDark : ''}`}>
                Share via:
              </p>

              <div className={styles.shareOptions}>
                <button
                  type="button"
                  className={`${styles.shareOption} ${
                    selectedMethod === 'link' ? styles.shareOptionActive : ''
                  } ${darkMode ? styles.shareOptionDark : ''}`}
                  onClick={() => setSelectedMethod('link')}
                >
                  <span className={styles.optionIcon}>🔗</span>

                  <span className={styles.optionText}>Copy Link</span>
                </button>

                <button
                  type="button"
                  className={`${styles.shareOption} ${
                    selectedMethod === 'text' ? styles.shareOptionActive : ''
                  } ${darkMode ? styles.shareOptionDark : ''}`}
                  onClick={() => setSelectedMethod('text')}
                >
                  <span className={styles.optionIcon}>📋</span>

                  <span className={styles.optionText}>Copy Details</span>
                </button>

                <button
                  type="button"
                  className={`${styles.shareOption} ${
                    selectedMethod === 'email' ? styles.shareOptionActive : ''
                  } ${darkMode ? styles.shareOptionDark : ''}`}
                  onClick={() => setSelectedMethod('email')}
                >
                  <span className={styles.optionIcon}>✉️</span>

                  <span className={styles.optionText}>Email</span>
                </button>

                <button
                  type="button"
                  className={`${styles.shareOption} ${
                    selectedMethod === 'social' ? styles.shareOptionActive : ''
                  } ${darkMode ? styles.shareOptionDark : ''}`}
                  onClick={() => setSelectedMethod('social')}
                >
                  <span className={styles.optionIcon}>🌐</span>

                  <span className={styles.optionText}>Social Media</span>
                </button>
              </div>

              {selectedMethod === 'link' && (
                <div className={`${styles.actionPanel} ${darkMode ? styles.actionPanelDark : ''}`}>
                  <p
                    className={`${styles.actionDescription} ${
                      darkMode ? styles.actionDescriptionDark : ''
                    }`}
                  >
                    Share a direct link to this event:
                  </p>

                  <div className={styles.urlContainer}>
                    <input
                      type="text"
                      value={shareContent.shareUrl}
                      readOnly
                      className={`${styles.urlInput} ${darkMode ? styles.urlInputDark : ''}`}
                    />

                    <button
                      type="button"
                      className={`${styles.copyButton} ${darkMode ? styles.copyButtonDark : ''}`}
                      onClick={handleCopyLink}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'text' && (
                <div className={`${styles.actionPanel} ${darkMode ? styles.actionPanelDark : ''}`}>
                  <p
                    className={`${styles.actionDescription} ${
                      darkMode ? styles.actionDescriptionDark : ''
                    }`}
                  >
                    Copy event details to share via messaging or email:
                  </p>

                  <textarea
                    value={shareContent.fullText}
                    readOnly
                    className={`${styles.textArea} ${darkMode ? styles.textAreaDark : ''}`}
                  />

                  <button
                    type="button"
                    className={`${styles.copyButton} ${darkMode ? styles.copyButtonDark : ''}`}
                    onClick={handleCopyText}
                  >
                    Copy to Clipboard
                  </button>
                </div>
              )}

              {selectedMethod === 'email' && (
                <div className={`${styles.actionPanel} ${darkMode ? styles.actionPanelDark : ''}`}>
                  <p
                    className={`${styles.actionDescription} ${
                      darkMode ? styles.actionDescriptionDark : ''
                    }`}
                  >
                    Enter email address to send event details:
                  </p>

                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    className={`${styles.emailInput} ${darkMode ? styles.emailInputDark : ''}`}
                  />

                  <button
                    type="button"
                    className={`${styles.copyButton} ${darkMode ? styles.copyButtonDark : ''}`}
                    onClick={handleEmailShare}
                  >
                    Send Email
                  </button>
                </div>
              )}

              {selectedMethod === 'social' && (
                <div className={`${styles.actionPanel} ${darkMode ? styles.actionPanelDark : ''}`}>
                  <p
                    className={`${styles.actionDescription} ${
                      darkMode ? styles.actionDescriptionDark : ''
                    }`}
                  >
                    Share on social media:
                  </p>

                  <div className={styles.socialButtons}>
                    <button
                      type="button"
                      className={`${styles.socialButton} ${styles.twitter} ${
                        darkMode ? styles.socialButtonDark : ''
                      }`}
                      onClick={() => handleSocialShare('x')}
                      title="Share on Twitter"
                    >
                      𝕏 Twitter
                    </button>

                    <button
                      type="button"
                      className={`${styles.socialButton} ${styles.facebook} ${
                        darkMode ? styles.socialButtonDark : ''
                      }`}
                      onClick={() => handleSocialShare('facebook')}
                      title="Share on Facebook"
                    >
                      f Facebook
                    </button>

                    <button
                      type="button"
                      className={`${styles.socialButton} ${styles.linkedin} ${
                        darkMode ? styles.socialButtonDark : ''
                      }`}
                      onClick={() => handleSocialShare('linkedin')}
                      title="Share on LinkedIn"
                    >
                      in LinkedIn
                    </button>

                    <button
                      type="button"
                      className={`${styles.socialButton} ${styles.whatsapp} ${
                        darkMode ? styles.socialButtonDark : ''
                      }`}
                      onClick={() => handleSocialShare('whatsapp')}
                      title="Share on WhatsApp"
                    >
                      💬 WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {shareMessage && (
                <div
                  className={`${styles.shareMessage} ${
                    shareMessage.type === 'success'
                      ? styles.shareMessageSuccess
                      : styles.shareMessageError
                  } ${
                    darkMode && shareMessage.type === 'success'
                      ? styles.shareMessageSuccessDark
                      : ''
                  } ${
                    darkMode && shareMessage.type === 'error' ? styles.shareMessageErrorDark : ''
                  }`}
                >
                  {shareMessage.text}
                </div>
              )}
            </div>

            <div className={`${styles.modalFooter} ${darkMode ? styles.modalFooterDark : ''}`}>
              <p className={`${styles.disclaimer} ${darkMode ? styles.disclaimerDark : ''}`}>
                Event information updates in real-time. Recipients will see current availability
                when they visit.
              </p>

              <button
                type="button"
                className={`${styles.closeModalButton} ${
                  darkMode ? styles.closeModalButtonDark : ''
                }`}
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

ShareAvailability.propTypes = {
  activity: PropTypes.shape({
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    location: PropTypes.string,
  }).isRequired,
  availability: PropTypes.number.isRequired,
  activityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ShareAvailability;
