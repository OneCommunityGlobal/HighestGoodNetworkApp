import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ReactDOMServer from 'react-dom/server';
import { Editor } from '@tinymce/tinymce-react';
import {
  Button,
  Input,
  Label,
  Row,
  Col,
  Spinner,
  ButtonGroup,
  Card,
  CardBody,
  Form,
  FormGroup,
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
  const [isSendControlsCollapsed, setIsSendControlsCollapsed] = useState(false);

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
        ? `<p style="font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; margin: 0 0 16px 0; color: #333333;">Click here for the video on this topic: <a href="${url}" style="color: #0066cc; text-decoration: underline;">${url}</a></p>`
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
      <OneCommunityNewsletterTemplate
        templateData={templateDataWithDefaults}
        darkMode={darkMode}
      />,
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
    const htmlContent = generatePreviewHtml();
    await onSendEmails(emailList, {
      htmlContent: htmlContent,
    });
    setIsSending(false);
  };

  const handleBroadcast = async () => {
    if (!isFormValid) {
      toast.error('Please fix all form errors before broadcasting');
      return;
    }

    setIsBroadcasting(true);
    const htmlContent = generatePreviewHtml();
    await onBroadcastEmails({
      htmlContent: htmlContent,
    });
    setIsBroadcasting(false);
  };

  // TinyMCE configuration - Enhanced version from time log popup
  const TINY_MCE_INIT_OPTIONS = {
    license_key: 'gpl',
    height: 200,
    menubar: false,
    placeholder: 'Enter your content here...',
    plugins:
      'advlist autolink autoresize lists link charmap table help wordcount formatpainter fontsize lineheight',
    toolbar:
      // eslint-disable-next-line no-multi-str
      'bold italic underline link removeformat | fontsize lineheight styleselect | alignleft aligncenter alignright alignjustify |\
                      bullist numlist outdent indent | table | strikethrough forecolor backcolor |\
                      subscript superscript charmap | help',
    branding: false,
    toolbar_mode: 'sliding',
    min_height: 180,
    max_height: 300,
    autoresize_bottom_margin: 1,
    content_style: `body, p, div, span, * { 
      cursor: text !important; 
      color: ${darkMode ? '#ffffff' : '#000000'}; 
      font-family: Arial, Helvetica, sans-serif !important; 
      font-size: 12pt !important; 
      line-height: 1.5 !important; 
    }`,
    // Set default font size
    font_size: '12pt',
    // Setup function to ensure default font size
    setup: function(editor) {
      editor.on('init', function() {
        editor.getBody().style.fontSize = '12pt';
        editor.getBody().style.fontFamily = 'Arial, Helvetica, sans-serif';
      });
    },
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
    // Block formats for headings
    block_formats:
      'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre',
    // Font size options
    fontsize_formats:
      '8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 26pt 28pt 30pt 32pt 34pt 36pt 48pt 60pt 72pt 96pt',
    // Line height options
    lineheight_formats: '1 1.2 1.4 1.6 1.8 2 2.2 2.4 2.6 2.8 3',
    // Enhanced features
    image_title: true,
    automatic_uploads: true,
    file_picker_callback(cb) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          const id = `blobid${Date.now()}`;
          const { blobCache } = window.tinymce.activeEditor.editorUpload;
          const base64 = reader.result.split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };
      // eslint-disable-next-line testing-library/no-node-access
      input.click();
    },
    a11y_advanced_options: true,
    // Additional advanced features
    paste_data_images: true,
    paste_as_text: false,
    paste_auto_cleanup_on_paste: true,
    paste_remove_styles_if_webkit: false,
    paste_merge_formats: true,
    paste_convert_word_fake_lists: true,
    paste_enable_default_filters: true,
    // Link handling
    link_context_toolbar: true,
    link_assume_external_targets: true,
    link_default_protocol: 'https',
    // Table features
    table_default_attributes: {
      border: '1',
    },
    table_default_styles: {
      'border-collapse': 'collapse',
      width: '100%',
    },
    table_cell_advtab: true,
    table_row_advtab: true,
    table_advtab: true,
    // Character map
    charmap_append: [
      ['©', 'Copyright'],
      ['®', 'Registered'],
      ['™', 'Trademark'],
      ['€', 'Euro'],
      ['£', 'Pound'],
      ['¥', 'Yen'],
      ['¢', 'Cent'],
      ['°', 'Degree'],
      ['±', 'Plus/Minus'],
      ['×', 'Multiplication'],
      ['÷', 'Division'],
      ['∞', 'Infinity'],
      ['≠', 'Not Equal'],
      ['≤', 'Less or Equal'],
      ['≥', 'Greater or Equal'],
      ['≈', 'Approximately'],
      ['∑', 'Sum'],
      ['∏', 'Product'],
      ['√', 'Square Root'],
      ['∫', 'Integral'],
      ['∆', 'Delta'],
      ['α', 'Alpha'],
      ['β', 'Beta'],
      ['γ', 'Gamma'],
      ['δ', 'Delta'],
      ['ε', 'Epsilon'],
      ['ζ', 'Zeta'],
      ['η', 'Eta'],
      ['θ', 'Theta'],
      ['λ', 'Lambda'],
      ['μ', 'Mu'],
      ['π', 'Pi'],
      ['ρ', 'Rho'],
      ['σ', 'Sigma'],
      ['τ', 'Tau'],
      ['φ', 'Phi'],
      ['χ', 'Chi'],
      ['ψ', 'Psi'],
      ['ω', 'Omega'],
    ],
  };

  return (
    <div className={`email-composer ${darkMode ? 'dark-mode' : ''}`}>
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
      </div>

      {/* Gmail/Outlook Style Send Controls */}
      <div className="send-controls">
        <div className="send-controls-header">
          <h3>Email Settings & Send</h3>
          <button
            type="button"
            className="dropdown-toggle"
            onClick={() => setIsSendControlsCollapsed(!isSendControlsCollapsed)}
          >
            {isSendControlsCollapsed ? '▼' : '▲'}
          </button>
        </div>

        {!isSendControlsCollapsed && (
          <div className="send-controls-content">
            <div className="send-controls-left">
              <div className="test-recipients-section">
                <Label className="control-label">Test Recipients</Label>
                <Input
                  type="textarea"
                  value={emailTo}
                  onChange={handleEmailListChange}
                  placeholder="Enter email addresses (one per line or comma-separated)"
                  className="test-email-input"
                  rows={3}
                />
                {emailList.length > 0 && (
                  <div className="recipient-count">
                    {emailList.length} recipient{emailList.length !== 1 ? 's' : ''} ready
                  </div>
                )}
              </div>
            </div>

            <div className="send-controls-right">
              <div className="send-buttons">
                {emailList.length > 0 && (
                  <Button
                    color="primary"
                    size="md"
                    onClick={handleSendToSpecific}
                    disabled={isSending || !isFormValid || emailValidationErrors.length > 0}
                    className="test-send-btn"
                  >
                    {isSending ? <Spinner size="sm" className="me-2" /> : null}
                    Send Test ({emailList.length})
                  </Button>
                )}
                <Button
                  color="success"
                  size="md"
                  onClick={handleBroadcast}
                  disabled={isBroadcasting || !isFormValid}
                  className="broadcast-btn"
                >
                  {isBroadcasting ? <Spinner size="sm" className="me-2" /> : null}
                  Send to All Subscribers
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

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
                        /style="text-align: center;"/g,
                        `style="text-align: center; color: ${darkMode ? '#ffffff' : '#000000'};"`,
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
          <div className="preview-header">
            <h3>Live Preview</h3>
          </div>

          <div className="preview-content">
            <div className="email-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsletterTemplateEditor;
