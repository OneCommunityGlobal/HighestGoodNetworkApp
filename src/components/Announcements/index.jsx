import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { ReactComponent as ImgurIcon } from '../../assets/images/SocialMediaIcons/ImgurIcon.svg';
import { 
  handlePostToImgur, 
  fetchImgurScheduledPosts, 
  handleImgurFileChange, 
  handleRemoveImgurFile,
  handleRemoveScheduledPost, 
  // deleteScheduledPost 
} from './ImgurPostDetails';
import { BiTrash } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';


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
  const [fillingPost, setFillingPost] = useState(false);
  const [scheduleCalendar, setScheduleCalendar] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  

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

  useEffect(() => {
    if (imgurTitle || imgurTopic || imgurTags || imgurFiles.length > 0) {
      setFillingPost(true);
    } else {
      setFillingPost(false);
    }
  }, [imgurTitle, imgurTopic, imgurTags, imgurFiles]);


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

  const generateRandomGradient = () => {
    const colors = [
      '#1a237e', '#0d47a1', '#b71c1c', '#880e4f', '#4a148c', '#311b92',
      '#1b5e20', '#004d40', '#bf360c', '#3e2723', '#263238', '#212121'
    ];
    const randomColor1 = colors[Math.floor(Math.random() * colors.length)];
    const randomColor2 = colors[Math.floor(Math.random() * colors.length)];
    return `linear-gradient(45deg, ${randomColor1}, ${randomColor2})`;
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
              <div className='imgur-post-container'>  
                
                <div className="imgur-post-details-container">
                  <h3>Post Details</h3>


                  {/* Imgur album title input */}
                  <div className="imgur-post-title">
                    <label htmlFor="imgur-content-input" className={`imgur-post-details-gap ${darkMode ? 'text-light' : 'text-dark'}`}>
                      <p>Post Title*</p>
                      <FontAwesomeIcon
                          className="team-member-task-info"
                          icon={faInfoCircle}
                          title="The title can consist of a maximum of 60 characters, and can contain any characters except for emojis"
                          color={darkMode ? 'lightgray' : ''}
                      />
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
                    <label htmlFor="imgur-content-input" className={`imgur-post-details-gap ${darkMode ? 'text-light' : 'text-dark'}`}>
                      <p>Post Topic*</p>
                      <FontAwesomeIcon
                          className="team-member-task-info"
                          icon={faInfoCircle}
                          title="The topic can consist of a maximum of 60 characters, and can contain any characters except for emojis"
                          color={darkMode ? 'lightgray' : ''}
                      />
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
                    <label htmlFor="imgur-content-input" className={`imgur-post-details-gap ${darkMode ? 'text-light' : 'text-dark'}`}>
                      <p>Post Tags</p>
                      <FontAwesomeIcon
                          className="team-member-task-info"
                          icon={faInfoCircle}
                          title="The tags can consist of a maximum of 60 characters, can contain any characters except for emojis, and must be separated by commas (e.g. 'tag1, tag2, tag3')"
                          color={darkMode ? 'lightgray' : ''}
                      />
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

                  {/* Imgur error message */}
                  {imgurError && <div className="alert alert-danger m-2">{imgurError}</div>}

                  

                  {/* post to imgur buttons */}
                  <div className="imgur-post-button-container">
                    <button
                      type="button"
                      onClick={async () => {     
                        setImgurLoading(true);               
                        await handlePostToImgur({
                          imgurTitle,
                          imgurTags,
                          imgurFiles,
                          imgurScheduleTime,
                          imgurFileDescriptions,
                          imgurTopic,
                          setImgurError,
                        });
                        setFillingPost(false);
                        fetchImgurScheduledPosts(setScheduledPosts, setImgurError);

                        // reset form
                        setImgurTitle('');
                        setImgurTags('');
                        setImgurFiles([]);
                        setImgurFileDescriptions([]);
                        setImgurScheduleTime('');
                        setImgurTopic('');

                        setImgurLoading(false);
                      }}
                      disabled={imgurLoading}
                      className="imgur-post-button"
                      style={darkMode ? boxStyleDark : boxStyle}
                    >
                      {imgurLoading ? "Posting..." : "Post Now"}
                    </button>
                    {/* schedule post button */}
                    <div className='imgur-schedule-container'>
                      <input
                        type="datetime-local"
                        value={imgurScheduleTime}
                        onChange={(e) => {
                          setImgurScheduleTime(e.target.value)
                        }}
                        min={startOfToday.toISOString().slice(0, 16)}
                        max={maxScheduleDate.toISOString().slice(0, 16)}
                        className="input-text-for-announcement"
                      />
                      {imgurScheduleTime &&
                        <div className="imgur-schedule-buttons">
                          <button
                            type="button"
                            onClick={() => setImgurScheduleTime('')}
                            className="imgur-post-button"
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            <BiTrash />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setImgurLoading(true);               
                              await handlePostToImgur({
                                imgurTitle,
                                imgurTags,
                                imgurFiles,
                                imgurScheduleTime,
                                imgurFileDescriptions,
                                imgurTopic,
                                setImgurError,
                              });
                              setFillingPost(false);
                              fetchImgurScheduledPosts(setScheduledPosts, setImgurError);

                              // reset form
                              setImgurTitle('');
                              setImgurTags('');
                              setImgurFiles([]);
                              setImgurFileDescriptions([]);
                              setImgurScheduleTime('');
                              setImgurTopic('');

                              setImgurLoading(false);
                              }}
                            className="imgur-post-button"
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            Schedule
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                {/* display preview of current post */}
                <div className='imgur-preview-container'>
                  {fillingPost ? (
                    <div>
                      <h3>Post Preview:</h3>
                      <div className='imgur-preview-card'>
                        {/* title */}
                        <h4>{imgurTitle ? imgurTitle : (
                          <span className='imgur-preview-warning'>*Title Missing*</span>
                        )}</h4>

                        {/* files */}
                        <div className='imgur-preview-images-container'>
                          {imgurFiles.length > 0 ? (
                            imgurFiles.map((file, index) => (
                              <div className='imgur-preview-image-card'>
                                <div key={`${file.name}-${index}`} className='imgur-preview-image-background'>
                                  <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className='imgur-preview-image' />
                                  <button
                                    type="button"
                                    className="imgur-preview-remove-button"
                                  >
                                    <BiTrash onClick={() => handleRemoveImgurFile(index, setImgurFiles, setImgurFileDescriptions)} />
                                  </button>
                                </div>
                                <input 
                                  key={`${file.name}-desc-${index}`}
                                  className='imgur-preview-description'
                                  type='text'
                                  placeholder='Input description for image'
                                  value={imgurFileDescriptions[index]}
                                  onChange={(e) => {
                                    const newDescriptions = [...imgurFileDescriptions];
                                    newDescriptions[index] = e.target.value;
                                    setImgurFileDescriptions(newDescriptions);
                                  }}
                                />
                            </div>
                            ))
                          ) : (
                            <div className='imgur-preview-warning'>*No images uploaded*</div>
                          )}
                          
                        </div>

                        {/* tags */}
                        <div>
                          {imgurTags ? imgurTags.split(',').filter(tag => tag.trim() !== '').map((tag, index) => (
                            <span 
                              key={index} 
                              className="imgur-preview-container-tags" 
                              style={{ background: generateRandomGradient() }}
                            >
                              {tag.trim()}
                            </span>
                          )) : ""}
                        </div>
                      </div>
                    </div>
                    ) : (
                      <div className="imgur-scheduled-posts-container">
                      <h3>Scheduled Posts:</h3>
                      {scheduledPosts.length === 0 && <p>No scheduled posts</p>}
                      {scheduledPosts.length > 0 && (
                        <div className="imgur-scheduled-posts-card-container">
                          {scheduledPosts
                            .sort((a, b) => new Date(a.scheduleTime) - new Date(b.scheduleTime))
                            .map((post, index) => (
                            <div key={index} className="imgur-scheduled-post-card">
                              <div className='imgur-scheduled-post-header'>
                                <h5>{new Date(post.scheduleTime).toLocaleString()}</h5>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    handleRemoveScheduledPost(post.jobId, setScheduledPosts, setImgurError)
                                    fetchImgurScheduledPosts(setScheduledPosts, setImgurError);
                                  }}
                                  className="delete-button"
                                >
                                  <BiTrash />
                                </button>
                              </div>
                              <p>{post.title}</p>
                              <div className="imgur-scheduled-post-files-container">
                                {post.files.map((file, fileIndex) => (
                                  <div key={fileIndex} className="imgur-scheduled-post-file">
                                    <h1>{file.originalName}</h1>
                                    <p>{file.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                    
                </div>
                    
                {/* display scheduled posts */}
                {fillingPost &&
                  <div className="imgur-scheduled-posts-container">
                    <h3>Scheduled Posts:</h3>
                    {scheduledPosts.length === 0 && <p>No scheduled posts</p>}
                    {scheduledPosts.length > 0 && (
                      <div className="imgur-scheduled-posts-card-container">
                        {scheduledPosts
                          .sort((a, b) => new Date(a.scheduleTime) - new Date(b.scheduleTime))
                          .map((post, index) => (
                          <div key={index} className="imgur-scheduled-post-card">
                            <div className='imgur-scheduled-post-header'>
                              <h5>{new Date(post.scheduleTime).toLocaleString()}</h5>
                              <button
                                type="button"
                                onClick={async () => {
                                  handleRemoveScheduledPost(post.jobId, setScheduledPosts, setImgurError)
                                  fetchImgurScheduledPosts(setScheduledPosts, setImgurError);
                                }}
                                className="delete-button"
                              >
                                <BiTrash />
                              </button>
                            </div>
                            <p>{post.title}</p>
                            <div className="imgur-scheduled-post-files-container">
                              {post.files.map((file, fileIndex) => (
                                <div key={fileIndex} className="imgur-scheduled-post-file">
                                  <h1>{file.originalName}</h1>
                                  <p>{file.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                }
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

