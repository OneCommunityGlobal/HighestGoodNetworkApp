import { useEffect, useState, useRef } from 'react';
import { CopyToClipboard, generateShareContent } from '../../../../utils/shareAvailabilityUtils';
import { useSelector } from 'react-redux';
import styles from './ShareAvailability.module.css';

function ShareAvailability({ activity, availability, activityId }) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const shareModalRef = useRef(null);

  const shareContent = generateShareContent(activity, availability, activityId);

  const handleShareClick = () => {
    setShowShareModal(true);
    setSelectedMethod(null);
    setShareMessage(null);
    setEmailInput('');
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = shareContent.shareUrl;
      await CopyToClipboard(shareUrl);

      setShareMessage({
        type: 'success',
        text: 'Event Link Copied to Clipboard ',
      });
      setTimeout(() => {
        setShowShareModal(false);
        setShareMessage(null);
      }, 2000);
    } catch (error) {
      setShareMessage({
        type: 'error',
        text: 'Failed to Copy Link. Please try again',
      });
    }
  };

  const handleCopyText = async () => {
    try {
      const fullText = shareContent.fullText;
      await CopyToClipboard(fullText);

      setShareMessage({
        type: 'success',
        text: 'Event Link Copied to Clipboard ',
      });
      setTimeout(() => {
        setShowShareModal(false);
        setShareMessage(null);
      }, 2000);
    } catch (error) {
      setShareMessage({
        type: 'error',
        text: 'Failed to Copy Text. Please try again',
      });
    }
  };

  const handleEmailShare = async () => {
    if (!emailInput.trim()) {
      setShareMessage({
        type: 'error',
        text: 'Please enter an email address',
      });
      return;
    }

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(emailInput)) {
        setShareMessage({
          type: 'error',
          text: 'Please enter a valid email address',
        });
        return;
      }

      const emailSubject = encodeURIComponent(shareContent.title);
      const emailBody = encodeURIComponent(shareContent.fullText);
      window.location.href = `mailto:${emailInput}?subject=${emailSubject}&body=${emailBody}`;

      setShareMessage({
        type: 'success',
        text: 'Opening email client',
      });

      setTimeout(() => {
        setShowShareModal(false);
        setShareMessage(null);
        setEmailInput('');
      }, 1500);
    } catch (error) {
      setShareMessage({
        type: 'error',
        text: 'Failed to share via email. Please try again',
      });
    }
  };

  const handleSocialShare = platform => {
    const url = encodeURIComponent(shareContent.shareUrl);
    const text = encodeURIComponent(shareContent.title);

    let socialUrl = '';

    switch (platform) {
      case 'X':
        socialUrl = `https://twitter.com/intent/tweet?${url}&text=${text}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        const whatsappText = encodeURIComponent(`${shareContent.title}\n${shareContent.shareUrl}`);
        socialUrl = `https://wa.me/?text=${whatsappText}`;
        break;
      default:
        return;
    }
    window.open(socialUrl, '_blank', 'width=600,height=400');
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (shareModalRef.current && !shareModalRef.current.contains(event.target)) {
        setShowShareModal(false);
      }
    };

    if (showShareModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
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
        <div className={`${styles.modalOverlay} ${darkMode ? styles.modalOverlayDark : ''}`}>
          <div
            className={`${styles.shareModal} ${darkMode ? styles.shareModalDark : ''}`}
            ref={shareModalRef}
          >
            <div className={`${styles.modalHeader} ${darkMode ? styles.modalHeaderDark : ''}`}>
              <h2 className={`${styles.modalTitle} ${darkMode ? styles.modalTitleDark : ''}`}>
                Share Event Availability
              </h2>
              <button
                type="button"
                className={`${styles.closeButton} ${darkMode ? styles.closeButtonDark : ''}`}
                onClick={() => setShowShareModal(false)}
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
                  <strong>🎯 Availability:</strong>{' '}
                  <span className={styles.spotsBadge}>{availability} spots left</span>
                </p>
              </div>
            </div>

            <div className={`${styles.shareContent} ${darkMode ? styles.shareContentDark : ''}`}>
              <p className={`${styles.contentLabel} ${darkMode ? styles.contentLabelDark : ''}`}>
                Share via:
              </p>

              <div className={styles.shareOptions}>
                {/* Copy Link Option */}
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

                {/* Copy Text Option */}
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

                {/* Email Option */}
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

                {/* Social Share Option */}
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

              {/* Copy Link Action */}
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

              {/* Copy Text Action */}
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

              {/* Email Action */}
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

              {/* Social Media Action */}
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
                      onClick={() => handleSocialShare('twitter')}
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

              {/* Share Message */}
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
                onClick={() => setShowShareModal(false)}
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

export default ShareAvailability;
