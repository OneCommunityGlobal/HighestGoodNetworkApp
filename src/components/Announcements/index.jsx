import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';

function Announcements({title, email}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [showEditor, setShowEditor] = useState(true);

  // Reddit-related states
  const [redditTitle, setRedditTitle] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [redditMediaFiles, setRedditMediaFiles] = useState([]);
  const [redditScheduleTime, setRedditScheduleTime] = useState('');
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [redditLoading, setRedditLoading] = useState(false);
  const [redditError, setRedditError] = useState('');

  // Calculate max schedule date (6 months from now)
  const maxScheduleDate = new Date();
  maxScheduleDate.setMonth(maxScheduleDate.getMonth() + 6);

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

      input.onchange = function() {
        const file = this.files[0];

        const reader = new FileReader();
        reader.onload = function() {
          const id = `blobid${new Date().getTime()}`;
          const { blobCache } = tinymce.activeEditor.editorUpload;
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

  const handleEmailListChange = e => {
    const emails = e.target.value.split(',');
    setEmailList(emails);
  };

  const handleHeaderContentChange = e => {
    setHeaderContent(e.target.value);
  }

  const addHeaderToEmailContent = () => {
    if (!headerContent) return;
    const imageTag = `<img src="${headerContent}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
      const editor = tinymce.get('email-editor');
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
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSendEmails = () => {
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
    const htmlContent = `
    <div style="max-width: 900px; width: 100%; margin: auto;">
      ${emailContent}
    </div>
  `;
    dispatch(broadcastEmailsToAll('Weekly Update', htmlContent));
  };

  // Reddit-related handlers
  const handleRedditFileChange = (e) => {
    // Handle file selection for Reddit posts
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValid = file.size <= 200 * 1024 * 1024; // 200MB limit
      if (!isValid) {
        setRedditError(`File ${file.name} exceeds 200MB limit`);
      }
      return isValid;
    });
    setRedditMediaFiles(prevFiles => [...prevFiles, ...validFiles].slice(0, 9)); // Max 9 files
  };

  const handleRemoveRedditFile = (index) => {
    // Remove a file from the Reddit media files list
    setRedditMediaFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const fetchScheduledPosts = async () => {
    // Fetch all scheduled Reddit posts
    try {
      const response = await fetch('/api/scheduledPosts');
      const data = await response.json();
      if (response.ok) {
        setScheduledPosts(data.scheduledPosts);
      }
    } catch (err) {
      console.error('Failed to fetch scheduled posts:', err);
    }
  };

  const handleRedditPost = async () => {
    // Handle Reddit post submission
    if (!redditTitle || !subreddit) {
      setRedditError('Title and subreddit are required');
      return;
    }

    setRedditLoading(true);
    setRedditError('');

    try {
      const formData = new FormData();
      formData.append('title', redditTitle);
      formData.append('content', emailContent);
      formData.append('subreddit', subreddit);
      
      if (redditScheduleTime) {
        formData.append('scheduleTime', new Date(redditScheduleTime).toISOString());
      }
      
      redditMediaFiles.forEach(file => {
        formData.append('media', file);
      });

      const response = await fetch('/api/postToReddit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to post to Reddit');
      }

      // Reset form after successful submission
      setRedditTitle('');
      setSubreddit('');
      setRedditScheduleTime('');
      setRedditMediaFiles([]);
      toast.success('Successfully posted to Reddit!');
      
      // Update scheduled posts list if needed
      if (redditScheduleTime) {
        fetchScheduledPosts();
      }
    } catch (err) {
      setRedditError(err.message);
      toast.error('Failed to post to Reddit: ' + err.message);
    } finally {
      setRedditLoading(false);
    }
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{minHeight: "100%"}}>
      <div className="email-update-container">
        <div className="editor">
          { title ? (
            <h3> {title} </h3>
          )
           :( <h3>Weekly Progress Editor</h3>)
          }

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

        {/* Reddit Post Section */}
        <div className="reddit-post-section mt-8">
          <h3 className={darkMode ? 'text-light' : ''}>Post to Reddit</h3>
          <div className={`reddit-form ${darkMode ? 'bg-yinmn-blue' : ''}`} style={darkMode ? boxStyleDark : boxStyle}>
            {/* Title input */}
            <div className="mb-4">
              <label className={`block mb-2 ${darkMode ? 'text-light' : 'text-dark'}`}>
                Post Title*
              </label>
              <input
                type="text"
                value={redditTitle}
                onChange={(e) => setRedditTitle(e.target.value)}
                className="input-text-for-announcement"
                required
              />
            </div>

            {/* Subreddit input */}
            <div className="mb-4">
              <label className={`block mb-2 ${darkMode ? 'text-light' : 'text-dark'}`}>
                Subreddit*
              </label>
              <input
                type="text"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="input-text-for-announcement"
                placeholder="e.g., programming"
                required
              />
            </div>

            {/* Media upload */}
            <div className="mb-4">
              <label className={`block mb-2 ${darkMode ? 'text-light' : 'text-dark'}`}>
                Media Files (Max 9 files, 200MB each)
              </label>
              <input
                type="file"
                onChange={handleRedditFileChange}
                multiple
                accept="image/*,video/*"
                className="input-file-upload"
              />
              {/* Display selected files */}
              <div className="mt-2">
                {redditMediaFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 mb-2" style={darkMode ? boxStyleDark : boxStyle}>
                    <span className={darkMode ? 'text-light' : ''}>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRedditFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule datetime */}
            <div className="mb-4">
              <label className={`block mb-2 ${darkMode ? 'text-light' : 'text-dark'}`}>
                Schedule Post (Optional)
              </label>
              <input
                type="datetime-local"
                value={redditScheduleTime}
                onChange={(e) => setRedditScheduleTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                max={maxScheduleDate.toISOString().slice(0, 16)}
                className="input-text-for-announcement"
              />
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleRedditPost}
              disabled={redditLoading}
              className="send-button"
              style={darkMode ? boxStyleDark : boxStyle}
            >
              {redditLoading ? 'Posting...' : redditScheduleTime ? 'Schedule Reddit Post' : 'Post to Reddit Now'}
            </button>

            {/* Error message */}
            {redditError && (
              <div className="p-2 mt-2 text-red-500 bg-red-50 rounded">
                {redditError}
              </div>
            )}
          </div>

          {/* Display scheduled posts */}
          {scheduledPosts.length > 0 && (
            <div className="mt-4">
              <h4 className={`mb-2 ${darkMode ? 'text-light' : ''}`}>Scheduled Reddit Posts</h4>
              <div className="space-y-2">
                {scheduledPosts.map((post) => (
                  <div 
                    key={post.jobId} 
                    className="p-3 rounded"
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    <h5 className={`font-medium ${darkMode ? 'text-light' : ''}`}>{post.title}</h5>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Subreddit: r/{post.subreddit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        </div>
        <div className={`emails ${darkMode ? 'bg-yinmn-blue' : ''}`}  style={darkMode ? boxStyleDark : boxStyle}>
          {
            title ? (
              <p>Email</p>
            ) : (
             
               <label htmlFor="email-list-input" className={darkMode ? 'text-light' : 'text-dark'}>
                 Email List (comma-separated):
               </label>
            )
          }
          <input type="text" value= {emailTo} id="email-list-input" onChange={ handleEmailListChange} className='input-text-for-announcement' />

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
        </div>
      
  );
}

export default Announcements;