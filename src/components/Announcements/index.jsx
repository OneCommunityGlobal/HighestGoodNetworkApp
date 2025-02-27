import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import logo2 from '../../assets/images/logo2.png';
import link from '../../assets/images/link.png';
import facebook from '../../assets/images/Facebook_Logo_Primary.png';
import instagram from '../../assets/images/Instagram_Glyph_Gradient.png';
import twitter from '../../assets/images/logo-white.png';
import pinterest from '../../assets/images/P-Badge-Red-RGB.png';
import youtube from '../../assets/images/youtube_social_circle_red.png';
import linkedin from '../../assets/images/LI-In-Bug.png';
import email from '../../assets/images/email.png';
import ImageUploader from './ImageUploader';

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
  const [headingText, setHeadingText] = useState('');
  const [introText, setIntroText] = useState('');
  const [blogUrl, setBlogUrl] = useState('');
  const [bodyImage, setBodyImage] = useState(null);
  const [bodyText, setBodyText] = useState('');
  const [videoLink, setVideoLink] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Toggle the showEditor state to force re-render when dark mode changes
    setShowEditor(false);
    setTimeout(() => setShowEditor(true), 0);
  }, [darkMode]);

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

  const validateEmail = (email) => {
    /* Add a regex pattern for email validation */
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleHeaderImageDrop = (file) => {
    fileToBase64(file, setHeaderImage);
  };
  const handleBodyImageDrop = (file) => {
    fileToBase64(file, setBodyImage);
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
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <!-- Default Header (Logo) -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="/Users/michaellambo/Desktop/how-to-install/HighestGoodNetworkApp/HighestGoodNetworkApp/src/assets/images/logo2.png" alt="One Community Logo" style="max-width: 200px; height: auto;" />
        </div>
    `;

    // Heading Text
    if (headingText) {
      content += `
        <h2 style="text-align: center; margin-bottom: 20px;">
          ${headingText}
        </h2>
      `;
    }

    // Intro Text
    if (introText) {
      content += `<p>${introText}</p>`;
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
      <p style="text-align: left; margin: 10px 0;">
        This Week's Video Topic:
      </p>
    `;

    // Body Image
    if (bodyImage) {
      content += `
        <div style="text-align: center; margin: 20px 0;">
          <img src="${bodyImage}" alt="Blog Summary Image" style="max-width: 100%; height: auto;" />
        </div>
      `;
    }

    // Blog Summary Paragraph
    if (bodyText) {
      content += `<p>${bodyText}</p>`;
    }

    // "Click here for the video on this topic:" + video link
    content += `
      <p>
        Click here for the video on this topic:
        <a href="${videoLink}" target="_blank" rel="noopener">
          ${videoLink}
        </a>
      </p>
    `;

    // Hardcoded CTA
    content += `
      <p>
        Love what we're doing and want to help? Click
        <a href="https://google.com" target="_blank" rel="noopener">here</a>
        to learn what we're currently raising money for and to donate. Even $5 dollars helps!
      </p>
    `;

    // Social Media Links
    // TODO: Change text to icons
    content += `
      <hr style="margin: 30px 0;" />
      <div style="text-align: center;">
        <p style="margin: 0 auto; display: inline-block;">
          <a href="https://onecommunityglobal.org/overview/" target="_blank" rel="noopener" style="margin: 0 5px;">
            <img src={link} 
            alt="Overview" 
            style="width: 24px; height: 24px; vertical-align: middle;" />
          </a> |
          <a href="https://www.facebook.com/onecommunityfans" target="_blank" rel="noopener" style="margin: 0 5px;">
            <img src='{facebook} '
            alt="Facebook" 
            style="width: 24px; height: 24px; vertical-align: middle;" />
          </a> |
          <a href="https://x.com/onecommunityorg" target="_blank" rel="noopener" style="margin: 0 5px;">
            <img src={twitter} 
            alt="Twitter" 
            style="width: 24px; height: 24px; vertical-align: middle;" />
          </a> |
          <a href="https://www.linkedin.com/company/one-community-global/" target="_blank" rel="noopener" style="margin: 0 5px;">
            <img src={linkedin} 
            alt="LinkedIn" 
            style="width: 24px; height: 24px; vertical-align: middle;" />
          </a> |
          <a href="https://www.youtube.com/user/onecommunityorg" target="_blank" rel="noopener" style="margin: 0 5px;">
            <img src={youtube} 
            alt="YouTube" 
            style="width: 24px; height: 24px; vertical-align: middle;" />
          </a> |
          <a href="https://www.instagram.com/onecommunityglobal/" target="_blank" rel="noopener" style="margin: 0 5px;">
            <img src={instagram} 
            alt="Instagram" 
            style="width: 24px; height: 24px; vertical-align: middle;" />
          </a> |
          <a href="https://www.pinterest.com/onecommunityorg/one-community/" target="_blank" rel="noopener" style="margin: 0 5px;">
            <img src={pinterest} 
            alt="Pinterest" 
            style="width: 24px; height: 24px; vertical-align: middle;" />
          </a> |
          <a href="mailto:onecommunityupdates@gmail.com" style="margin: 0 5px;">
            <img src={email} 
            alt="Email" 
            style="width: 24px; height: 24px; vertical-align: middle;" />
          </a>
        </p>
      </div>
    `;

    // Footer
    content += `
      <hr style="margin: 30px 0;" />
      <div style="font-size: 12px; color: #666;  font-style: italic; text-align: center; margin: 0 auto; max-width: 500px;">
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
      <p style="font-size: 12px; color: #666; text-align: center; margin-block: 0;">
        <strong>Our mailing address is:</strong> <br />
        One Community Inc.<br />
        8954 Camino real<br />
        San Gabriel, CA 91775-1932<br />
        <br />
        Add us to your address book
      </p>
      <br />

      <p style="font-size: 12px; color: #666; text-align: center; margin-block: 0;">
        Want to change how you receive these emails?<br /> 
        You can 
        <a href="https://onecommunityglobal.us1.list-manage.com/profile?u=1b1ba36facf96dc45b6697f82&id=0b0702fa07&e=dfcc422eb9&c=6b96ac6858" target="_blank" rel="noopener" style="color: #666;">
          update your preferences
        </a>
        or 
        <a href="https://onecommunityglobal.us1.list-manage.com/unsubscribe?u=1b1ba36facf96dc45b6697f82&id=0b0702fa07&t=b&e=dfcc422eb9&c=6b96ac6858" target="_blank" rel="noopener" style="color: #666;">
          unsubscribe from this list
        </a>.
        <br />
      </p>
    `;

    content += `</div>`;

    return content;
  };

  const handlePreview = () => {
    const content = constructEmailContent();

    const htmlDoc = `<!DOCTYPE html>
    <html>
      <head><title>Email Preview</title></head>
      <body>${content}</body>
    </html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleSendEmails = () => {
    if (activeTab === 'weeklyProgress' && !validateFields()) { // Do not send emails if any field in 'Weekly Progress' tab is invalid
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
      return;
    }

    const htmlContent = `
    <div style="max-width: 900px; width: 100%; margin: auto;">
      ${emailContent}
    </div>
  `;
    dispatch(broadcastEmailsToAll('Weekly Update', htmlContent));
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
        <ImageUploader onFileUpload={handleHeaderImageDrop} />

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
        <ImageUploader onFileUpload={handleBodyImageDrop} />
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
            <button type="button" className="send-button" onClick={handleBroadcastEmails} style={darkMode ? boxStyleDark : boxStyle}>
              Broadcast Weekly Update
            </button>
          )
        }
        <button type="button" onClick={handlePreview}>
          Preview Email
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

