import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { SiImgur } from 'react-icons/si';
import { max, set } from 'lodash';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

function Announcements({ title, email }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [showEditor, setShowEditor] = useState(true); // State to control rendering of the editor

  const [toggleImgur, setToggleImgur] = useState(false);
  const [ImageFile, setImageFile] = useState(null);
  const [imgurTitle, setImgurTitle] = useState('');
  const [imgurDescription, setImgurDescription] = useState('');
  const [imgurTags, setImgurTags] = useState('');
  const [imgurFiles, setImgurFiles] = useState([]);
  const [imgurScheduleTime, setImgurScheduleTime] = useState('');
  const [imgurLoading, setImgurLoading] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [imgurError, setImgurError] = useState('');

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
    setImageFile(e.target.files[0]);
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

  const fetchImgurScheduledPosts = async () => {
    try {
      console.log('Fetching scheduled Imgur posts...');
    } catch (e) {
      console.error('Error fetching scheduled Imgur posts:', e);
    }
  };

  const handlePostToImgur = async () => {
    console.log('Posting to Imgur...');
    if (imgurFiles.length == 0) {
      setImgurError('Please upload an image file first');
      return;
    }

    setImgurLoading(true);
    setImgurError('');

    const formData = new FormData();
    formData.append('title', imgurTitle);
    formData.append('description', imgurDescription);
    formData.append('tags', imgurTags);

    if (imgurScheduleTime) {
      formData.append('scheduleTime', new Date(imgurScheduleTime).toISOString());
    }

    imgurFiles.forEach((file) => {
      formData.append('image', file);
    });

    try {
      const response = await axios.post(
        ENDPOINTS.POST_IMGUR,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      if (response.status === 200) {
        // reset form after successful post
        setImgurTitle('');
        setImgurDescription('');
        setImgurTags('');
        setImgurFiles([]);
        setImgurScheduleTime(null);

        if (imgurScheduleTime) {
          fetchImgurScheduledPosts();
        }

        toast.success('Image successfully posted to Imgur', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        setImgurError(response.data.message || 'Failed to post to Imgur');
        throw new Error(response.data.message || 'Failed to post to Imgur');
      }
    } catch (e) {
      console.error('Error posting image to Imgur:', e);
      setImgurError('Error posting image');
      toast.error('Error posting image', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setImgurLoading(false);
    }
  };

  const handleImgurFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImgurFiles(prevFiles => [...prevFiles, ...files]);
  }

  const handleRemoveImgurFile = (index) => {
    setImgurFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: "100%" }}>
      <div className="email-update-container">
        <div className="editor">
          {title ? (
            <h3> {title} </h3>
          )
            : (<h3>Weekly Progress Editor</h3>)
          }
          <button className="imgur-button" onClick={() => setToggleImgur(!toggleImgur)}>
            <SiImgur color={toggleImgur ? "green" : "gray"} opacity={toggleImgur ? 1 : 0.5} size="2em"/>
          </button>
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

          {/* Imgur post section */}
          {toggleImgur && (
            <div className={`${darkMode ? 'bg-oxford-blue text-light' : ''}`} style={{ minHeight: "100%" }}>
              <div className='imgur-post-container'>
                <h3>Post to Imgur</h3>

                {/* Imgur album title input */}
                <label htmlFor="imgur-content-input" className={darkMode ? 'text-light' : 'text-dark'}>
                  Post Title*
                </label>
                <input
                  type='text'
                  value={imgurTitle}
                  onChange={(e) => setImgurTitle(e.target.value)}
                  className='input-text-for-announcement'
                  required
                />

                {/* Imgur album description input */}
                <label htmlFor="imgur-content-input" className={darkMode ? 'text-light' : 'text-dark'}>
                  Post Description
                </label>
                <input
                  type='text'
                  value={imgurDescription}
                  onChange={(e) => setImgurDescription(e.target.value)}
                  className='input-text-for-announcement'
                />

                {/* Imgur album tags input */}
                <label htmlFor="imgur-content-input" className={darkMode ? 'text-light' : 'text-dark'}>
                  Post Tags
                </label>
                <input
                  type='text'
                  value={imgurTags}
                  onChange={(e) => setImgurTags(e.target.value)}
                  className='input-text-for-announcement'
                />

                {/* Imgur album image upload */}
                <label htmlFor="imgur-content-input" className={darkMode ? 'text-light' : 'text-dark'}>
                  Upload Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImgurFileChange}
                  className='input-file-upload'
                />

                {/* Imgur album image preview */}
                {imgurFiles.length > 0 && (
                  <div>
                    <h4>Preview:</h4>
                    <ul>
                      {imgurFiles.map((file, index) => (
                        <li key={index}>
                          {file.name}
                          <button 
                            type="button"
                            onClick={() => handleRemoveImgurFile(index)}
                            className='remove-imgur-file-button'
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* schedule post button */}
                <div className="mb-4">
                  <label className={`block mb-2 ${darkMode ? 'text-light' : 'text-dark'}`}>
                    Schedule Post (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={imgurScheduleTime}
                    onChange={(e) => setImgurScheduleTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    max={maxScheduleDate.toISOString().slice(0, 16)}
                    className="input-text-for-announcement"
                  />
                </div>

                {/* post to imgur button */}
                <button
                  type="button"
                  onClick={handlePostToImgur}
                  disabled={imgurLoading}
                  className="send-button"
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  {imgurLoading ? "Posting..." : imgurScheduleTime ? "Schedule Post" : "Posting to Imgur"}
                </button>

                {/* display scheduled posts */}
                {scheduledPosts.length > 0 && (
                  <div className="mt-4">
                    <h4 className={`mb-2 ${darkMode ? 'text-light' : ''}`}>Scheduled Imgur Posts</h4>
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
          )}

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
    </div>

  );
}

export default Announcements;

