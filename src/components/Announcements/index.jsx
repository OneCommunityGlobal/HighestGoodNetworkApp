import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import { sendTweet, scheduleTweet, fetchPosts, deletePost } from '../../actions/sendSocialMediaPosts';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import {
  Label,
  Input,
  Button
} from 'reactstrap';

function Announcements({title, email}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');

  const [dateContent, setDateContent] = useState('');
  const [timeContent, setTimeContent] = useState('');
  const [errors, setErrors] = useState({});

  const [headerContent, setHeaderContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [showEditor, setShowEditor] = useState(true); // State to control rendering of the editor

  const [posts, setPosts] = useState([]);

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

      input.onchange = function() {
        const file = this.files[0];

        const reader = new FileReader();
        reader.onload = function() {
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

  useEffect(() => {
    getAllPosts();
  }, []);

  const getAllPosts = async () => {
    const data = await fetchPosts(); // Call API
    setPosts(data); // Set state with fetched posts
  };

  const handleEmailListChange = e => {
    const emails = e.target.value.split(',');
    setEmailList(emails);
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

  const handlePostTweets = () => {
    const htmlContent = `${emailContent}`;
    dispatch(sendTweet(htmlContent));
  };

 // For instantly posting scheduled Tweets and deleting the post after posting
 const handlePostScheduledTweets = (postId, textContent) => {
  console.log("Post ID:", postId, "Content:", textContent);

  if (!postId) {
    console.error("Error: Missing post ID in handlePostScheduledTweets");
    toast.error("Error: Missing post ID");
    return;
  }

  if (!textContent) {
    console.error("Error: Missing text content in handlePostScheduledTweets");
    toast.error("Error: Missing tweet content");
    return;
  }

  console.log("Posting Tweet:", textContent);

  dispatch(sendTweet(textContent))
    .then(() => {
      console.log("Tweet posted successfully! Now calling handleDeletePost for post ID:", postId);

      // ✅ Call handleDeletePost after successful tweet
      handleDeletePost(postId, true);
    })
    .catch((error) => {
      console.error("Error posting tweet:", error.message || error);
      toast.error("Failed to post tweet.");
    });
};


  
  const handleScheduleTweets = async () => {
    const htmlContent = `${emailContent}`;
    const scheduleDate = `${dateContent}`;
    const scheduleTime = `${timeContent}`;

     // Combine date and time into a single Date object
  const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
  const currentDateTime = new Date();
  
  // Validate that the scheduled date and time are in the future
  if (scheduledDateTime <= currentDateTime) {
    alert("The selected date and time must be greater than the current date and time.");
    return; // Stop execution if validation fails
  }

    dispatch(scheduleTweet(scheduleDate, scheduleTime, htmlContent));
    await getAllPosts();
  };

  const handleDateContentChange = e => {
    setDateContent(e.target.value);    
  }  

  const handleDeletePost = async (postId, skipConfirm = false) => {
    if (!skipConfirm) {
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (!confirmDelete) return;
    }

    try {
      const result = await deletePost(postId);
      if (result) {
        toast.success("Post deleted successfully!");
        setPosts((prevPosts) => prevPosts.filter(post => post._id !== postId));
      } else {
        toast.error("Failed to delete post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error deleting post.");
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
          <div inline className="mb-2">              
            <Label for="dateOfWork">
                Date
              </Label>
              <Input
                className="responsive-font-size"
                type="date"
                name="dateOfWork"
                id="dateOfWork"
                value={dateContent}
                onChange={handleDateContentChange}
              />
              {'dateOfWork' in errors && (
                <div className="text-danger">
                  <small>{errors.dateOfWork}</small>
                </div>
              )}</div>
          <div inline className="mb-2">
            <Label for="timeOfWork">
              Time
            </Label>
            <Input
              className="responsive-font-size"
              type="time"
              name="timeOfWork"
              id="timeOfWork"
              value={timeContent}
              onChange={e => setTimeContent(e.target.value)}
            />
            {'timeOfWork' in errors && (
              <div className="text-danger">
                <small>{errors.timeOfWork}</small>
              </div>
            )}
          

          </div>
          {showEditor && (
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              id="email-editor"
              initialValue={`<div style="background-color: #f0f0f0; color: #555; padding: 6px; border-radius: 4px; font-size: 14px;">
                Post limited to 280 characters
              </div>`}
              init={editorInit}
              onEditorChange={(content, editor) => {
                setEmailContent(content);
              }}
            />
          )}

                  {
          title ? (
            ""
          ) : (
          <div>
          <button type="button" className="send-button mr-1 ml-1" onClick={handlePostTweets} style={darkMode ? boxStyleDark : boxStyle}>
            Post Tweet
          </button>
          <button type="button" className="send-button mr-1 ml-1" onClick={handleScheduleTweets} style={darkMode ? boxStyleDark : boxStyle}>
            Schedule Tweet
          </button>
          <button type="button" className="send-button mr-1 ml-1" onClick={handleBroadcastEmails} style={darkMode ? boxStyleDark : boxStyle}>
            Broadcast Weekly Update
          </button>
          </div>
          )
        }
        <br />
        <br />
        
        <div>
          <h2>Scheduled Posts</h2>
          <ul>
            {posts.map((post) => (
              <li key={post._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Link 
                    to={`/socialMediaPosts/${post._id}`} 
                    title="View Post"
                    style={{
                      color: '#007BFF',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      marginRight: '10px',
                    }}
                  >
                    {/* {post.textContent.length > 50
                      ? post.textContent.slice(0, 50) + '...'
                      : post.textContent} */}
                    {post.textContent}
                  </Link> 
                  <br />
                  <em>Date:</em> {post.scheduledDate} 
                  <em>   Time:</em> {post.scheduledTime} <br />
                  {/* <em>X:</em> {post.platform} <br /> */}
                </div>
                {/* <Button color="danger" size="sm" onClick={() => handleDeletePost(post._id)}>
                  Delete
                </Button> */}

                {/* ✅ Checkmark Button (Mark as Done) */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}> 
                  <button onClick={() => handlePostScheduledTweets(post._id, post.textContent)} className="checkmark-button" aria-label="Mark as Done">
                    <svg aria-labelledby="svg-inline--fa-title-eXMNzFHMmi8K"
                    data-prefix="fas"
                    data-icon="check"
                    className="svg-inline--fa fa-check fa-w-16 team-member-tasks-done"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    style={{ width: '20px', height: '20px', fill: 'green'}}>
                  <path
                    fill="currentColor"
                    d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
                  >

                  </path>

                    </svg>
                  </button>

                  <button onClick={() => handleDeletePost(post._id)} className="delete-button" aria-label="Remove User from Task">
                    <svg
                  aria-labelledby="svg-inline--fa-title-tc2KtQNsHP5F"
                  data-prefix="fas"
                  data-icon="times"
                  className="svg-inline--fa fa-times fa-w-11 team-member-task-remove"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 352 512"
                  data-testid="Xmark-add test 1 testb"
                >
                  <title id="svg-inline--fa-title-tc2KtQNsHP5F">Remove User from Task</title>
                  <path
                    fill="currentColor"
                    d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
                  ></path>
                </svg>
                  </button>
                </div>

                {/* <button
                  onClick={() => handlePostTweets(post._id)}
                  className="checkmark-button"
                  aria-label="Mark as Done"
                  // style={{ marginRight: '5px' }} // ✅ Reduced margin
                >
                  <svg
                    aria-labelledby="svg-inline--fa-title-eXMNzFHMmi8K"
                    data-prefix="fas"
                    data-icon="check"
                    className="svg-inline--fa fa-check fa-w-16 team-member-tasks-done"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    style={{ width: '20px', height: '20px', fill: 'green'}}
                  >
                    <title id="svg-inline--fa-title-eXMNzFHMmi8K">Mark as Done</title>
                    <path
                      fill="currentColor"
                      d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
                    ></path>
                  </svg>
                </button>


                <button
                onClick={() => handleDeletePost(post._id)}
                className="delete-button"
                aria-label="Remove User from Task"
              >
                <svg
                  aria-labelledby="svg-inline--fa-title-tc2KtQNsHP5F"
                  data-prefix="fas"
                  data-icon="times"
                  className="svg-inline--fa fa-times fa-w-11 team-member-task-remove"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 352 512"
                  data-testid="Xmark-add test 1 testb"
                >
                  <title id="svg-inline--fa-title-tc2KtQNsHP5F">Remove User from Task</title>
                  <path
                    fill="currentColor"
                    d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
                  ></path>
                </svg>
              </button> */}
              </li>
            ))}
          </ul>
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

