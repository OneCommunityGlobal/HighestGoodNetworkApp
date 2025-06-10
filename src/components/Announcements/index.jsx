/* eslint-disable no-undef */
import axios from 'axios';
import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';

function Announcements({ title, email: initialEmail }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [showEditor, setShowEditor] = useState(true);
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState('');
  const [youtubeAccounts, setYoutubeAccounts] = useState([]);
  const [selectedYoutubeAccountId, setSelectedYoutubeAccountId] = useState('');
  const [showYoutubeDropdown, setShowYoutubeDropdown] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoTags, setVideoTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('private');
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  useEffect(() => {
    setShowEditor(false);
    setTimeout(() => setShowEditor(true), 0);
  }, [darkMode]);

  const editorInit = {
    license_key: 'gpl',
    selector: 'Editor#email-editor',
    height: 500,
    plugins: [
      'advlist autolink lists link image paste',
      'charmap print preview anchor help',
      'searchreplace visualblocks code',
      'insertdatetime media table paste wordcount',
    ],
    menubar: false,
    branding: false,
    image_title: true,
    automatic_uploads: true,
    file_picker_callback(cb) {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          const id = `blobid${new Date().getTime()}`;
          const { blobCache } = window.tinymce.activeEditor.editorUpload;
          const base64 = reader.result.split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    a11y_advanced_options: true,
    toolbar:
      'undo redo | bold italic | blocks fontfamily fontsize | image alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | help',
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };

  useEffect(() => {
    if (initialEmail) {
      const trimmedEmail = initialEmail.trim();
      setEmailTo(initialEmail);
      setEmailList(trimmedEmail.split(','));
    }
  }, [initialEmail]);

  const handleEmailListChange = e => {
    const { value } = e.target;
    setEmailTo(value);
    setEmailList(value.split(','));
  };

  const handleHeaderContentChange = e => {
    setHeaderContent(e.target.value);
  };

  const addHeaderToEmailContent = () => {
    if (!headerContent) return;
    const imageTag = `<img src="${headerContent}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
    const editor = window.tinymce.get('email-editor');
    if (editor) {
      editor.insertContent(imageTag);
      setEmailContent(editor.getContent());
    }
    setHeaderContent('');
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
    setIsFileUploaded(true);
    convertImageToBase64(imageFile, base64Image => {
      const imageTag = `<img src="${base64Image}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
      setHeaderContent(prevContent => `${imageTag}${prevContent}`);
      const editor = window.tinymce.get('email-editor');
      if (editor) {
        editor.insertContent(imageTag);
        setEmailContent(editor.getContent());
      }
    });
    e.target.value = '';
  };

  const validateEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSendEmails = () => {
    const htmlContent = emailContent;
    if (emailList.length === 0 || emailList.every(e => !e.trim())) {
      toast.error('Error: Empty Email List. Please enter AT LEAST One email.');
      return;
    }
    if (!isFileUploaded) {
      toast.error('Error: Please upload a file.');
      return;
    }
    const invalidEmails = emailList.filter(email => !validateEmail(email.trim()));
    if (invalidEmails.length > 0) {
      toast.error(`Error: Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }
    dispatch(
      sendEmail(emailList.join(','), title ? 'Anniversary congrats' : 'Weekly update', htmlContent),
    );
  };

  const handleBroadcastEmails = () => {
    const htmlContent = `
    <div style="max-width: 900px; width: 100%; margin: auto;">
      ${emailContent}
    </div>
  `;
    dispatch(broadcastEmailsToAll('Weekly Update', htmlContent));
  };

  const handleVideoChange = e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoURL(url);
    } else {
      setVideoFile(null);
      setVideoURL('');
      toast.error('Please select a valid video file');
    }
  };

  const oauthSignIn = () => {
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = {
      client_id: '79576137807-b7j4fsdm0u9pgorsohcq97gqsaglf7la.apps.googleusercontent.com',
      redirect_uri: 'http://localhost:3000/announcements',
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      include_granted_scopes: 'true',
      state: 'pass-through value',
    };
    const form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', oauth2Endpoint);
    Object.keys(params).forEach(p => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  useEffect(() => {
    fetch('/api/youtubeAccounts')
      .then(res => res.json())
      .then(data => setYoutubeAccounts(data))
      .catch(() => {});
  }, []);

  const handlePostVideoToYouTube = async () => {
    if (!videoFile || !selectedYoutubeAccountId) {
      toast.error('Please select a video and YouTube account');
      return;
    }
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('youtubeAccountId', selectedYoutubeAccountId);
    formData.append('title', videoTitle);
    formData.append('description', videoDescription);
    formData.append('tags', videoTags);
    formData.append('privacyStatus', privacyStatus);
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const res = await axios.post('http://localhost:4500/api/uploadYtVideo', formData, {
        headers,
      });
      if (res.status === 200) {
        toast.success('Video uploaded successfully!');
        setShowYoutubeDropdown(false);
        setSelectedYoutubeAccountId('');
      } else {
        toast.error('Video upload failed');
      }
    } catch (err) {
      toast.error('Upload error');
    }
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <div className="email-update-container">
        <div className="editor">
          {title ? <h3> {title} </h3> : <h3>Weekly Progress Editor</h3>}

          <br />
          {showEditor && (
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              id="email-editor"
              initialValue="<p>This is the initial content of the editor</p>"
              init={editorInit}
              onEditorChange={content => {
                setEmailContent(content);
              }}
            />
          )}
          {title ? (
            ''
          ) : (
            <div className="email-update-container">
              <div className="editor">
                <div className="email-list">
                  <input
                    type="text"
                    value={emailTo}
                    onChange={handleEmailListChange}
                    placeholder="Enter email addresses (comma-separated)"
                  />
                </div>
                <div className="header-image">
                  <input
                    type="text"
                    value={headerContent}
                    onChange={handleHeaderContentChange}
                    placeholder="Enter header image URL"
                  />
                  <button type="button" onClick={addHeaderToEmailContent}>
                    Add Header
                  </button>
                </div>
                <div className="file-upload">
                  <input type="file" onChange={addImageToEmailContent} />
                </div>
                <div className="send-buttons">
                  <button type="button" onClick={handleSendEmails}>
                    Send Emails
                  </button>
                  <button type="button" onClick={handleBroadcastEmails}>
                    Broadcast to All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          className={`emails ${darkMode ? 'bg-yinmn-blue' : ''}`}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          {title ? (
            <p>Email</p>
          ) : (
            <label htmlFor="email-list-input" className={darkMode ? 'text-light' : 'text-dark'}>
              Email List (comma-separated)<span className="red-asterisk">* </span>:
            </label>
          )}
          <input
            type="text"
            value={emailTo}
            id="email-list-input"
            onChange={handleEmailListChange}
            className={`input-text-for-announcement ${
              darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
            }`}
          />
          <button
            type="button"
            className="send-button"
            onClick={handleSendEmails}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            {title ? 'Send Email' : 'Send mail to specific users'}
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
            className={`input-text-for-announcement ${
              darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
            }`}
          />
          <button
            type="button"
            className="send-button"
            onClick={addHeaderToEmailContent}
            style={darkMode ? boxStyleDark : boxStyle}
          >
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
      <div className="social-media-container">
        <div className="social-media">
          {title ? <h3>{title}</h3> : <h3>Social Media Post</h3>}
          {title ? null : (
            <label htmlFor="social-media-list" className={darkMode ? 'text-light' : 'text-dark'}>
              Click on below social media to post
            </label>
          )}

          {title ? null : (
            <div
              className="social-buttons-container"
              style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
            >
              <button
                type="button"
                className="send-button"
                onClick={oauthSignIn}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Sign in with Google
              </button>
              <button
                type="button"
                className="send-button"
                onClick={() => setShowYoutubeDropdown(true)}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Post video to YouTube channel
              </button>
              {showYoutubeDropdown && (
                <>
                  <select
                    className="select-youtube-account"
                    value={selectedYoutubeAccountId}
                    onChange={e => setSelectedYoutubeAccountId(e.target.value)}
                  >
                    <option value="">Select YouTube Account</option>
                    <option value="test1">Test Channel 1</option>
                    <option value="test2">Test Channel 2</option>
                    {youtubeAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.displayName || acc.name || acc.clientId}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="send-button"
                    disabled={!videoFile || !selectedYoutubeAccountId}
                    onClick={handlePostVideoToYouTube}
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="send-button"
                    onClick={() => setShowYoutubeDropdown(false)}
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="video-preview-container">
          <input type="file" accept="video/*" onChange={handleVideoChange} />
          <input
            type="text"
            placeholder="Video Title"
            value={videoTitle}
            onChange={e => setVideoTitle(e.target.value)}
            style={{ marginTop: 10, width: '100%', padding: 8 }}
          />
          <input
            type="text"
            placeholder="Video Description"
            value={videoDescription}
            onChange={e => setVideoDescription(e.target.value)}
            style={{ marginTop: 10, width: '100%', padding: 8 }}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={videoTags}
            onChange={e => setVideoTags(e.target.value)}
            style={{ marginTop: 10, width: '100%', padding: 8 }}
          />
          <select
            value={privacyStatus}
            onChange={e => setPrivacyStatus(e.target.value)}
            style={{ marginTop: 10, width: '100%', padding: 8 }}
          >
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
          </select>
          {videoURL && (
            <div>
              <video width="480" controls aria-label="Video Preview">
                <source src={videoURL} type={videoFile.type} />
                <track kind="captions" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Announcements;
