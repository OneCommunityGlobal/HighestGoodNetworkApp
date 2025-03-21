import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import logo2 from '../../assets/images/logo2.png';
import ImageUploader from './ImageUploader';
import { tokenKey } from '../../config.json';
import { ENDPOINTS } from '../../utils/URL.js';

function Announcements({ title, email }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('weeklyProgress'); // default to "Weekly Progress Update"
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [showEditor, setShowEditor] = useState(true); // State to control rendering of the editor

  //  Weekly Progress Update Content States
  const [headerImage, setHeaderImage] = useState(logo2);
  const [headerImageTag, setHeaderImageTag] = useState('');
  const [headingText, setHeadingText] = useState('');
  const [introText, setIntroText] = useState('');
  const [blogUrl, setBlogUrl] = useState('');
  const [bodyImage, setBodyImage] = useState(null);
  const [bodyImageTag, setBodyImageTag] = useState('');
  const [bodyImageUrl, setBodyImageUrl] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [videoLink, setVideoLink] = useState('');

  const [errors, setErrors] = useState({});

  // Predefined email addresses for sending test emails
  const testEmailAddresses = [
    'lambomichael7@gmail.com',
  ];

  // 'jae@onecommunityglobal.org',
  // 'onecommunityglobal@gmail.com',
  // 'onecommunityhospitality@gmail.com'

  useEffect(() => {
    // Toggle the showEditor state to force re-render when dark mode changes
    setShowEditor(false);
    setTimeout(() => setShowEditor(true), 0);
  }, [darkMode]);

  // Update bodyImageTag whenever videoLink or bodyImageUrl changes
  useEffect(() => {
    if (bodyImageUrl) {
      const imageTag = `<div style="text-align: center; margin: 20px 0;">
        <a href="${videoLink}" target="_blank" rel="noopener">
          <img src="${bodyImageUrl}" alt="Blog Summary Image" style="max-width: 100%; height: auto;" />
        </a>
      </div>`;
      setBodyImageTag(imageTag);
    } else {
      setBodyImageTag(''); // Clear the tag if there's no image URL
    }
  }, [bodyImageUrl, videoLink]);

  const editorInit = {
    license_key: 'gpl',
    selector: 'Editor#email-editor',
    height: 500,
    menubar: false,
    branding: false,
    plugins: 'advlist autolink lists link image charmap preview anchor help \
      searchreplace visualblocks code insertdatetime media table wordcount\
      fullscreen emoticons nonbreaking',
    image_title: true,
    automatic_uploads: true,
    file_picker_callback(cb, value, meta) {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');

      /*
        Note: In modern browsers input[type="file"] is functional without
        even adding it to the DOM, but that might not be the case in some older
        or quirky browsers like IE, so you might want to add it to the DOM
        just in case, and visually hide it. And do not forget do remove it
        once you do not need it anymore.
      */

      input.onchange = function () {
        const file = this.files[0];

        const reader = new FileReader();
        reader.onload = function () {
          /*
            Note: Now we need to register the blob in TinyMCEs image blob
            registry. In the next release this part hopefully won't be
            necessary, as we are looking to handle it internally.
          */
          const id = `blobid${new Date().getTime()}`;
          const { blobCache } = tinymce.activeEditor.editorUpload;
          const base64 = reader.result.split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);

          /* call the callback and populate the Title field with the file name */
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };

      input.click();
    },
    a11y_advanced_options: true,
    toolbar:
      'undo redo | bold italic | blocks fontfamily fontsize | image table |\
      alignleft aligncenter alignright | \
      bullist numlist outdent indent | removeformat | help',
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  }

  useEffect(() => {
    if (email) {
      const trimmedEmail = email.trim();
      setEmailTo(email);
      setEmailList(trimmedEmail.split(','));
    }
  }, [email]);

  async function uploadImageToServer(file) {
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(ENDPOINTS.UPLOAD_IMAGE(), {
        method: 'POST',
        headers: {
          Authorization: `${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  }

  const switchToWeeklyProgress = () => setActiveTab('weeklyProgress');
  const switchToNonFormatted = () => setActiveTab('nonFormatted');

  const handleEmailListChange = e => {
    const value = e.target.value;
    setEmailTo(value); // Update emailTo for the input field
    setEmailList(value.split(',')); // Update emailList for the email list
  };

  const handleHeaderContentChange = e => {
    setHeaderContent(e.target.value);
  }

  // const htmlContent = `<html><head><title>Weekly Update</title></head><body>${emailContent}</body></html>`;
  const addHeaderToEmailContent = () => {
    if (!headerContent) return;
    const imageTag = `<img src="${headerContent}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
    const editor = tinymce.get('email-editor');
    if (editor) {
      editor.insertContent(imageTag);
      setEmailContent(editor.getContent());
    }
    setHeaderContent(''); // Clear the input field after inserting the header
  };

  const convertImageToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addImageToEmailContent = e => {
    const imageFile = document.querySelector('input[type="file"]').files[0];
    convertImageToBase64(imageFile, base64Image => {
      const imageTag = `<img src="${base64Image}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
      setHeaderContent(prevContent => `${imageTag}${prevContent}`);
      const editor = tinymce.get('email-editor');
      if (editor) {
        editor.insertContent(imageTag);
        setEmailContent(editor.getContent());
      }
    });
    e.target.value = '';
  };

  useEffect(() => {
    if (!headerImageTag) {
      const imageTag = `<div style="text-align: center; margin-bottom: 9px; padding: 9px 18px;">
        <img src="https://mcusercontent.com/1b1ba36facf96dc45b6697f82/images/931ce505-118d-19f7-c9ea-81d8e5e59613.png" alt="One Community Logo" style="max-width: 100%; height: auto; pointer-events: none;" />
      </div>`;
      setHeaderImageTag(imageTag);
    }
  }, []);

  const handleHeaderImageUpload = async (file, e) => {
    // Update the preview image
    fileToBase64(file, setHeaderImage);

    // Upload to Azure and get URL
    const url = await uploadImageToServer(file);
    if (url) {
      const imageTag = `<div style="text-align: center; margin-bottom: 9px; padding: 9px 18px;">
        <img src="${url}" alt="One Community Logo" style="max-width: 100%; height: auto; pointer-events: none;" />
      </div>`;
      setHeaderImageTag(imageTag);
    }

    if (e && e.target) e.target.value = '';
  };

  const handleBodyImageUpload = async (file, e) => {
    // Update the preview image
    fileToBase64(file, setBodyImage);

    // Upload to Azure and get URL
    const url = await uploadImageToServer(file);
    if (url) {
      setBodyImageUrl(url);
    }

    if (e && e.target) e.target.value = '';
  };

  const validateEmail = (email) => {
    /* Add a regex pattern for email validation */
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  // Helper to convert file -> base64 string
  const fileToBase64 = (file, setStateCallback) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setStateCallback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Validate required fields for Weekly Progress Update
  const validateFields = () => {
    const editorErrors = {};
    if (!headingText.trim()) {
      editorErrors.headingText = "Heading Text is required.";
    }
    if (!introText.trim()) {
      editorErrors.introText = "Introduction Paragraph is required.";
    }
    if (!blogUrl.trim()) {
      editorErrors.blogUrl = "Blog URL is required.";
    } else {
      try {
        new URL(blogUrl);
      } catch (e) {
        editorErrors.blogUrl = "Enter a valid blog URL.";
      }
    }
    if (!bodyText.trim()) {
      editorErrors.bodyText = "Blog Summary Paragraph is required.";
    }
    if (!videoLink.trim()) {
      editorErrors.videoLink = "Video Link is required.";
    } else {
      try {
        new URL(videoLink);
      } catch (e) {
        editorErrors.videoLink = "Enter a valid video link.";
      }
    }
    if (!bodyImage) {
      editorErrors.bodyImage = "Body Image upload is required.";
    }
    setErrors(editorErrors);
    return Object.keys(editorErrors).length === 0;
  };

  // Email HTML Format
  const constructEmailContent = () => {
    // Start of email container
    let content = `
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; line-height: 1.6; font-size: 14px;">
    `;

    // Default Header (Logo)
    if (headerImageTag) {
      content += headerImageTag;
    }

    // Heading Text
    if (headingText) {
      content += `
        <h2 style="text-align: center; margin-bottom: 10px; font-size: 24px; color: #222 !important">
          ${headingText}
        </h2>
      `;
    }

    // Intro Text
    if (introText) {
      content += `<p style="color: #222 !important">${introText}</p>`;
    }

    // Blog URL
    if (blogUrl) {
      content += `
        <p>
          <a href="${blogUrl}" target="_blank" rel="noopener">
            ${blogUrl}
          </a>
        </p>
      `;
    }

    content += `
      <p style="text-align: left; margin: 10px 0; color: #222 !important">
        This Week's Video Topic:
      </p>
    `;

    // Body Image
    if (bodyImageTag) {
      content += bodyImageTag;
    }

    // Blog Summary Paragraph
    if (bodyText) {
      content += `<p style="color: #222 !important">${bodyText}</p>`;
    }

    content += `
      <p>
        Click here for the video on this topic:
        <a href="${videoLink}" target="_blank" rel="noopener">
          ${videoLink}
        </a>
      </p>
    `;

    content += `
      <p style="color: #222 !important">
        Love what we're doing and want to help? Click
        <a href="https://onecommunityglobal.org/contribute-join-partner/" target="_blank" rel="noopener">here</a>
        to learn what we're currently raising money for and to donate. Even $5 dollars helps!
      </p>
    `;

    // Social Media Links
    content += `
      <div style="text-align: center; margin-top: 45px;">
        <p style="margin: 0 auto; display: inline-block;">
          <a href="https://onecommunityglobal.org/overview/" target="_blank" rel="noopener" style="margin: 0 14px;">
            <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-link-48.png"
            alt="Overview" 
            style="width: 24px; height: 24px; vertical-align: middle;" /></a>
          <a href="https://www.facebook.com/onecommunityfans" target="_blank" rel="noopener" style="margin: 0 14px;">
            <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-facebook-48.png"
            alt="Facebook" 
            style="width: 24px; height: 24px; vertical-align: middle;" /></a>
          <a href="https://x.com/onecommunityorg" target="_blank" rel="noopener" style="margin: 0 14px;">
            <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-twitter-48.png"
            alt="Twitter" 
            style="width: 24px; height: 24px; vertical-align: middle;" /></a>
          <a href="https://www.linkedin.com/company/one-community-global/" target="_blank" rel="noopener" style="margin: 0 14px;">
            <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-linkedin-48.png"
            alt="LinkedIn" 
            style="width: 24px; height: 24px; vertical-align: middle;" /></a>
          <a href="https://www.youtube.com/user/onecommunityorg" target="_blank" rel="noopener" style="margin: 0 14px;">
            <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-youtube-48.png"
            alt="YouTube" 
            style="width: 24px; height: 24px; vertical-align: middle;" /></a>
          <a href="https://www.instagram.com/onecommunityglobal/" target="_blank" rel="noopener" style="margin: 0 14px;">
            <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-instagram-48.png"
            alt="Instagram" 
            style="width: 24px; height: 24px; vertical-align: middle;" /></a>
          <a href="https://www.pinterest.com/onecommunityorg/one-community/" target="_blank" rel="noopener" style="margin: 0 14px;">
            <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-pinterest-48.png"
            alt="Pinterest" 
            style="width: 24px; height: 24px; vertical-align: middle;" /></a>
          <a href="mailto:onecommunityupdates@gmail.com" style="margin: 0 14px;">
            <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-forwardtofriend-48.png"
            alt="Email" 
            style="width: 24px; height: 24px; vertical-align: middle;" /></a>
        </p>
      </div>
    `;

    // Footer
    content += `
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;" />
      <div style="font-size: 12px; color: #666 !important;  font-style: italic; text-align: center; margin: 0 auto; max-width: 500px;">
        <p style="font-style: italic; margin: 0;">
          "In order to change an existing paradigm you do not struggle to try and change the problematic model. 
          You create a new model and make the old one obsolete. That, in essence, is the higher service to which 
          we are all being called."
        </p>
        <p style="margin-block: 0;">
          ~ Buckminster Fuller ~
        </p>
      </div>
      <br />
      <p style="font-size: 12px; color: #666 !important; text-align: center; margin-block: 0;">
        <strong>Our mailing address is:</strong> <br />
        One Community Inc.<br />
        8954 Camino real<br />
        San Gabriel, CA 91775-1932<br />
        <br />
        <span style="display: inline-block;">
          <a href="https://onecommunityglobal.us1.list-manage.com/vcard?u=1b1ba36facf96dc45b6697f82&amp;id=0b0702fa07" style="color: #666;">
            Add us to your address book 
          </a>
          <span style="margin: 0 2px;">|</span>
          <a href="https://onecommunityglobal.us1.list-manage.com/unsubscribe?u=1b1ba36facf96dc45b6697f82&id=0b0702fa07&t=b&e=dfcc422eb9&c=6b96ac6858" target="_blank" rel="noopener" style="color: #666;">
            Unsubscribe from this list
          </a>
        </span>
      </p>
    `;

    content += `</div>`;

    return content;
  };

  const handleSendEmails = () => {
    if (activeTab === 'weeklyProgress' && !validateFields()) { // Do not send emails if any field in 'Weekly Progress' tab is invalid
      toast.error('Error: Please fill in all required fields before sending a test email.');
      return;
    }

    const htmlContent = emailContent;

    if (emailList.length === 0 || emailList.every(email => !email.trim())) {
      toast.error('Error: Empty Email List. Please enter AT LEAST One email.');
      return;
    }

    const invalidEmails = emailList.filter(email => !validateEmail(email.trim()));

    if (invalidEmails.length > 0) {
      toast.error(`Error: Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    dispatch(sendEmail(emailList.join(','), title ? 'Anniversary congrats' : 'Weekly update', htmlContent));
  };


  const handleBroadcastEmails = () => {
    if (activeTab === 'weeklyProgress' && !validateFields()) { // Do not broadcast emails if any field in 'Weekly Progress' tab is invalid
      toast.error('Error: Please fill in all required fields before sending a test email.');
      return;
    }

    const htmlContent = `
    <div style="max-width: 900px; width: 100%; margin: auto;">
      ${emailContent}
    </div>
  `;
    dispatch(broadcastEmailsToAll('Weekly Update', htmlContent));
  };

  const handleSendTestEmail = () => {
    if (activeTab === 'weeklyProgress' && !validateFields()) {
      toast.error('Error: Please fill in all required fields before sending a test email.');
      return;
    }

    const htmlContent = constructEmailContent();

    // Validate test email addresses
    const invalidTestEmails = testEmailAddresses.filter(email => !validateEmail(email.trim()));
    if (invalidTestEmails.length > 0) {
      toast.error(`Error: Invalid test email addresses: ${invalidTestEmails.join(', ')}`);
      return;
    }

    dispatch(sendEmail(testEmailAddresses.join(','), 'Test Email: Weekly Progress Update', htmlContent));
  };

  const renderWeeklyProgressView = () => (
    <div className="email-update-container">
      <div className="editor">
        {title ? <h3>{title}</h3> : <h3>Weekly Progress Editor</h3>}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'weeklyProgress' ? 'active' : ''}`}
            onClick={switchToWeeklyProgress}
          >
            Weekly Progress Update
          </button>
          <button
            className={`tab-button ${activeTab === 'nonFormatted' ? 'active' : ''}`}
            onClick={switchToNonFormatted}
          >
            Non-Formatted
          </button>
        </div>

        <p style={{ marginBottom: '20px' }}>
          Use the fields below to build the weekly progress update.
          You can upload images for the header and body, then provide heading and text content.
          Additional details such as social media links and disclaimers will be automatically included.
        </p>

        {/* Drag & drop for header image */}
        <h4>Header Image</h4>
        {headerImage && (
          <>
            <p style={{ fontStyle: 'italic', marginBottom: '5px' }}>
              A default header image is currently set. You can replace it by dragging or clicking below.
            </p>
            <img
              className="image-preview"
              src={headerImage}
              alt="Header Preview"
            />
          </>
        )}
        <ImageUploader onFileUpload={handleHeaderImageUpload} />

        {/* Heading text */}
        <label>Enter Heading Text:</label>
        <input
          type="text"
          value={headingText}
          onChange={e => setHeadingText(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        {errors.headingText && <div style={{ color: 'red', fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>
          {errors.headingText}
        </div>}

        {/* Introduction text */}
        <label>Enter Introduction Paragraph:</label>
        <textarea
          rows={3}
          value={introText}
          onChange={e => setIntroText(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        {errors.introText && <div style={{ color: 'red', fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>
          {errors.introText}
        </div>}

        {/* Blog URL Field */}
        <label>Enter Blog URL:</label>
        <input
          type="url"
          value={blogUrl}
          onChange={e => setBlogUrl(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        {errors.blogUrl && <div style={{ color: 'red', fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>
          {errors.blogUrl}
        </div>}

        {/* Drag & drop for body image */}
        <h4>Blog Summary Image</h4>
        {bodyImage && (
          <img
            className="image-preview"
            src={bodyImage}
            alt="Body Preview"
          />
        )}
        <ImageUploader onFileUpload={handleBodyImageUpload} />
        {errors.bodyImage && <div style={{ color: 'red', fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>
          {errors.bodyImage}
        </div>}

        {/* Body text */}
        <label>Enter Blog Summary Paragraph:</label>
        <textarea
          rows={5}
          value={bodyText}
          onChange={e => setBodyText(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        {errors.bodyText && <div style={{ color: 'red', fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>
          {errors.bodyText}
        </div>}

        {/* Video Link Field */}
        <label>Enter Video Link:</label>
        <input
          type="url"
          value={videoLink}
          onChange={e => setVideoLink(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        {errors.videoLink && <div style={{ color: 'red', fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>
          {errors.videoLink}
        </div>}

        {
          title ? (
            ""
          ) : (
            <button type="button" className="send-button" onClick={handleBroadcastEmails} style={{ ... (darkMode ? boxStyleDark : boxStyle), marginRight: '20px' }}>
              Broadcast Weekly Update
            </button>
          )
        }

        <button type="button" className="send-button-green" onClick={handleSendTestEmail} style={darkMode ? boxStyleDark : boxStyle}>
          Send Test Email
        </button>
      </div>
    </div>
  );

  const renderNonFormattedView = () => (
    <div className="email-update-container">
      <div className="editor">
        {title ? <h3>{title}</h3> : <h3>Weekly Progress Editor</h3>}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'weeklyProgress' ? 'active' : ''}`}
            onClick={switchToWeeklyProgress}
          >
            Weekly Progress Update
          </button>
          <button
            className={`tab-button ${activeTab === 'nonFormatted' ? 'active' : ''}`}
            onClick={switchToNonFormatted}
          >
            Non-Formatted
          </button>
        </div>
        <br />
        {showEditor && <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          id="email-editor"
          initialValue="<p>This is the initial content of the editor</p>"
          init={editorInit}
          onEditorChange={(content, editor) => {
            setEmailContent(content);
          }}
        />}
        {
          title ? (
            ""
          ) : (
            <button type="button" className="send-button" onClick={handleBroadcastEmails} style={darkMode ? boxStyleDark : boxStyle}>
              Broadcast Weekly Update
            </button>
          )
        }

      </div>
      <div className={`emails ${darkMode ? 'bg-yinmn-blue' : ''}`} style={darkMode ? boxStyleDark : boxStyle}>
        {
          title ? (
            <p>Email</p>
          ) : (

            <label htmlFor="email-list-input" className={darkMode ? 'text-light' : 'text-dark'}>
              Email List (comma-separated):
            </label>
          )
        }
        <input type="text" value={emailTo} id="email-list-input" onChange={handleEmailListChange} className='input-text-for-announcement' />
        <button type="button" className="send-button" onClick={handleSendEmails} style={darkMode ? boxStyleDark : boxStyle}>
          {
            title ? (
              "Send Email"
            ) : (
              "Send mail to specific users"
            )
          }
        </button>

        <hr />
        <label htmlFor="header-content-input" className={darkMode ? 'text-light' : 'text-dark'}>
          Insert header or image link:
        </label>
        <input
          type="text"
          id="header-content-input"
          onChange={handleHeaderContentChange}
          value={headerContent}
          className="input-text-for-announcement"
        />

        <button type="button" className="send-button" onClick={addHeaderToEmailContent} style={darkMode ? boxStyleDark : boxStyle}>
          Insert
        </button>
        <hr />
        <label htmlFor="upload-header-input" className={darkMode ? 'text-light' : 'text-dark'}>
          Upload Header (or footer):
        </label>
        <input
          type="file"
          id="upload-header-input"
          onChange={addImageToEmailContent}
          className="input-file-upload"
        />

      </div>
    </div>
  );

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: "100%" }}>
      {activeTab === 'weeklyProgress' && renderWeeklyProgressView()}
      {activeTab === 'nonFormatted' && renderNonFormattedView()}
    </div>

  );
}

export default Announcements;

