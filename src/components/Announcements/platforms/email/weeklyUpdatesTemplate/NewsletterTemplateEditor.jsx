import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ReactDOMServer from 'react-dom/server';
import { Editor } from '@tinymce/tinymce-react';
import { IntegratedEmailSender } from '../../../../EmailTemplateManagement';
import {
  Button,
  Input,
  Label,
  Row,
  Col,
  Spinner,
  Card,
  CardBody,
  FormGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import OneCommunityNewsletterTemplate from './OneCommunityNewsletterTemplate';
import {
  defaultTemplateData,
  defaultResetValues,
  getTemplateDataWithDefaults,
} from './templateData';
import './NewsletterTemplateEditor.css';

function NewsletterTemplateEditor({ onContentChange, onSendEmails, onBroadcastEmails }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const editorRef = useRef(null);

  // Template data with defaults from separated data file
  const [templateData, setTemplateData] = useState(defaultTemplateData);

  // Email recipients
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailValidationErrors, setEmailValidationErrors] = useState([]);

  // UI states
  const [previewHtml, setPreviewHtml] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIntegratedSender, setShowIntegratedSender] = useState(false);

  // Form validation
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Header image upload
  const [headerImageFile, setHeaderImageFile] = useState(null);

  // Edit states
  const [isThankYouEditable, setIsThankYouEditable] = useState(false);
  const [isDonationEditable, setIsDonationEditable] = useState(false);
  const [videoThumbnailFile, setVideoThumbnailFile] = useState(null);
  const [isFooterContentEditable, setIsFooterContentEditable] = useState(false);
  const [isSocialLinksEditable, setIsSocialLinksEditable] = useState(false);

  // Extract YouTube video ID and generate thumbnail
  const extractYouTubeVideoId = url => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleVideoUrlChange = url => {
    const videoId = extractYouTubeVideoId(url);
    setTemplateData(prev => ({
      ...prev,
      videoUrl: url,
      videoThumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
      videoLinkText: url
        ? `<p style="font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; margin: 0 0 16px 0; color: #333333;">Click here for the video on this topic: <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${url}</a></p>`
        : '',
    }));
  };

  const handleResetHeaderImage = () => {
    setHeaderImageFile(null);
    setTemplateData(prev => ({
      ...prev,
      headerImageUrl: defaultTemplateData.headerImageUrl,
    }));
  };

  const handleVideoThumbnailUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoThumbnailFile(file);
    convertImageToBase64(file, base64 => {
      setTemplateData(prev => ({ ...prev, videoThumbnailUrl: base64 }));
    });
    e.target.value = '';
  };

  const handleResetThankYouMessage = () => {
    setTemplateData(prev => ({
      ...prev,
      thankYouMessage: defaultResetValues.thankYouMessage,
    }));
  };

  const handleResetDonationMessage = () => {
    setTemplateData(prev => ({
      ...prev,
      donationMessage: defaultResetValues.donationMessage,
    }));
  };

  const handleResetFooterContent = () => {
    setTemplateData(prev => ({
      ...prev,
      footerContent: defaultResetValues.footerContent,
    }));
  };

  const handleSocialLinkChange = (index, field, value) => {
    setTemplateData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link,
      ),
    }));
  };

  const handleAddSocialLink = () => {
    setTemplateData(prev => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        {
          name: '',
          url: '',
          icon: '',
        },
      ],
    }));
  };

  const handleRemoveSocialLink = index => {
    setTemplateData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const handleResetSocialLinks = () => {
    setTemplateData(prev => ({
      ...prev,
      socialLinks: defaultResetValues.socialLinks,
    }));
  };

  const handleResetVideoThumbnail = () => {
    setVideoThumbnailFile(null);
    if (templateData.videoUrl) {
      const videoId = extractYouTubeVideoId(templateData.videoUrl);
      setTemplateData(prev => ({
        ...prev,
        videoThumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
      }));
    } else {
      setTemplateData(prev => ({ ...prev, videoThumbnailUrl: '' }));
    }
  };

  const handleFieldChange = (field, value) => {
    setTemplateData(prev => ({ ...prev, [field]: value }));
  };

  const convertImageToBase64 = (file, cb) => {
    const reader = new FileReader();
    reader.onloadend = () => cb(reader.result);
    reader.readAsDataURL(file);
  };

  const handleHeaderImageUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeaderImageFile(file);
    convertImageToBase64(file, base64 => {
      setTemplateData(prev => ({ ...prev, headerImageUrl: base64 }));
    });
    e.target.value = '';
  };

  const handleHeaderImageUrlChange = e => {
    const value = e.target.value;
    // Always clear file selection when URL is changed manually
    setHeaderImageFile(null);
    handleFieldChange('headerImageUrl', value);
  };

  const handleEmailListChange = e => {
    const { value } = e.target;
    setEmailTo(value);

    if (value.trim() === '') {
      setEmailList([]);
      setEmailValidationErrors([]);
      return;
    }

    const emails = value
      .split(',')
      .map(email => email.trim())
      .filter(email => email);
    setEmailList(emails);

    const invalidEmails = emails.filter(email => !isValidEmail(email));
    setEmailValidationErrors(invalidEmails);
  };

  const isValidEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validateForm = () => {
    const errors = {};

    if (!templateData.updateNumber || templateData.updateNumber.trim() === '') {
      errors.updateNumber = 'Update number is required';
    }

    if (!templateData.videoUrl.trim() || !isValidUrl(templateData.videoUrl)) {
      errors.videoUrl = 'Valid video URL is required';
    }

    setValidationErrors(errors);
    const valid = Object.keys(errors).length === 0;
    setIsFormValid(valid);
    return valid;
  };

  const isValidUrl = url => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Generate preview HTML whenever template data changes
  const generatePreviewHtml = () => {
    const templateDataWithDefaults = getTemplateDataWithDefaults(templateData);

    const view = ReactDOMServer.renderToStaticMarkup(
      <OneCommunityNewsletterTemplate templateData={templateDataWithDefaults} darkMode={false} />,
    );
    return view;
  };

  // Update preview whenever template data changes
  useEffect(() => {
    const html = generatePreviewHtml();
    setPreviewHtml(html);
    onContentChange(html);
    validateForm();
  }, [templateData, darkMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendToSpecific = async () => {
    if (!isFormValid) {
      toast.error('Please fix all form errors before sending');
      return;
    }

    if (emailValidationErrors.length > 0 || emailList.length === 0) {
      toast.error('Please provide valid email addresses');
      return;
    }

    setIsSending(true);
    try {
      const htmlContent = generatePreviewHtml();
      await onSendEmails(emailList, {
        subject: templateData.subject,
        htmlContent: htmlContent,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!isFormValid) {
      toast.error('Please fix all form errors before broadcasting');
      return;
    }

    setIsBroadcasting(true);
    try {
      const htmlContent = generatePreviewHtml();
      await onBroadcastEmails({
        subject: templateData.subject,
        htmlContent: htmlContent,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error broadcasting emails:', error);
      toast.error('Failed to broadcast emails. Please try again.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Fullscreen toggle function
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // TinyMCE configuration - Enhanced version from time log popup
  const TINY_MCE_INIT_OPTIONS = {
    license_key: 'gpl',
    height: 200,
    menubar: false,
    placeholder: 'Enter your content here...',
    plugins: 'lists link autoresize fontsize lineheight',
    toolbar:
      'bold italic underline | fontsize lineheight | alignleft aligncenter alignright | bullist numlist | link',
    branding: false,
    content_style: `body, p, div, span, * { 
      cursor: text !important; 
      color: ${darkMode ? '#ffffff' : '#000000'} !important; 
      background-color: ${darkMode ? '#2d2d2d' : '#ffffff'} !important;
      font-family: Arial, Helvetica, sans-serif; 
      font-size: 12pt; 
      line-height: 1.5; 
    }`,
    // Set default font size
    font_size: '12pt',
    // Setup function to ensure default font size
    setup: function(editor) {
      editor.on('init', function() {
        // Set default styles but allow user to override them
        editor.getBody().style.fontFamily = 'Arial, Helvetica, sans-serif';
        editor.getBody().style.color = darkMode ? '#ffffff' : '#000000';
        editor.getBody().style.backgroundColor = darkMode ? '#2d2d2d' : '#ffffff';
        // Don't force font size - let users change it via toolbar
        if (!editor.getBody().style.fontSize) {
          editor.getBody().style.fontSize = '12pt';
        }
      });
    },
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
    block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3',
    fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt',
    lineheight_formats: '1 1.2 1.4 1.6 1.8 2',
  };

  return (
    <div
      className={`email-composer ${darkMode ? 'dark-mode' : ''} ${
        isFullscreen ? 'fullscreen' : ''
      }`}
    >
      {/* Top Action Bar */}
      <div className="composer-toolbar">
        <div className="toolbar-left">
          <h1 className="composer-title">Broadcast Weekly Updates</h1>
          <div className="status-indicators">
            {isFormValid ? (
              <span className="status-badge success">✅ Ready to Send</span>
            ) : (
              <span className="status-badge warning">⚠️ Complete Required Fields</span>
            )}
          </div>
        </div>
        <div className="toolbar-right">
          <Button color="secondary" size="md" onClick={toggleFullscreen} className="fullscreen-btn">
            {isFullscreen ? '⤓ Exit Fullscreen' : '⤢ Fullscreen'}
          </Button>
          <Button
            color="info"
            size="md"
            onClick={() => setShowIntegratedSender(true)}
            className="template-sender-btn me-2"
          >
            📧 Send with Templates
          </Button>
          <Button
            color="primary"
            size="md"
            onClick={() => {
              if (isFullscreen) {
                setIsFullscreen(false);
              }
              setIsEmailModalOpen(true);
            }}
            disabled={!isFormValid}
            className="email-settings-btn"
          >
            📧 Email Settings & Send
          </Button>
        </div>
      </div>

      {/* Email Settings Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        toggle={() => {
          setIsEmailModalOpen(false);
          if (isFullscreen) {
            setIsFullscreen(false);
          }
        }}
        size="lg"
        className={`email-send-modal ${darkMode ? 'dark-mode' : ''}`}
      >
        <ModalHeader
          toggle={() => {
            setIsEmailModalOpen(false);
            if (isFullscreen) {
              setIsFullscreen(false);
            }
          }}
          className="email-modal-header"
        >
          📧 Email Settings & Send
        </ModalHeader>
        <ModalBody className="email-modal-body">
          <div className="email-modal-content">
            <div className="test-recipients-section">
              <Label className="control-label">Send to Specific People (Optional)</Label>
              <Input
                type="textarea"
                value={emailTo}
                onChange={handleEmailListChange}
                placeholder="Enter email addresses (one per line or comma-separated)"
                className="test-email-input"
                rows={3}
              />

              {/* Simple Status Display */}
              {emailList.length > 0 && (
                <div className="email-status">
                  {emailValidationErrors.length === 0 ? (
                    <div className="status-valid">
                      <span className="status-icon">✅</span>
                      <span className="status-text">
                        Ready to send to {emailList.length} recipient
                        {emailList.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="status-invalid">
                      <span className="status-icon">❌</span>
                      <span className="status-text">
                        {emailValidationErrors.length} invalid email
                        {emailValidationErrors.length !== 1 ? 's' : ''} found
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="email-modal-footer">
          <div className="modal-actions">
            {emailList.length > 0 && emailValidationErrors.length === 0 && (
              <Button
                color="primary"
                size="md"
                onClick={async () => {
                  await handleSendToSpecific();
                  setIsEmailModalOpen(false);
                }}
                disabled={isSending || !isFormValid}
                className="test-send-btn"
              >
                {isSending ? <Spinner size="sm" className="me-2" /> : null}
                Send to Specific ({emailList.length})
              </Button>
            )}
            <Button
              color="success"
              size="md"
              onClick={async () => {
                await handleBroadcast();
                setIsEmailModalOpen(false);
              }}
              disabled={isBroadcasting || !isFormValid}
              className="broadcast-btn"
            >
              {isBroadcasting ? <Spinner size="sm" className="me-2" /> : null}
              Send to All Subscribers
            </Button>
            <Button
              color="secondary"
              onClick={() => {
                setIsEmailModalOpen(false);
                if (isFullscreen) {
                  setIsFullscreen(false);
                }
              }}
            >
              Cancel
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Error Display */}
      {emailValidationErrors.length > 0 && (
        <div className="error-bar">Invalid emails: {emailValidationErrors.join(', ')}</div>
      )}

      {/* Main Content Area */}
      <div className="composer-content">
        {/* Left Panel - Editor */}
        <div className="editor-panel">
          <div className="editor-body">
            <div className="fields-section">
              {/* Header Section */}
              <div className="section-header">
                <h3>Header</h3>
              </div>
              <FormGroup>
                <div className="field-header">
                  <Label>Image URL or Upload</Label>
                  <div className="field-actions">
                    <Button
                      color="info"
                      size="sm"
                      // eslint-disable-next-line testing-library/no-node-access
                      onClick={() => document.getElementById('header-image-upload').click()}
                      className="edit-toggle-button"
                    >
                      Upload Image
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={handleResetHeaderImage}
                      className="reset-button"
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>
                <Input
                  type="url"
                  value={templateData.headerImageUrl}
                  onChange={handleHeaderImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderImageUpload}
                  className="file-input"
                  id="header-image-upload"
                  style={{ display: 'none' }}
                />
                {headerImageFile && (
                  <div className="file-selected-message">
                    ✓ Image uploaded: {headerImageFile.name}
                  </div>
                )}
              </FormGroup>

              {/* Title Section */}
              <div className="section-header">
                <h3>Title</h3>
              </div>
              <FormGroup>
                <Label>Weekly Update Number *</Label>
                <Input
                  type="number"
                  value={templateData.updateNumber}
                  onChange={e => handleFieldChange('updateNumber', e.target.value)}
                  placeholder="Enter update number (e.g., 651)"
                  className={`update-number-input ${
                    validationErrors.updateNumber ? 'is-invalid' : ''
                  }`}
                />
              </FormGroup>

              <FormGroup>
                <Label>Email Subject *</Label>
                <Input
                  type="text"
                  value={templateData.subject}
                  onChange={e => handleFieldChange('subject', e.target.value)}
                  placeholder="Enter email subject"
                />
              </FormGroup>

              <FormGroup>
                <Label>Generated Title</Label>
                <div>
                  One Community Weekly Progress Update #{templateData.updateNumber || 'XXX'}
                </div>
              </FormGroup>

              {/* Thank You Message Section */}
              <div className="section-header">
                <h3>Thank You Message</h3>
              </div>
              <FormGroup>
                <div className="field-header">
                  <Label>Welcome Message</Label>
                  <div className="field-actions">
                    <Button
                      color={isThankYouEditable ? 'warning' : 'info'}
                      size="sm"
                      onClick={() => setIsThankYouEditable(!isThankYouEditable)}
                      className="edit-toggle-button"
                    >
                      {isThankYouEditable ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={handleResetThankYouMessage}
                      className="reset-button"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                {isThankYouEditable ? (
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    init={TINY_MCE_INIT_OPTIONS}
                    value={templateData.thankYouMessage}
                    onEditorChange={content => handleFieldChange('thankYouMessage', content)}
                  />
                ) : (
                  <div
                    className="readonly-message"
                    dangerouslySetInnerHTML={{
                      __html: templateData.thankYouMessage.replace(
                        /color: #333333/g,
                        `color: ${darkMode ? '#ffffff' : '#333333'}`,
                      ),
                    }}
                  />
                )}
              </FormGroup>

              {/* This Week's Video Topic Section */}
              <div className="section-header">
                <h3>This Week&apos;s Video Topic</h3>
              </div>
              <FormGroup>
                <Label>YouTube Link *</Label>
                <Input
                  type="url"
                  value={templateData.videoUrl}
                  onChange={e => handleVideoUrlChange(e.target.value)}
                  placeholder="https://youtu.be/..."
                  className={validationErrors.videoUrl ? 'is-invalid' : ''}
                />
              </FormGroup>

              <FormGroup>
                <div className="field-header">
                  <Label>Thumbnail Image</Label>
                  <div className="field-actions">
                    <Button
                      color="info"
                      size="sm"
                      // eslint-disable-next-line testing-library/no-node-access
                      onClick={() => document.getElementById('video-thumbnail-upload').click()}
                      className="edit-toggle-button"
                    >
                      Upload Backup
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={handleResetVideoThumbnail}
                      className="reset-button"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                <Input
                  type="url"
                  value={templateData.videoThumbnailUrl}
                  onChange={e => handleFieldChange('videoThumbnailUrl', e.target.value)}
                  placeholder="Auto-generated from YouTube URL"
                  className="thumbnail-url-input"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleVideoThumbnailUpload}
                  className="file-input"
                  id="video-thumbnail-upload"
                  style={{ display: 'none' }}
                />
                {videoThumbnailFile && (
                  <div className="file-selected-message">
                    ✓ Backup image selected: {videoThumbnailFile.name}
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Topic Description</Label>
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  init={TINY_MCE_INIT_OPTIONS}
                  value={templateData.missionMessage}
                  onEditorChange={content => handleFieldChange('missionMessage', content)}
                />
              </FormGroup>

              {/* Donation Section */}
              <div className="section-header">
                <h3>Donation</h3>
              </div>
              <FormGroup>
                <div className="field-header">
                  <Label>Support Call-to-Action</Label>
                  <div className="field-actions">
                    <Button
                      color={isDonationEditable ? 'warning' : 'info'}
                      size="sm"
                      onClick={() => setIsDonationEditable(!isDonationEditable)}
                      className="edit-toggle-button"
                    >
                      {isDonationEditable ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={handleResetDonationMessage}
                      className="reset-button"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                {isDonationEditable ? (
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    init={TINY_MCE_INIT_OPTIONS}
                    value={templateData.donationMessage}
                    onEditorChange={content => handleFieldChange('donationMessage', content)}
                  />
                ) : (
                  <div
                    className="readonly-message"
                    dangerouslySetInnerHTML={{
                      __html: templateData.donationMessage.replace(
                        /color: #333333/g,
                        `color: ${darkMode ? '#ffffff' : '#333333'}`,
                      ),
                    }}
                  />
                )}
              </FormGroup>

              {/* Footer Section */}
              <div className="section-header">
                <h3>Footer</h3>
              </div>

              {/* Social Media Links - Moved to top */}
              <FormGroup>
                <div className="field-header">
                  <Label>Social Media Links</Label>
                  <div className="field-actions">
                    <Button
                      color={isSocialLinksEditable ? 'warning' : 'info'}
                      size="sm"
                      onClick={() => setIsSocialLinksEditable(!isSocialLinksEditable)}
                      className="edit-toggle-button"
                    >
                      {isSocialLinksEditable ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={handleResetSocialLinks}
                      className="reset-button"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                {isSocialLinksEditable ? (
                  <div className="social-links-editor">
                    {templateData.socialLinks.map((link, index) => (
                      <div key={index} className="social-link-item">
                        <div className="social-link-fields">
                          <div className="social-link-field">
                            <Label>Platform Name</Label>
                            <Input
                              type="text"
                              value={link.name}
                              onChange={e => handleSocialLinkChange(index, 'name', e.target.value)}
                              placeholder="Platform name"
                            />
                          </div>
                          <div className="social-link-field">
                            <Label>URL</Label>
                            <Input
                              type="url"
                              value={link.url}
                              onChange={e => handleSocialLinkChange(index, 'url', e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="social-link-field">
                            <Label>Icon URL</Label>
                            <Input
                              type="url"
                              value={link.icon}
                              onChange={e => handleSocialLinkChange(index, 'icon', e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="social-link-actions">
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleRemoveSocialLink(index)}
                              className="remove-button"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      color="success"
                      size="sm"
                      onClick={handleAddSocialLink}
                      className="add-social-link-btn"
                    >
                      + Add Social Link
                    </Button>
                  </div>
                ) : (
                  <div className="readonly-message">
                    <div className="social-links-preview">
                      {templateData.socialLinks.map((link, index) => (
                        <div key={index} className="social-link-preview">
                          <img
                            src={link.icon}
                            alt={link.name}
                            style={{ width: '24px', height: '24px', marginRight: '8px' }}
                          />
                          <span>{link.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <div className="field-header">
                  <Label>Footer Content (Quote, Address & Preferences)</Label>
                  <div className="field-actions">
                    <Button
                      color={isFooterContentEditable ? 'warning' : 'info'}
                      size="sm"
                      onClick={() => setIsFooterContentEditable(!isFooterContentEditable)}
                      className="edit-toggle-button"
                    >
                      {isFooterContentEditable ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={handleResetFooterContent}
                      className="reset-button"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                {isFooterContentEditable ? (
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    init={TINY_MCE_INIT_OPTIONS}
                    value={templateData.footerContent}
                    onEditorChange={content => handleFieldChange('footerContent', content)}
                  />
                ) : (
                  <div
                    className="readonly-message"
                    dangerouslySetInnerHTML={{
                      __html: templateData.footerContent.replace(
                        /style="text-align: center;[^"]*"/g,
                        match =>
                          match.replace(';', `; color: ${darkMode ? '#ffffff' : '#000000'};`),
                      ),
                    }}
                  />
                )}
              </FormGroup>
            </div>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="preview-panel">
          <div className="preview-content">
            <div className="email-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      </div>

      {/* Integrated Email Sender Modal */}
      <Modal
        isOpen={showIntegratedSender}
        toggle={() => setShowIntegratedSender(false)}
        size="xl"
        className={`integrated-sender-modal ${darkMode ? 'dark-mode' : ''}`}
      >
        <ModalHeader
          toggle={() => setShowIntegratedSender(false)}
          className="integrated-sender-header"
        >
          📧 Send Email with Templates
        </ModalHeader>
        <ModalBody className="integrated-sender-body p-0">
          <IntegratedEmailSender
            initialContent={previewHtml}
            initialSubject={templateData.subject}
            onClose={() => setShowIntegratedSender(false)}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}

export default NewsletterTemplateEditor;
