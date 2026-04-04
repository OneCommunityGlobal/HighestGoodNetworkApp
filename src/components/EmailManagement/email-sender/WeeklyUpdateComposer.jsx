import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import {
  FaPaperPlane,
  FaTimes,
  FaEye,
  FaExclamationTriangle,
  FaUpload,
  FaImage,
} from 'react-icons/fa';
import PropTypes from 'prop-types';

// Email template CSS - kept as string constant for inline email use
const EMAIL_TEMPLATE_STYLES = `
  body {
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.6;
    color: #333333;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
  }
  .email-wrapper {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .email-header {
    background-color: #2c5aa0;
    padding: 30px 20px;
    text-align: center;
  }
  .email-header h1 {
    color: #ffffff;
    margin: 0;
    font-size: 28px;
    font-weight: bold;
  }
  .email-header .date {
    color: #e0e7ff;
    margin: 8px 0 0 0;
    font-size: 16px;
  }
  .header-image-section {
    padding: 30px 20px;
    background-color: #f8f9fa;
  }
  .header-image {
    width: 100%;
    max-width: 560px;
    height: auto;
    display: block;
    margin: 0 auto;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .content {
    padding: 30px;
  }
  .content p {
    margin: 0 0 15px 0;
    line-height: 1.6;
  }
  .video-section {
    margin: 25px 0;
    text-align: center;
  }
  .video-title {
    font-size: 18px;
    font-weight: bold;
    color: #2c5aa0;
    margin-bottom: 15px;
  }
  .video-thumbnail {
    width: 100%;
    max-width: 560px;
    height: auto;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
  }
  .video-link {
    display: inline-block;
    margin-top: 15px;
    padding: 12px 30px;
    background-color: #2c5aa0;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
  }
  .love-section {
    margin: 30px 0;
    padding: 20px;
    background-color: #f8f9fa;
    border-left: 4px solid #2c5aa0;
  }
  .love-section p {
    margin: 0 0 10px 0;
  }
  .love-section a {
    color: #2c5aa0;
    text-decoration: none;
  }
  .social-links {
    text-align: center;
    padding: 20px;
    background-color: #f8f9fa;
    border-top: 1px solid #e0e0e0;
  }
  .social-links a {
    display: inline-block;
    margin: 0 10px;
    color: #2c5aa0;
    text-decoration: none;
  }
  .footer {
    text-align: center;
    padding: 20px;
    background-color: #2c5aa0;
    color: #ffffff;
    font-size: 12px;
  }
  .footer a {
    color: #ffffff;
    text-decoration: underline;
  }
  .footer p {
    margin: 5px 0;
  }
`;

