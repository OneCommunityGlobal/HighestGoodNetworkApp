import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendTweet, scheduleTweet, fetchPosts, deletePost } from '../../actions/sendSocialMediaPosts';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import {
  Label,
  Input,
  Button
} from 'reactstrap';
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import { ENDPOINTS } from '../../utils/URL';

const APIEndpoint = process.env.REACT_APP_APIENDPOINT || 'https://highestgoodnetwork.netlify.app';

function Announcements({ title, email }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [emailContent, setEmailContent] = useState('');

  const [dateContent, setDateContent] = useState('');
  const [timeContent, setTimeContent] = useState('');
  const [errors, setErrors] = useState({});

  const [headerContent, setHeaderContent] = useState('');
  const [showEditor, setShowEditor] = useState(true); // State to control rendering of the editor

  const [posts, setPosts] = useState([]);
  const tinymce = useRef(null);

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
    const { value } = e.target;
    setEmailTo(value); // Update emailTo for the input field
    setEmailList(value.split(',')); // Update emailList for the email list
  };

  const handleHeaderContentChange = e => {
    setHeaderContent(e.target.value);
  };

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
      const editor = tinymce.current.get('email-editor');
      if (editor) {
        editor.insertContent(imageTag);
        setEmailContent(editor.getContent());
      }
    });
    e.target.value = '';
  };

  const validateEmail = e => {
    /* Add a regex pattern for email validation */
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(e);
  };

  const handleSendEmails = () => {
    const htmlContent = emailContent;

    if (emailList.length === 0 || emailList.every(e => !e.trim())) {
      toast.error('Error: Empty Email List. Please enter AT LEAST One email.');
      return;
    }

    const invalidEmails = emailList.filter(e => !validateEmail(e.trim()));

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

  const handlePostTweets = () => {
    const htmlContent = `${emailContent}`;
    dispatch(sendTweet(htmlContent));
  };

  const handleScheduleTweets = async () => {
    const htmlContent = `${emailContent}`;
    const scheduleDate = `${dateContent}`;
    const scheduleTime = `${timeContent}`;

    dispatch(scheduleTweet(scheduleDate, scheduleTime, htmlContent));
    await getAllPosts();
  };

  const handleDateContentChange = e => {
    setDateContent(e.target.value);    
  }  

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

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

  const loadFacebookSDK = () => {
    return new Promise((resolve, reject) => {
      // Check if Facebook SDK is already loaded on console
      if (window.FB) {
        resolve(window.FB);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        window.fbAsyncInit = function fbAsyncInit() {
          window.FB.init({
            appId: '1335318524566163', // Replace with required Facebook App ID
            cookie: true,
            xfbml: true,
            version: 'v15.0',
          });
          resolve(window.FB);
        };
      };
      script.onerror = error => {
        reject(error);
      };
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    loadFacebookSDK();
    /**   .then(FB => {
        console.log("Facebook SDK Loaded", FB);
      })
      .catch((error) => {
        console.error("Error loading Facebook SDK:", error);
      }); */
  }, []);

  const handleFacebookLogin = () => {
    window.FB.login(
      response => {
        if (response.authResponse) {
          setAccessToken(response.authResponse.accessToken);
        } else {
          toast.error('User cancelled the login or did not fully authorize.');
        }
      },
      {
        scope: 'public_profile,email,pages_show_list,pages_manage_posts',
        redirect_uri: `${APIEndpoint}/auth/facebook/callback`,
      },
    ); // Adjust permissions as needed
  };

  const handleCreateFbPost = async () => {
    if (!emailContent || emailContent.trim() === '') {
      toast.error('Error: No content to post. Please add some content in Weekly progress editor');
      return;
    }
    const EmailContent = emailContent;
    try {
      // response = await axios.post(ENDPOINTS.CREATE_FB_POST(), {
      await axios.post(ENDPOINTS.CREATE_FB_POST(), {
        emailContent: EmailContent,
        accessToken,
      });
      toast.success('Post successfully created on Facebook!');
    } catch (error) {
      toast.error('Failed to create post on Facebook');
    }
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <div className="email-update-container">
        <div className="editor">
          {title ? <h3> {title} </h3> : <h3>Weekly Progress Editor</h3>}

          <br />
          <div inline="true" className="mb-2">              
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
          <div inline="true" className="mb-2">
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
        </div>
        <div
          className={`emails ${darkMode ? 'bg-yinmn-blue' : ''}`}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          {title ? (
            <p>Email</p>
          ) : (
            <label htmlFor="email-list-input" className={darkMode ? 'text-light' : 'text-dark'}>
              Email List (comma-separated):
            </label>
          )}
          <input
            type="text"
            value={emailTo}
            id="email-list-input"
            onChange={handleEmailListChange}
            className="input-text-for-announcement"
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
            className="input-text-for-announcement"
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
            <div className="social-buttons-container">
              <button
                type="button"
                className="send-button"
                onClick={handleFacebookLogin}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Login with Facebook
              </button>
              <button
                type="button"
                className="send-button"
                onClick={handleCreateFbPost}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Post on Facebook
              </button>
            </div>
          )}
        </div>
      </div>
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
                    {post.textContent.length > 50
                      ? post.textContent.slice(0, 50) + '...'
                      : post.textContent}
                  </Link> 
                  <br />
                  <em>Scheduled Time:</em> {post.scheduledTime} <br />
                  <em>Platform:</em> {post.platform} <br />
                </div>
                <Button color="danger" size="sm" onClick={() => handleDeletePost(post._id)}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
}

export default Announcements;
