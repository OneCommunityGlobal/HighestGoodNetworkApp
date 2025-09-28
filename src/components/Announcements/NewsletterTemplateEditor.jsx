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
import './NewsletterTemplateEditor.css';

function NewsletterTemplateEditor({ onContentChange, onSendEmails, onBroadcastEmails }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const editorRef = useRef(null);

  // Template data with defaults
  const [templateData, setTemplateData] = useState({
    updateNumber: '',
    headerImageUrl:
      'https://mcusercontent.com/1b1ba36facf96dc45b6697f82/images/931ce505-118d-19f7-c9ea-81d8e5e59613.png',
    thankYouMessage:
      'Thank you for following One Community&apos;s progress, here is the link to our weekly progress report with our update video and recent progress related imagery, links, and other details: https://onecommunityglobal.org/open-source-utopia-models',
    videoTopicTitle: '',
    videoUrl: '',
    videoThumbnailUrl: '',
    missionMessage: '',
    videoLinkText: '',
    donationMessage:
      'Love what we&apos;re doing and want to help? Click <a href="https://onecommunityglobal.org/contribute-join-partner/" target="_blank" rel="noopener noreferrer">here</a> to learn what we&apos;re currently raising money for and to donate. Even $5 dollars helps!',
    subject: 'One Community Weekly Update',
    fromName: 'One Community',
    fromEmail: 'updates@onecommunityglobal.org',
    footerQuote:
      'In order to change an existing paradigm you do not struggle to try and change the problematic model. You create a new model and make the old one obsolete. That, in essence, is the higher service to which we are all being called.',
    footerAuthor: 'Buckminster Fuller',
    mailingAddress: 'One Community Inc.\n8954 Camino Real\nSan Gabriel, CA 91775-1932',
    updatePreferencesText:
      'Want to change how you receive these emails?\nYou can update your preferences or unsubscribe from this list.',
    socialLinks: [
      {
        name: 'Website',
        url: 'https://www.onecommunityglobal.org/overview/',
        icon:
          'https://www.dropbox.com/scl/fi/d8qldlgs3m0fmhwynzguh/link.png?rlkey=apqucrte9pwplhvjakyfbiw1j&st=dis5ps7b&raw=1',
      },
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/onecommunityfans',
        icon:
          'https://www.dropbox.com/scl/fi/kigo13prmkypd9rsttvan/facebook.png?rlkey=q4r4uz6hn6bp75u48db7gju49&st=zzebhh1k&raw=1',
      },
      {
        name: 'X (Twitter)',
        url: 'https://x.com/onecommunityorg',
        icon:
          'https://www.dropbox.com/scl/fi/l2wbgkc6u0taaeguvsu5c/x.png?rlkey=btzsctxjlarmfsjakk5pfhvqu&st=0rfg3xcd&raw=1',
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/company/one-community-global/posts/?feedView=all',
        icon:
          'https://www.dropbox.com/scl/fi/u17ghmc38dcln4avgcvuc/linkedin.png?rlkey=v8qimmq5h648fbsnhay8kan9t&st=fm0uvrhw&raw=1',
      },
      {
        name: 'YouTube',
        url: 'https://www.youtube.com/user/onecommunityorg',
        icon:
          'https://www.dropbox.com/scl/fi/88byqgoytpez4k937syou/youtube.png?rlkey=yhwkwmrpsn0eaz5yuu9h5ysce&st=jq80ocek&raw=1',
      },
      {
        name: 'Instagram',
        url: 'https://www.instagram.com/onecommunityglobal/',
        icon:
          'https://www.dropbox.com/scl/fi/wvsr28y19ro0icv4tr5mc/ins.png?rlkey=v4fbrmoniil8jcwtiv8ew7o7s&st=04vwah63&raw=1',
      },
      {
        name: 'Pinterest',
        url: 'https://www.pinterest.com/onecommunityorg/one-community/',
        icon:
          'https://www.dropbox.com/scl/fi/88byqgoytpez4k937syou/youtube.png?rlkey=yhwkwmrpsn0eaz5yuu9h5ysce&st=jq80ocek&raw=1',
      },
      {
        name: 'Email',
        url: 'mailto:onecommunitupdates@gmail.com',
        icon:
          'https://www.dropbox.com/scl/fi/7bahc1w6h6cyez8610nwi/guirong.wu.10-gmail.com.png?rlkey=1tokcqsp6dix4xjr44zytmlbl&st=qa5hly4e&raw=1',
      },
    ],
  });

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
  const [isFooterQuoteEditable, setIsFooterQuoteEditable] = useState(false);
  const [isMailingAddressEditable, setIsMailingAddressEditable] = useState(false);
  const [isUpdatePreferencesEditable, setIsUpdatePreferencesEditable] = useState(false);
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
      videoLinkText: url ? `Click here for the video on this topic: ${url}` : '',
    }));
  };

  const handleResetHeaderImage = () => {
    setHeaderImageFile(null);
    setTemplateData(prev => ({
      ...prev,
      headerImageUrl:
        'https://mcusercontent.com/1b1ba36facf96dc45b6697f82/images/931ce505-118d-19f7-c9ea-81d8e5e59613.png',
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
      thankYouMessage:
        'Thank you for following One Community&apos;s progress, here is the link to our weekly progress report with our update video and recent progress related imagery, links, and other details: https://onecommunityglobal.org/open-source-utopia-models',
    }));
  };

  const handleResetDonationMessage = () => {
    setTemplateData(prev => ({
      ...prev,
      donationMessage:
        'Love what we&apos;re doing and want to help? Click <a href="https://onecommunityglobal.org/contribute-join-partner/" target="_blank" rel="noopener noreferrer">here</a> to learn what we&apos;re currently raising money for and to donate. Even $5 dollars helps!',
    }));
  };

  const handleResetFooterQuote = () => {
    setTemplateData(prev => ({
      ...prev,
      footerQuote:
        'In order to change an existing paradigm you do not struggle to try and change the problematic model. You create a new model and make the old one obsolete. That, in essence, is the higher service to which we are all being called.',
      footerAuthor: 'Buckminster Fuller',
    }));
  };

  const handleResetMailingAddress = () => {
    setTemplateData(prev => ({
      ...prev,
      mailingAddress: 'One Community Inc.\n8954 Camino Real\nSan Gabriel, CA 91775-1932',
    }));
  };

  const handleResetUpdatePreferences = () => {
    setTemplateData(prev => ({
      ...prev,
      updatePreferencesText:
        'Want to change how you receive these emails?\nYou can update your preferences or unsubscribe from this list.',
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
          name: 'New Platform',
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
      socialLinks: [
        {
          name: 'Website',
          url: 'https://www.onecommunityglobal.org/overview/',
          icon:
            'https://www.dropbox.com/scl/fi/d8qldlgs3m0fmhwynzguh/link.png?rlkey=apqucrte9pwplhvjakyfbiw1j&st=dis5ps7b&raw=1',
        },
        {
          name: 'Facebook',
          url: 'https://www.facebook.com/onecommunityfans',
          icon:
            'https://www.dropbox.com/scl/fi/kigo13prmkypd9rsttvan/facebook.png?rlkey=q4r4uz6hn6bp75u48db7gju49&st=zzebhh1k&raw=1',
        },
        {
          name: 'X (Twitter)',
          url: 'https://x.com/onecommunityorg',
          icon:
            'https://www.dropbox.com/scl/fi/l2wbgkc6u0taaeguvsu5c/x.png?rlkey=btzsctxjlarmfsjakk5pfhvqu&st=0rfg3xcd&raw=1',
        },
        {
          name: 'LinkedIn',
          url: 'https://www.linkedin.com/company/one-community-global/posts/?feedView=all',
          icon:
            'https://www.dropbox.com/scl/fi/u17ghmc38dcln4avgcvuc/linkedin.png?rlkey=v8qimmq5h648fbsnhay8kan9t&st=fm0uvrhw&raw=1',
        },
        {
          name: 'YouTube',
          url: 'https://www.youtube.com/user/onecommunityorg',
          icon:
            'https://www.dropbox.com/scl/fi/88byqgoytpez4k937syou/youtube.png?rlkey=yhwkwmrpsn0eaz5yuu9h5ysce&st=jq80ocek&raw=1',
        },
        {
          name: 'Instagram',
          url: 'https://www.instagram.com/onecommunityglobal/',
          icon:
            'https://www.dropbox.com/scl/fi/wvsr28y19ro0icv4tr5mc/ins.png?rlkey=v4fbrmoniil8jcwtiv8ew7o7s&st=04vwah63&raw=1',
        },
        {
          name: 'Pinterest',
          url: 'https://www.pinterest.com/onecommunityorg/one-community/',
          icon:
            'https://www.dropbox.com/scl/fi/88byqgoytpez4k937syou/youtube.png?rlkey=yhwkwmrpsn0eaz5yuu9h5ysce&st=jq80ocek&raw=1',
        },
        {
          name: 'Email',
          url: 'mailto:onecommunitupdates@gmail.com',
          icon:
            'https://www.dropbox.com/scl/fi/7bahc1w6h6cyez8610nwi/guirong.wu.10-gmail.com.png?rlkey=1tokcqsp6dix4xjr44zytmlbl&st=qa5hly4e&raw=1',
        },
      ],
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
    if (!templateData.subject.trim()) {
      errors.subject = 'Email subject is required';
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
    const templateDataWithDefaults = {
      ...templateData,
      updateNumber: templateData.updateNumber || '651',
      newsletterTitle: `One Community Weekly Progress Update #${templateData.updateNumber ||
        '651'}`,
    };

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
      subject: templateData.subject,
      fromName: templateData.fromName,
      fromEmail: templateData.fromEmail,
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
      subject: templateData.subject,
      fromName: templateData.fromName,
      fromEmail: templateData.fromEmail,
      htmlContent: htmlContent,
    });
    setIsBroadcasting(false);
  };

  // TinyMCE configuration - EXACT copy from your working EmailPanel
  const TINY_MCE_INIT_OPTIONS = {
    license_key: 'gpl',
    height: 200,
    plugins: [
      'advlist autolink lists link image',
      'charmap print preview anchor help',
      'searchreplace visualblocks code',
      'insertdatetime media table wordcount',
    ],
    menubar: false,
    branding: false,
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
    toolbar:
      'undo redo | bold italic | blocks fontfamily fontsize | image alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | help',
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
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
              <div className="subject-field">
                <Label className="control-label">Subject *</Label>
                <Input
                  type="text"
                  value={templateData.subject}
                  onChange={e => handleFieldChange('subject', e.target.value)}
                  placeholder="Email subject line"
                  className={`subject-input ${validationErrors.subject ? 'is-invalid' : ''}`}
                />
              </div>
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
                <h3>1. Header</h3>
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
                <h3>2. Title</h3>
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
                <h3>3. Thank You Message</h3>
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
                      __html: templateData.thankYouMessage
                        .replace(/<p[^>]*>/g, '')
                        .replace(/<\/p>/g, ' ')
                        .replace(/<br\s*\/?>/g, ' ')
                        .trim(),
                    }}
                  />
                )}
              </FormGroup>

              {/* This Week's Video Topic Section */}
              <div className="section-header">
                <h3>4. This Week&apos;s Video Topic</h3>
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

              <FormGroup>
                <Label>Watch Link</Label>
                <div className="readonly-message">
                  {templateData.videoLinkText || 'Enter a YouTube URL above to auto-generate'}
                </div>
              </FormGroup>

              {/* Donation Section */}
              <div className="section-header">
                <h3>5. Donation</h3>
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
                      __html: templateData.donationMessage
                        .replace(/<p[^>]*>/g, '')
                        .replace(/<\/p>/g, ' ')
                        .replace(/<br\s*\/?>/g, ' ')
                        .trim(),
                    }}
                  />
                )}
              </FormGroup>

              {/* Footer Section */}
              <div className="section-header">
                <h3>6. Footer</h3>
              </div>
              <FormGroup>
                <div className="field-header">
                  <Label>Inspirational Quote</Label>
                  <div className="field-actions">
                    <Button
                      color={isFooterQuoteEditable ? 'warning' : 'info'}
                      size="sm"
                      onClick={() => setIsFooterQuoteEditable(!isFooterQuoteEditable)}
                      className="edit-toggle-button"
                    >
                      {isFooterQuoteEditable ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={handleResetFooterQuote}
                      className="reset-button"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                {isFooterQuoteEditable ? (
                  <div>
                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      init={TINY_MCE_INIT_OPTIONS}
                      value={templateData.footerQuote}
                      onEditorChange={content => handleFieldChange('footerQuote', content)}
                    />
                    <div style={{ marginTop: '10px' }}>
                      <Label>Author</Label>
                      <Input
                        type="text"
                        value={templateData.footerAuthor}
                        onChange={e => handleFieldChange('footerAuthor', e.target.value)}
                        placeholder="Quote author"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="readonly-message"
                    dangerouslySetInnerHTML={{
                      __html: `"${templateData.footerQuote
                        .replace(/<p[^>]*>/g, '')
                        .replace(/<\/p>/g, ' ')
                        .replace(/<br\s*\/?>/g, ' ')
                        .trim()}"<br />~ ${templateData.footerAuthor} ~`,
                    }}
                  />
                )}
              </FormGroup>

              <FormGroup>
                <div className="field-header">
                  <Label>Mailing Address</Label>
                  <div className="field-actions">
                    <Button
                      color={isMailingAddressEditable ? 'warning' : 'info'}
                      size="sm"
                      onClick={() => setIsMailingAddressEditable(!isMailingAddressEditable)}
                      className="edit-toggle-button"
                    >
                      {isMailingAddressEditable ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={handleResetMailingAddress}
                      className="reset-button"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                {isMailingAddressEditable ? (
                  <Input
                    type="textarea"
                    value={templateData.mailingAddress}
                    onChange={e => handleFieldChange('mailingAddress', e.target.value)}
                    placeholder="Enter mailing address (use line breaks for formatting)"
                    rows={4}
                  />
                ) : (
                  <div className="readonly-message">
                    {templateData.mailingAddress.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < templateData.mailingAddress.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <div className="field-header">
                  <Label>Update Preferences Text</Label>
                  <div className="field-actions">
                    <Button
                      color={isUpdatePreferencesEditable ? 'warning' : 'info'}
                      size="sm"
                      onClick={() => setIsUpdatePreferencesEditable(!isUpdatePreferencesEditable)}
                      className="edit-toggle-button"
                    >
                      {isUpdatePreferencesEditable ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={handleResetUpdatePreferences}
                      className="reset-button"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                {isUpdatePreferencesEditable ? (
                  <Input
                    type="textarea"
                    value={templateData.updatePreferencesText}
                    onChange={e => handleFieldChange('updatePreferencesText', e.target.value)}
                    placeholder="Enter update preferences text"
                    rows={3}
                  />
                ) : (
                  <div className="readonly-message">
                    {templateData.updatePreferencesText.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < templateData.updatePreferencesText.split('\n').length - 1 && (
                          <br />
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </FormGroup>

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