const WeeklyUpdateComposer = ({ onClose }) => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const currentUser = useSelector(state => state.auth?.user);

  // Form state - only what changes each week
  const [headerImage, setHeaderImage] = useState('');
  const [introParagraph, setIntroParagraph] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [closingParagraph, setClosingParagraph] = useState('');

  // Distribution state
  const [emailDistribution, setEmailDistribution] = useState('broadcast'); // Default to broadcast
  const [recipients, setRecipients] = useState('');

  // UI state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [recipientList, setRecipientList] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [imageDragging, setImageDragging] = useState(false);
  const [videoDragging, setVideoDragging] = useState(false);

  // Email validation
  const validateEmail = useCallback(email => {
    return /\S+@\S+\.\S+/.test(email);
  }, []);

  // Parse recipients
  const parseRecipients = useCallback(recipientText => {
    if (!recipientText || typeof recipientText !== 'string') return [];
    return recipientText
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }, []);

  // Handle image URL change
  const handleImageUrlChange = useCallback(url => {
    setHeaderImage(url);
    setImagePreview(url);
  }, []);

  // Handle image file drop
  const handleImageDrop = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = event => {
          const base64Image = event.target.result;
          setHeaderImage(base64Image);
          setImagePreview(base64Image);
          toast.success('Image loaded successfully!');
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please drop an image file (jpg, png, gif, etc.)');
      }
    }
  }, []);

  const handleImageDragOver = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragging(true);
  }, []);

  const handleImageDragLeave = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragging(false);
  }, []);

  // Handle video file drop (for YouTube thumbnail extraction)
  const handleVideoDrop = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragging(false);

    // Check if it's a URL from clipboard
    const url = e.dataTransfer.getData('text/plain');
    if (url && url.includes('youtube.com')) {
      setYoutubeLink(url);
      toast.success('YouTube link added!');
    } else {
      toast.info('Please paste a YouTube URL instead');
    }
  }, []);

  const handleVideoDragOver = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragging(true);
  }, []);

  const handleVideoDragLeave = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragging(false);
  }, []);

  // Extract YouTube video ID
  const extractYouTubeId = useCallback(url => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    );
    return match ? match[1] : null;
  }, []);

  // Get YouTube thumbnail
  const getYouTubeThumbnail = useCallback(
    url => {
      const videoId = extractYouTubeId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    },
    [extractYouTubeId],
  );

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};

    if (!headerImage.trim()) {
      errors.headerImage = 'Header image is required';
    }

    if (!introParagraph.trim()) {
      errors.introParagraph = 'Intro paragraph is required';
    }

    if (!youtubeLink.trim()) {
      errors.youtubeLink = 'YouTube link is required';
    } else if (!extractYouTubeId(youtubeLink)) {
      errors.youtubeLink = 'Please enter a valid YouTube URL';
    }

    if (!closingParagraph.trim()) {
      errors.closingParagraph = 'Closing paragraph is required';
    }

    // Validate recipients for specific distribution
    if (emailDistribution === 'specific') {
      if (!recipients.trim()) {
        errors.recipients = 'Please enter at least one recipient';
      } else {
        const recipientEmails = parseRecipients(recipients);
        if (recipientEmails.length === 0) {
          errors.recipients = 'Please enter at least one valid email address';
        } else {
          const invalidEmails = recipientEmails.filter(email => !validateEmail(email));
          if (invalidEmails.length > 0) {
            errors.recipients = `Invalid email addresses: ${invalidEmails.join(', ')}`;
          }
          setRecipientList(recipientEmails);
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
    headerImage,
    introParagraph,
    youtubeLink,
    closingParagraph,
    emailDistribution,
    recipients,
    parseRecipients,
    validateEmail,
    extractYouTubeId,
  ]);

  // Generate HTML email content - using CSS classes
  const generateEmailHTML = useCallback(() => {
    const videoId = extractYouTubeId(youtubeLink);
    const videoThumbnail = getYouTubeThumbnail(youtubeLink);
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>One Community Weekly Progress Update - ${currentDate}</title>
  <style>
    ${EMAIL_TEMPLATE_STYLES}
  </style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header with Title -->
    <div class="email-header">
      <h1>This Week's Update</h1>
      <p class="date">${currentDate}</p>
    </div>
    
    <!-- Header Image -->
    <div class="header-image-section">
      <img src="${headerImage}" alt="One Community Header" class="header-image" />
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <!-- Intro Paragraph -->
      <p>${introParagraph.replace(/\n/g, '<br>')}</p>
      
    <!-- Video Section -->
    <div class="video-section">
      <div class="video-title">This Week's Video Topic:</div>
      <a href="${youtubeLink}" target="_blank" style="position: relative; display: inline-block; text-decoration: none;">
        <img src="${videoThumbnail}" alt="Video Thumbnail" class="video-thumbnail" />
        <!-- Play Button Overlay -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background-color: rgba(255, 0, 0, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <div style="width: 0; height: 0; border-left: 25px solid #ffffff; border-top: 15px solid transparent; border-bottom: 15px solid transparent; margin-left: 8px;"></div>
        </div>
      </a>
      <br>
      <a href="${youtubeLink}" class="video-link" target="_blank">
        ▶️ Click Here for the Video on This Topic
      </a>
    </div>
      
      <!-- Closing Paragraph -->
      <p>${closingParagraph.replace(/\n/g, '<br>')}</p>
      
      <!-- Love What We're Doing Section -->
      <div class="love-section">
        <p><strong>Love what we're doing?</strong></p>
        <p><a href="https://www.onecommunityglobal.org/donate" target="_blank">Click here to support us</a></p>
        <p><a href="https://www.onecommunityglobal.org/open-source-project-hub" target="_blank">Click here to see open source resources</a></p>
        <p><a href="https://www.onecommunityglobal.org/volunteer" target="_blank">Click here to join the team</a></p>
      </div>
    </div>
    
    <!-- Social Media Links -->
    <div class="social-links">
      <a href="https://www.facebook.com/OneCommunityCommunity" target="_blank">Facebook</a> | 
      <a href="https://twitter.com/1CommunityGlobal" target="_blank">Twitter</a> | 
      <a href="https://www.instagram.com/onecommunityglobal/" target="_blank">Instagram</a> | 
      <a href="https://www.linkedin.com/company/one-community-global" target="_blank">LinkedIn</a> | 
      <a href="https://www.youtube.com/onecommunityorg" target="_blank">YouTube</a>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>One Community Global | Creating a New Perspective for Humanity</p>
      <p><a href="{{unsubscribeLink}}">Unsubscribe from these emails</a></p>
      <p>© ${new Date().getFullYear()} One Community. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }, [
    headerImage,
    introParagraph,
    youtubeLink,
    closingParagraph,
    extractYouTubeId,
    getYouTubeThumbnail,
  ]);

  // Handle preview
  const handlePreview = useCallback(() => {
    if (!validateForm()) {
      toast.warning('Please fill in all required fields', { autoClose: 3000 });
      return;
    }
    setShowPreviewModal(true);
  }, [validateForm]);

  // Handle send
  const handleSend = useCallback(async () => {
    setIsSending(true);

    try {
      const htmlContent = generateEmailHTML();
      const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const subject = `One Community Weekly Progress Update - ${currentDate}`;

      // Get current user for requestor
      if (!currentUser || !currentUser.userid) {
        throw new Error('User authentication required');
      }

      const requestor = {
        requestorId: currentUser.userid,
        email: currentUser.email,
        role: currentUser.role,
      };

      // Send email
      const payload =
        emailDistribution === 'broadcast'
          ? {
              subject: subject,
              html: htmlContent,
              requestor,
            }
          : {
              to: recipientList,
              subject: subject,
              html: htmlContent,
              requestor,
            };

      const endpoint =
        emailDistribution === 'broadcast' ? ENDPOINTS.BROADCAST_EMAILS : ENDPOINTS.POST_EMAILS;

      await axios.post(endpoint, payload);

      const recipientCount =
        emailDistribution === 'broadcast'
          ? 'all subscribers'
          : `${recipientList.length} recipient(s)`;

      toast.success(`Weekly update sent successfully to ${recipientCount}!`);

      // Reset form
      setShowPreviewModal(false);
      setHeaderImage('');
      setImagePreview('');
      setIntroParagraph('');
      setYoutubeLink('');
      setClosingParagraph('');
      setRecipients('');
      setRecipientList([]);
      setValidationErrors({});
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Failed to send: ${errorMessage}`);
      setValidationErrors({ general: errorMessage });
    } finally {
      setIsSending(false);
    }
  }, [emailDistribution, recipientList, generateEmailHTML, currentUser]);

  return (
    <div className={`weekly-update-composer ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="page-title-container mb-3">
        <h2 className="page-title">📰 Weekly Progress Update</h2>
        <p className="text-muted">Fill in the 4 fields below - everything else is automatic!</p>
      </div>

      {/* General Error */}
      {validationErrors.general && (
        <Alert color="danger" className="mb-3">
          <FaExclamationTriangle className="me-2" />
          {validationErrors.general}
        </Alert>
      )}

      <Form>
        {/* 1. Header Image */}
        <FormGroup>
          <Label>1. Header Image *</Label>

          {/* Drag & Drop Zone */}
          <div
            onDrop={handleImageDrop}
            onDragOver={handleImageDragOver}
            onDragLeave={handleImageDragLeave}
            style={{
              border: imageDragging ? '3px dashed #3b82f6' : '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: imageDragging ? '#eff6ff' : '#f9fafb',
              transition: 'all 0.2s ease',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >
            <FaUpload size={32} color={imageDragging ? '#3b82f6' : '#9ca3af'} />
            <p style={{ margin: '10px 0', color: imageDragging ? '#3b82f6' : '#6b7280' }}>
              {imageDragging ? 'Drop image here!' : 'Drag & drop an image here'}
            </p>
            <small style={{ color: '#9ca3af' }}>or paste URL below</small>
          </div>

          <Input
            type="url"
            value={headerImage}
            onChange={e => handleImageUrlChange(e.target.value)}
            invalid={!!validationErrors.headerImage}
            placeholder="Or paste image URL here (e.g., https://example.com/image.jpg)"
          />
          {validationErrors.headerImage && (
            <div className="invalid-feedback d-block">{validationErrors.headerImage}</div>
          )}
          <small className="text-muted d-block mt-1">
            <FaImage className="me-1" />
            Supports: Drag & drop image files, or paste image URLs
          </small>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-3">
              <Label>Preview:</Label>
              <img
                src={imagePreview}
                alt="Header preview"
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                }}
                onError={() => {
                  toast.error('Invalid image URL');
                  setImagePreview('');
                }}
              />
            </div>
          )}
        </FormGroup>

        {/* 2. Intro Paragraph */}
        <FormGroup>
          <Label>2. Opening Paragraph *</Label>
          <Input
            type="textarea"
            rows={4}
            value={introParagraph}
            onChange={e => setIntroParagraph(e.target.value)}
            invalid={!!validationErrors.introParagraph}
            placeholder="Enter the opening paragraph here..."
          />
          {validationErrors.introParagraph && (
            <div className="invalid-feedback d-block">{validationErrors.introParagraph}</div>
          )}
        </FormGroup>

        {/* 3. YouTube Link */}
        <FormGroup>
          <Label>3. YouTube Video Link *</Label>

          {/* Drag & Drop Zone for YouTube */}
          <div
            onDrop={handleVideoDrop}
            onDragOver={handleVideoDragOver}
            onDragLeave={handleVideoDragLeave}
            style={{
              border: videoDragging ? '3px dashed #ef4444' : '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: videoDragging ? '#fef2f2' : '#f9fafb',
              transition: 'all 0.2s ease',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >
            <FaImage size={32} color={videoDragging ? '#ef4444' : '#9ca3af'} />
            <p style={{ margin: '10px 0', color: videoDragging ? '#ef4444' : '#6b7280' }}>
              {videoDragging ? 'Drop YouTube link here!' : 'Drag & drop YouTube link here'}
            </p>
            <small style={{ color: '#9ca3af' }}>or paste URL below</small>
          </div>

          <Input
            type="url"
            value={youtubeLink}
            onChange={e => setYoutubeLink(e.target.value)}
            invalid={!!validationErrors.youtubeLink}
            placeholder="Or paste YouTube URL: https://youtube.com/watch?v=..."
          />
          {validationErrors.youtubeLink && (
            <div className="invalid-feedback d-block">{validationErrors.youtubeLink}</div>
          )}
          {youtubeLink && extractYouTubeId(youtubeLink) && (
            <small className="text-success d-block mt-1">✓ Valid YouTube link detected</small>
          )}

          {/* YouTube Thumbnail Preview */}
          {youtubeLink && extractYouTubeId(youtubeLink) && (
            <div className="mt-3">
              <Label>Video Thumbnail Preview:</Label>
              <img
                src={getYouTubeThumbnail(youtubeLink)}
                alt="Video thumbnail"
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  height: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                }}
              />
            </div>
          )}
        </FormGroup>

        {/* 4. Closing Paragraph */}
        <FormGroup>
          <Label>4. Closing Paragraph *</Label>
          <Input
            type="textarea"
            rows={4}
            value={closingParagraph}
            onChange={e => setClosingParagraph(e.target.value)}
            invalid={!!validationErrors.closingParagraph}
            placeholder="Enter the closing paragraph here..."
          />
          {validationErrors.closingParagraph && (
            <div className="invalid-feedback d-block">{validationErrors.closingParagraph}</div>
          )}
        </FormGroup>

        {/* Email Distribution */}
        <FormGroup className="mt-4">
          <Label className="form-label">Send To: *</Label>
          <div className="distribution-options">
            <label
              className={`distribution-option ${
                emailDistribution === 'broadcast' ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name="emailDistribution"
                value="broadcast"
                checked={emailDistribution === 'broadcast'}
                onChange={() => {
                  setEmailDistribution('broadcast');
                  setValidationErrors(prev => ({ ...prev, recipients: null }));
                  setRecipientList([]);
                }}
              />
              <span className="option-icon mx-2">🚀</span>
              All Subscribers (Recommended)
            </label>
            <label
              className={`distribution-option ${
                emailDistribution === 'specific' ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name="emailDistribution"
                value="specific"
                checked={emailDistribution === 'specific'}
                onChange={() => setEmailDistribution('specific')}
              />
              <span className="option-icon mx-2">✏️</span>
              Specific Recipients (for testing)
            </label>
          </div>

          {/* Recipients field for specific distribution */}
          {emailDistribution === 'specific' && (
            <FormGroup className="mt-3">
              <Label>Test Recipients</Label>
              <Input
                type="textarea"
                rows={3}
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                invalid={!!validationErrors.recipients}
                placeholder="Enter test email addresses separated by commas"
              />
              {validationErrors.recipients && (
                <div className="invalid-feedback d-block">{validationErrors.recipients}</div>
              )}
            </FormGroup>
          )}
        </FormGroup>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-4">
          <Button color="primary" onClick={handlePreview} size="lg">
            <FaEye className="me-2" />
            Preview & Send
          </Button>
          {onClose && (
            <Button color="secondary" onClick={onClose}>
              <FaTimes className="me-2" />
              Cancel
            </Button>
          )}
        </div>
      </Form>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        toggle={() => !isSending && setShowPreviewModal(false)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => !isSending && setShowPreviewModal(false)}>
          Preview Weekly Progress Update
        </ModalHeader>
        <ModalBody>
          <Alert color="info" className="mb-3">
            <strong>Sending to:</strong>{' '}
            {emailDistribution === 'broadcast'
              ? 'All subscribers on your email list'
              : `${recipientList.length} test recipient(s)`}
          </Alert>

          <div
            className="mt-2 border rounded"
            style={{
              maxHeight: '500px',
              overflow: 'auto',
              backgroundColor: '#f4f4f4',
              padding: '10px',
            }}
            dangerouslySetInnerHTML={{ __html: generateEmailHTML() }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowPreviewModal(false)} disabled={isSending}>
            Back to Edit
          </Button>
          <Button color="primary" onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <FaPaperPlane className="me-2" />
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane className="me-2" />
                Send Email
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

WeeklyUpdateComposer.propTypes = {
  onClose: PropTypes.func,
};

export default WeeklyUpdateComposer;
