/* eslint-disable no-undef */
import { useState, useEffect, useRef } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { Label, Input, Button } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import {
  sendTweet,
  scheduleTweet,
  scheduleFbPost,
  fetchPosts,
  fetchPostsSeparately,
  deletePost,
  sendFbPost,
  ssendFbPost,
} from '../../actions/sendSocialMediaPosts';

function Announcements({ title, email: initialEmail }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  // const [accessToken, setAccessToken] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [dateContent, setDateContent] = useState('');
  const [timeContent, setTimeContent] = useState('');
  //const [errors, setErrors] = useState({});
  const errors = {};
  const [headerContent, setHeaderContent] = useState('');
  const [showEditor, setShowEditor] = useState(true);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [posts, setPosts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownPost, setShowDropdownPost] = useState(false);
  const [platform, setPlatform] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const editorRef = useRef(null);
  const maxLength = 280;
  const platforms = [
    { label: 'Facebook', value: 'facebook' },
    { label: 'Twitter', value: 'twitter' },
    { label: 'Instagram', value: 'instagram' }, // add more as needed
  ];
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  useEffect(() => {
    setShowEditor(false);
    setTimeout(() => setShowEditor(true), 0);
  }, [darkMode]);

  const editorInit = {
    license_key: 'gpl',
    selector: 'Editor#email-editor',
    height: 500,
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

  const getAllPosts = async () => {
    const data = await fetchPosts();
    setPosts(data);
  };

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

  const [charCount, setCharCount] = useState(0);

  const stripHtml = html => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
  };

  const handleEditorChange = (content, editor) => {
    setEmailContent(content);
    const charCounts = stripHtml(content).trim();
    setCharCount(charCounts.length);
    if (editor) {
      if (charCounts.length > maxLength) {
        editor.getBody().style.color = 'red';
      } else {
        editor.getBody().style.color = ''; // reset to default
      }
    }
  };

  const handlePostTweets = () => {
    if (charCount > maxLength) {
      toast.error('Character limit exceeded. Please shorten your text to 280 characters.');
      return;
    }
    const htmlContent = `${emailContent}`;
    dispatch(sendTweet(htmlContent));
  };

  const handleDateContentChange = e => {
    setDateContent(e.target.value);
  };

  const handleDeletePost = async postId => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;
    try {
      const result = await deletePost(postId);
      if (result) {
        toast.success('Post deleted successfully!');
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      } else {
        toast.error('Failed to delete post.');
      }
    } catch (error) {
      toast.error('Error deleting post.');
    }
  };

  const loadFacebookSDK = () => {
    return new Promise((resolve, reject) => {
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
            appId: '1335318524566163',
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
  }, []);

  const handleCreateFbPost = () => {
    if (!emailContent || emailContent.trim() === '') {
      toast.error('Error: No content to post. Please add some content in Weekly progress editor');
      return;
    }

    window.FB.login(
      response => {
        if (response.authResponse) {
          const accessTokens = response.authResponse.accessToken;
          dispatch(ssendFbPost(emailContent, accessTokens))
            .then(() => {
              toast.success('Post successfully created on Facebook!');
            })
            .catch(error => {
              toast.error('Failed to post on Facebook.');
            });
        } else {
          toast.error('Facebook login failed or was cancelled.');
        }
      },
      {
        scope: 'public_profile,email,pages_show_list,pages_manage_posts',
      },
    );
  };

  const handleScheduleClick = () => {
    setShowDropdown(true);
  };

  const handlePostClick = () => {
    setShowDropdownPost(true);
  };

  const handleSubmit = async () => {
    if (charCount > maxLength) {
      toast.error('Character limit exceeded. Please shorten your text to 280 characters.');
      return;
    }
    const htmlContent = `${emailContent}`;
    const scheduleDate = `${dateContent}`;
    const scheduleTime = `${timeContent}`;
    if (!emailContent || emailContent.trim() === '') {
      toast.error('Please enter content before posting.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform.');
      return;
    }

    if (selectedPlatforms.includes('facebook')) {
      await dispatch(scheduleFbPost(scheduleDate, scheduleTime, htmlContent));
    }

    if (selectedPlatforms.includes('twitter')) {
      await dispatch(scheduleTweet(scheduleDate, scheduleTime, htmlContent));
    }

    setShowDropdown(false);
  };

  const handleChange = async e => {
    const value = e.target.value;
    setSelectedPlatform(value);
    const { twitterPosts, facebookPosts } = await fetchPostsSeparately();

    if (value === 'facebook') {
      setPosts(facebookPosts);
    } else if (value === 'twitter') {
      setPosts(twitterPosts);
    } else if (value === 'All') {
      await getAllPosts();
    }
  };

  const handlePostScheduledFbPost = (postId, textContent, base64Srcs, platforms) => {
    window.FB.login(
      response => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          dispatch(sendFbPost(textContent, base64Srcs, accessToken))
            .then(() => {
              setTimeout(() => {
                handleDeletePost(postId, true);
              }, 1500);
            })
            .catch(error => {
              toast.error('Failed to post on Facebook.');
            });
        } else {
          toast.error('Facebook login failed or was cancelled.');
        }
      },
      {
        scope: 'public_profile,email,pages_show_list,pages_manage_posts',
      },
    );
  };

  const handlePostScheduledTweets = (postId, textContent, platforms) => {
    dispatch(sendTweet(textContent))
      .then(() => {
        setTimeout(() => {
          handleDeletePost(postId, true);
        }, 1500);
      })
      .catch(error => {
        toast.error('Failed to post tweet.');
      });
  };

  const postToPlatform = (postId, textContent, base64Srcs, platforms) => {
    const skipConfirm = localStorage.getItem('skipPostConfirm') === 'true';

    if (!skipConfirm) {
      const confirmDelete = window.confirm(`Are you sure you want to post this on ${platforms}`);
      if (!confirmDelete) return;

      const dontAskAgain = window.confirm("Don't ask again for future posts?");
      if (dontAskAgain) {
        localStorage.setItem('skipPostConfirm', 'true');
      }
    }

    if (platforms === 'facebook') {
      handlePostScheduledFbPost(postId, textContent, base64Srcs, platforms);
    } else if (platforms === 'twitter') {
      handlePostScheduledTweets(postId, textContent, base64Srcs, platforms);
    }
  };

  const timeConvert = scheduledTime => {
    const [hours, minutes] = scheduledTime.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedTime = `${hour}:${minutes} ${ampm} PST`;
    return formattedTime;
  };

  const handlePostNow = () => {
    if (!emailContent || emailContent.trim() === '') {
      toast.error('Please enter content before posting.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform.');
      return;
    }

    if (selectedPlatforms.includes('twitter')) {
      dispatch(sendTweet(emailContent));
    }

    if (selectedPlatforms.includes('facebook')) {
      window.FB.login(
        response => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken;
            dispatch(ssendFbPost(emailContent, accessToken))
              .then(() => toast.success('Posted to Facebook!'))
              .catch(() => toast.error('Failed to post on Facebook.'));
          } else {
            toast.error('Facebook login failed.');
          }
        },
        { scope: 'public_profile,email,pages_show_list,pages_manage_posts' },
      );
    }
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <div className="email-update-container">
        <div className="editor">
          {title ? <h3> {title} </h3> : <h3>Weekly Progress Editor</h3>}
          <br />
          <div inline="true" className="mb-2">
            <Label for="dateOfWork">Date</Label>
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
            )}
          </div>

          <div inline="true" className="mb-2">
            <Label for="timeOfWork">Time</Label>
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
            {!showDropdown ? (
              <button
                className="send-button mr-1 ml-1"
                onClick={handleScheduleClick}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Schedule Post
              </button>
            ) : (
              // <div style={{ marginTop: '15px' }}>
              //   <label>Select Platform: </label>
              //   <select
              //     value={platform}
              //     onChange={e => setPlatform(e.target.value)}
              //     style={{ marginLeft: '10px', padding: '5px' }}
              //   >
              //     <option value="">-- Choose --</option>
              //     <option value="facebook">Facebook</option>
              //     <option value="twitter">Twitter</option>
              //   </select>
              // </div>
              <div style={{ marginTop: '15px' }}>
                <label>
                  <strong>Select Multiple Platform(s):</strong>
                </label>
                <div>
                  {platforms.map(({ label, value }) => (
                    <div key={value} style={{ margin: '5px 0' }}>
                      <input
                        type="checkbox"
                        id={`platform-${value}`}
                        value={value}
                        checked={selectedPlatforms.includes(value)}
                        onChange={e => {
                          const { value, checked } = e.target;
                          if (checked) {
                            setSelectedPlatforms(prev => [...prev, value]);
                          } else {
                            setSelectedPlatforms(prev => prev.filter(p => p !== value));
                          }
                        }}
                      />
                      <label htmlFor={`platform-${value}`} style={{ marginLeft: '8px' }}>
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ marginBottom: '20px' }}>
            {!showDropdownPost ? (
              <button
                className="send-button mr-1 ml-1"
                onClick={handlePostClick}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Select Multiple Platforms
              </button>
            ) : (
              <div style={{ marginTop: '15px' }}>
                <label>
                  <strong>Select Multiple Platform(s):</strong>
                </label>
                <div>
                  {platforms.map(({ label, value }) => (
                    <div key={value} style={{ margin: '5px 0' }}>
                      <input
                        type="checkbox"
                        id={`platform-${value}`}
                        value={value}
                        checked={selectedPlatforms.includes(value)}
                        onChange={e => {
                          const { value, checked } = e.target;
                          if (checked) {
                            setSelectedPlatforms(prev => [...prev, value]);
                          } else {
                            setSelectedPlatforms(prev => prev.filter(p => p !== value));
                          }
                        }}
                      />
                      <label htmlFor={`platform-${value}`} style={{ marginLeft: '8px' }}>
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
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
              init={{
                height: 500,
                menubar: false,
                plugins: [
                  'advlist',
                  'autolink',
                  'lists',
                  'link',
                  'image',
                  'charmap',
                  'preview',
                  'anchor',
                  'searchreplace',
                ],
                toolbar:
                  'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
              }}
              //onEditorChange={handleEditorChange}
              onEditorChange={(content, editor) => handleEditorChange(content, editor)}
            />
          )}
          <div style={{ color: charCount > 280 ? 'red' : 'black' }}>{charCount}</div>
          {title ? (
            ''
          ) : (
            <div>
              <button
                className="send-button mr-1 ml-1"
                onClick={handleSubmit}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Confirm Schedule
              </button>
              <button
                type="button"
                className="send-button mr-1 ml-1"
                onClick={handleBroadcastEmails}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Broadcast Weekly Update
              </button>
            </div>
          )}
          <br />
          <br />
        </div>

        {title ? (
          ''
        ) : (
          <div
            className={`emails${darkMode ? 'bg-yinmn-blue text-light' : ''}`}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            <label htmlFor="email-list-input" className={darkMode ? 'text-light' : 'text-dark'}>
              Email List (comma-separated)<span className="red-asterisk">* </span>:
            </label>
            <input
              type="text"
              id="email-list-input"
              value={emailTo}
              onChange={handleEmailListChange}
              placeholder="Enter email addresses (comma-separated)"
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
              value={headerContent}
              onChange={handleHeaderContentChange}
              placeholder="Enter header image URL"
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
        )}
      </div>
      <div className="social-media-container">
        <div className="social-media">
          {title ? <h3>{title}</h3> : <h3>Post on Social Media</h3>}
          {title ? null : (
            <label htmlFor="social-media-list" className={darkMode ? 'text-light' : 'text-dark'}>
              Click on below social media to post
            </label>
          )}

          <button
            type="button"
            className="send-button"
            onClick={handlePostNow}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Post to Selected Platform(s)
          </button>

          {title ? null : (
            <div className="social-buttons-container">
              <button
                type="button"
                className="send-button"
                onClick={handleCreateFbPost}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Post on Facebook
              </button>

              <button
                type="button"
                className="send-button"
                onClick={handlePostTweets}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Post on Twitter
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="container mx-auto p-4">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-6">Scheduled Social Media Posts</h1>

        {/* Platform Select Dropdown */}
        <div className="flex text-center mb-6 ml-8">
          <select
            className="p-3 border rounded-lg w-96"
            onChange={handleChange}
            value={selectedPlatform}
          >
            <option value="">Select platform</option>
            <option value="facebook">Fetch all Facebook Scheduled Posts</option>
            <option value="twitter">Fetch all Twitter Scheduled Posts</option>
            <option value="All">Fetch all Scheduled Posts</option>
          </select>
        </div>
      </div>
      <div className="space-y-4">
        <ul>
          {posts.map(post => (
            <li
              key={post._id}
              className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-md"
            >
              <div>
                <strong>Platform:</strong> {post.platform} <br />
                <strong>Scheduled Date & Time:</strong> {post.scheduledDate} at{' '}
                {timeConvert(post.scheduledTime)} <br />
                <strong>Content: </strong>
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
                  {post.textContent}
                </Link>
                <br />
                {post.base64Srcs && post.base64Srcs.length > 0 && (
                  <div className="flex gap-9 mt-9 flex-wrap">
                    {post.base64Srcs.map((src, index) => (
                      <img
                        key={index}
                        src={`${src}`}
                        alt={`Uploaded ${index}`}
                        className="w-[300px] h-[300px] object-contain rounded max-w-none"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
              </div>
              <Button
                color="success"
                size="sm"
                style={{ marginRight: '8px' }}
                onClick={() =>
                  postToPlatform(post._id, post.textContent, post.base64Srcs, post.platform)
                }
              >
                Post
              </Button>
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
