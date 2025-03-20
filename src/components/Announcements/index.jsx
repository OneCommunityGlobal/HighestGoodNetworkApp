import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { SiImgur } from 'react-icons/si';
import { ReactComponent as ImgurIcon } from '../../assets/images/SocialMediaIcons/ImgurIcon.svg';
import { 
  handlePostToImgur, 
  fetchImgurScheduledPosts, 
  handleImgurFileChange, 
  handleRemoveImgurFile, 
  // deleteScheduledPost 
} from './ImgurPostDetails';
import { set } from 'lodash';
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
  const [ImageFile, setImageFile] = useState(null);

  const [toggleImgur, setToggleImgur] = useState(false);
  const [imgurTitle, setImgurTitle] = useState('');
  const [imgurTopic, setImgurTopic] = useState('');
  const [imgurTags, setImgurTags] = useState('');
  const [imgurFiles, setImgurFiles] = useState([]);
  const [imgurFileDescriptions, setImgurFileDescriptions] = useState([]);
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

  useEffect(() => {
    const rootElement = document.documentElement;
    if (toggleImgur) {
      rootElement.classList.remove('toggle-off')
    } else {
      rootElement.classList.add('toggle-off')
    }
  }, [toggleImgur]);

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

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: "100%" }}>
      <div className="email-update-container">
        <div className="editor">
          {title ? (
            <div className='title-container'>
              <h3>{title}</h3>
              <button className="imgur-button" onClick={() => {
                setToggleImgur(!toggleImgur);
                fetchImgurScheduledPosts(setScheduledPosts, setImgurError);
                }}>
                <ImgurIcon width="3em" height="3em" />
              </button>
            </div>
          )
            : (
              <div className='title-container'>
                <h3>Weekly Progress Editor</h3>
                <button className="imgur-button" onClick={() => {
                  setToggleImgur(!toggleImgur);
                  fetchImgurScheduledPosts(setScheduledPosts, setImgurError);
                  }}>
                  <ImgurIcon width="3em" height="3em" />
                </button>
              </div>
              
            )
          }
          
          <br />
          
          {showEditor && !toggleImgur && <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            id="email-editor"
            initialValue="<p>This is the initial content of the editor</p>"
            init={editorInit}
            onEditorChange={(content, editor) => {
              setEmailContent(content);
            }}
          />}
          {
            toggleImgur || title ? (
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
              <h3>Post to Imgur</h3>
              <div className='imgur-post-container'>
                

                
                <div className="imgur-post-details">
                  {/* Imgur album title input */}
                  <div className="imgur-post-title">
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
                  </div>

                  {/* Imgur gallery topic input */}
                  <div className="imgur-post-topic">
                    <label htmlFor="imgur-content-input" className={darkMode ? 'text-light' : 'text-dark'}>
                      Post Topic*
                    </label>
                    <input
                      type='text'
                      value={imgurTopic}
                      onChange={(e) => setImgurTopic(e.target.value)}
                      className='input-text-for-announcement'
                      required
                    />
                  </div>

                  {/* Imgur album tags input */}
                  <div className="imgur-post-tags">
                    <label htmlFor="imgur-content-input" className={darkMode ? 'text-light' : 'text-dark'}>
                      Post Tags
                    </label>
                    <input
                      type='text'
                      value={imgurTags}
                      onChange={(e) => setImgurTags(e.target.value)}
                      className='input-text-for-announcement'
                    />
                  </div>

                  {/* Imgur album image upload */}
                  <div className="imgur-post-upload">
                    <label htmlFor="imgur-content-input" className={darkMode ? 'text-light' : 'text-dark'}>
                      Upload Images
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImgurFileChange(e, setImgurFiles, setImgurFileDescriptions)}
                      className='input-file-upload'
                    />
                  </div>

                  {/* Imgur album image preview */}
                  <div className="imgur-preview">
                    {imgurFiles.length > 0 && (
                      <div>
                        <h4>Preview:</h4>
                        <div className='imgur-preview-cards-container'>
                          {imgurFiles.map((file, index) => (
                            <div key={index} className='imgur-preview-card'>
                              <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className='imgur-preview-image' />
                              <Editor
                                tinymceScriptSrc="/tinymce/tinymce.min.js"
                                id={`imgur-description-editor-${index}`}
                                initialValue="description"
                                init={{
                                  height: 100,
                                  menubar: false,
                                  branding: false,
                                  toolbar: false,
                                  skin: darkMode ? 'oxide-dark' : 'oxide',
                                  content_css: darkMode ? 'dark' : 'default',
                                }}
                                onEditorChange={(content) => {
                                  const newDescriptions = [...imgurFileDescriptions];
                                  newDescriptions[index] = content;
                                  setImgurFileDescriptions(newDescriptions);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImgurFile(index, setImgurFiles, setImgurFileDescriptions)}
                                className='imgur-preview-remove-button'
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Imgur error message */}
                  {imgurError && <div className="alert alert-danger m-2">{imgurError}</div>}

                  {/* schedule post button */}
                  <div className='imgur-schedule'>
                    <label className={`block mb-2 ${darkMode ? 'text-light' : 'text-dark'}`}>
                      Schedule Post (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={imgurScheduleTime}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setImgurScheduleTime(e.target.value)
                      }}
                      min={startOfToday.toISOString().slice(0, 16)}
                      max={maxScheduleDate.toISOString().slice(0, 16)}
                      className="input-text-for-announcement"
                    />
                  </div>

                  {/* post to imgur button */}
                  <div className="imgur-post-button">
                    <button
                      type="button"
                      onClick={async () => {                    
                        await handlePostToImgur({
                          imgurTitle,
                          imgurTags,
                          imgurFiles,
                          imgurScheduleTime,
                          imgurFileDescriptions,
                          imgurTopic,
                          setImgurLoading,
                          setImgurError,
                          setImgurTitle,
                          setImgurTags,
                          setImgurFiles,
                          setImgurTopic,
                          setImgurScheduleTime,
                          setImgurFileDescriptions,
                        });
                      fetchImgurScheduledPosts(setScheduledPosts, setImgurError);
                      }}
                      disabled={imgurLoading}
                      className="send-button"
                      style={darkMode ? boxStyleDark : boxStyle}
                    >
                      {imgurLoading ? "Posting..." : imgurScheduleTime ? "Schedule Post" : "Posting to Imgur"}
                    </button>
                  </div>
                </div>
                    
                {/* display scheduled posts */}
                <div className="scheduled-posts">
                  <h4>Scheduled Posts:</h4>
                  {scheduledPosts.length === 0 && <p>No scheduled posts</p>}
                  {scheduledPosts.length > 0 && (
                    <div className="scheduled-posts-container">
                      {scheduledPosts.map((post, index) => (
                        <div key={index} className="scheduled-post-card">
                        <h5>{post.title}</h5>
                        <p>Scheduled Time: {new Date(post.scheduleTime).toLocaleString()}</p>
                        <div className="scheduled-post-files">
                          {post.files.map((file, fileIndex) => (
                            <div key={fileIndex} className="scheduled-post-file">
                              <p>File: {file.originalname}</p>
                              {/* <img
                                src={`data:${file.mimetype};base64,${Buffer.from(file.buffer.data).toString('base64')}`}
                                alt={`Preview ${fileIndex}`}
                                className="scheduled-post-image"
                              /> */}
                              {/* <div dangerouslySetInnerHTML={{ __html: post.description[fileIndex] }} /> */}
                            </div>
                          ))}
                        </div>
                          {/* <button
                            type="button"
                            onClick={() => deleteScheduledPost(post.jobId, setScheduledPosts, setImgurError)}
                            className="delete-button"
                          >
                            Delete
                          </button> */}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
        {!toggleImgur && <div className={`emails ${darkMode ? 'bg-yinmn-blue' : ''}`} style={darkMode ? boxStyleDark : boxStyle}>
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

        </div>}
      </div>
    </div>

  );
}

export default Announcements;

