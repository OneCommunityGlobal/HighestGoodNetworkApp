import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { boxStyle, boxStyleDark } from 'styles';
import { Label, Input, Button, Nav, NavItem, NavLink } from 'reactstrap';
import { zonedTimeToUtc } from 'date-fns-tz';
import { Link } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
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

export default function SocialMediaComposer({ platform }) {
  const [postContent, setPostContent] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('composer');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduleSelectedPlatforms, setscheduleSelectedPlatforms] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [repeatAnnually, setRepeatAnnually] = useState(false);
  const [numYears, setNumYears] = useState(1);
  const [timeContent, setTimeContent] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownPost, setShowDropdownPost] = useState(false);
  const [dateContent, setDateContent] = useState('');
  const dispatch = useDispatch();
  const errors = {};
  const [posts, setPosts] = useState([]);
  const platforms = [
    { label: 'Facebook', value: 'facebook' },
    { label: 'Twitter', value: 'twitter' },
    { label: 'Instagram', value: 'instagram' },
  ];
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);

  const tabOrder = [
    { id: 'composer', label: '📝 Make Post' },
    { id: 'scheduled', label: '⏰ Scheduled Post' },
    { id: 'history', label: '📜 Post History' },
    { id: 'details', label: '🧩 Details' },
  ];
  const cancelSchedule = async () => {
    setShowDropdown(false);
    setscheduleSelectedPlatforms([]);
    setDateContent('');
    setTimeContent('');
  };
  const maxLength = 280;
  const [charCount, setCharCount] = useState(0);
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

  useEffect(() => {
    setPostContent('');
  }, [activeSubTab]);

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

  const handlePostNow = () => {
    if (platform === 'facebook') {
      setSelectedPlatforms(['facebook']);
    } else if (platform === 'twitter') {
      setSelectedPlatforms(['twitter']);
    }
    if (!postContent.trim()) {
      toast.error('Please enter content before posting.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform.');
      return;
    }
    if (selectedPlatforms.includes('twitter')) {
      dispatch(sendTweet(postContent));
    }
    if (selectedPlatforms.includes('facebook')) {
      window.FB.login(
        response => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken;
            dispatch(ssendFbPost(postContent, accessToken))
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

  const getAllPosts = async () => {
    const data = await fetchPosts();
    setPosts(data);
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

  const handleScheduleClick = () => {
    setShowDropdown(prev => !prev);
    setShowDropdownPost(false);
  };

  const handleDateContentChange = e => {
    setDateContent(e.target.value);
  };

  const handleSubmit = async () => {
    if (charCount > maxLength) {
      toast.error('Character limit exceeded. Please shorten your text to 280 characters.');
      return;
    }
    if (!postContent || postContent.trim() === '') {
      toast.error('Please enter content before posting.');
      return;
    }
    if (scheduleSelectedPlatforms.length === 0) {
      toast.error('Please select at least one platform.');
      return;
    }
    const schedules = [];
    const [hours, minutes] = timeContent.split(':').map(Number);
    const baseLocalDate = new Date(dateContent);
    baseLocalDate.setHours(hours, minutes, 0, 0);

    if (repeatAnnually) {
      for (let i = 0; i < numYears; i++) {
        const newDate = new Date(baseLocalDate);
        newDate.setFullYear(baseLocalDate.getFullYear() + i);
        schedules.push(newDate);
      }
    } else {
      schedules.push(baseLocalDate);
    }

    for (const scheduleDate of schedules) {
      const utcDate = zonedTimeToUtc(scheduleDate, 'America/Los_Angeles');

      const pstDate = scheduleDate.toISOString().split('T')[0];
      const pstTime = scheduleDate.toTimeString().slice(0, 5);

      if (scheduleSelectedPlatforms.includes('facebook')) {
        await dispatch(scheduleFbPost(pstDate, pstTime, postContent));
      }
      if (scheduleSelectedPlatforms.includes('twitter')) {
        await dispatch(scheduleTweet(pstDate, pstTime, postContent));
      }
    }
    toast.success(`Scheduled ${schedules.length} post(s) successfully!`);
    setShowDropdown(false);
    setscheduleSelectedPlatforms([]);
    setDateContent('');
    setTimeContent('');
  };
  const handleDateRangeChange = async e => {
    const days = parseInt(e.target.value);
    setSelectedDateRange(days);

    const { twitterPosts, facebookPosts } = await fetchPostsSeparately();

    const now = new Date();
    const filterDate = new Date(now);
    filterDate.setDate(now.getDate() - days);

    const filterPosts = postList =>
      postList.filter(post => new Date(post.scheduledDate) >= filterDate);

    if (selectedPlatform === 'facebook') {
      setPosts(filterPosts(facebookPosts));
    } else if (selectedPlatform === 'twitter') {
      setPosts(filterPosts(twitterPosts));
    } else {
      const allPosts = [...facebookPosts, ...twitterPosts];
      setPosts(filterPosts(allPosts));
    }
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

  const timeConvert = scheduledTime => {
    const [hours, minutes] = scheduledTime.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const formattedTime = `${hour}:${minutes} ${ampm} PST`;
    return formattedTime;
  };

  const handleEditorChange = (content, editor) => {
    setEmailContent(content);
    setEditorContent(content);
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

  const tabStyle = tabId => {
    const isActive = activeSubTab === tabId;
    return {
      padding: '10px 16px',
      cursor: 'pointer',
      borderBottom: isActive ? '3px solid #007bff' : '3px solid transparent',
      backgroundColor: isActive ? '#dbeeff' : '#dedede', // ACTIVE vs INACTIVE
      color: isActive ? '#007bff' : '#333',
      fontWeight: isActive ? 'bold' : 'normal',
      flex: 1,
      textAlign: 'center',
      transition: 'all 0.2s ease-in-out',
    };
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>{platform} </h3>
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
        {tabOrder.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveSubTab(id)}
            style={{
              ...tabStyle(id),
              border: 'none',
              outline: 'none',
              font: 'inherit',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSubTab === 'composer' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            value={postContent}
            init={{
              height: 300,
              menubar: true,
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount',
              ],
              toolbar:
                'undo redo | formatselect | bold italic backcolor | \
                alignleft aligncenter alignright alignjustify | \
                bullist numlist outdent indent | removeformat | help | image',
              image_title: true,
              automatic_uploads: true,
              file_picker_types: 'image',
              file_picker_callback: (cb, value, meta) => {
                if (meta.filetype === 'image') {
                  const input = document.createElement('input');
                  input.setAttribute('type', 'file');
                  input.setAttribute('accept', 'image/*');
                  input.onchange = function() {
                    const file = this.files[0];
                    const reader = new FileReader();
                    reader.onload = function() {
                      const base64 = reader.result; // Base64 string
                      cb(base64, { title: file.name });
                    };
                    reader.readAsDataURL(file);
                  };
                  input.click();
                }
              },
            }}
            onEditorChange={content => setPostContent(content)}
          />

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handlePostNow}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
              }}
            >
              Post to {platform}
            </button>

            <div style={{ position: 'relative' }}>
              <details style={{ position: 'relative' }}>
                <summary style={{ listStyle: 'none' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Also post to ▾
                  </span>
                </summary>
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 100,
                  }}
                >
                  <label style={{ display: 'block', marginBottom: '4px' }}>
                    <input type="checkbox" /> Facebook
                  </label>
                  <label style={{ display: 'block', marginBottom: '4px' }}>
                    <input type="checkbox" /> LinkedIn
                  </label>
                  <label style={{ display: 'block', marginBottom: '4px' }}>
                    <input type="checkbox" /> Instagram
                  </label>
                  <label style={{ display: 'block' }}>
                    <input type="checkbox" /> Pinterest
                  </label>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}
      {activeSubTab === 'scheduled' && (
        <div>
          <p>
            <strong>Scheduled Posts for {platform}</strong>
          </p>

          {/* Schedule Post Dropdown / Form */}
          {!showDropdown ? (
            <button
              className="send-button mr-1 ml-1"
              onClick={handleScheduleClick}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Schedule Post
            </button>
          ) : (
            <div style={{ marginTop: '15px' }}>
              <label className="d-block">
                <h3>Schedule Post for Social Media</h3>
              </label>

              <label className="d-block">
                <strong>Select Multiple Platform(s):</strong>
              </label>

              <div>
                {/* Loop through platforms */}
                {platforms.map(({ label, value }) => (
                  <div key={value} style={{ margin: '5px 0' }}>
                    <input
                      type="checkbox"
                      id={`platform-${value}`}
                      value={value}
                      checked={scheduleSelectedPlatforms.includes(value)}
                      onChange={e => {
                        const { value, checked } = e.target;
                        if (checked) {
                          setscheduleSelectedPlatforms(prev => [...prev, value]);
                        } else {
                          setscheduleSelectedPlatforms(prev => prev.filter(p => p !== value));
                        }
                      }}
                    />
                    <label htmlFor={`platform-${value}`} style={{ marginLeft: '8px' }}>
                      {label}
                    </label>
                  </div>
                ))}
              </div>

              {/* Date and Time */}
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
              </div>

              {/* Repeat Annually */}
              <div style={{ marginTop: '15px' }}>
                <input
                  type="checkbox"
                  id="repeat-annually"
                  checked={repeatAnnually}
                  onChange={() => setRepeatAnnually(!repeatAnnually)}
                />
                <label htmlFor="repeat-annually" style={{ marginLeft: '8px' }}>
                  Repeat Annually
                </label>
              </div>

              {repeatAnnually && (
                <div style={{ marginTop: '10px' }}>
                  <Label for="numYears">Number of Years</Label>
                  <Input
                    type="number"
                    id="numYears"
                    value={numYears}
                    min={1}
                    max={15}
                    onChange={e => setNumYears(parseInt(e.target.value))}
                  />
                </div>
              )}
              <div style={{ marginBottom: '1.5rem' }}>
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  value={postContent}
                  init={{
                    height: 300,
                    menubar: true,
                    plugins: [
                      'advlist autolink lists link image charmap print preview anchor',
                      'searchreplace visualblocks code fullscreen',
                      'insertdatetime media table paste code help wordcount',
                    ],
                    toolbar:
                      'undo redo | formatselect | bold italic backcolor | \
                alignleft aligncenter alignright alignjustify | \
                bullist numlist outdent indent | removeformat | help | image',
                    image_title: true,
                    automatic_uploads: true,
                    file_picker_types: 'image',
                    file_picker_callback: (cb, value, meta) => {
                      if (meta.filetype === 'image') {
                        const input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');
                        input.onchange = function() {
                          const file = this.files[0];
                          const reader = new FileReader();
                          reader.onload = function() {
                            const base64 = reader.result; // Base64 string
                            cb(base64, { title: file.name });
                          };
                          reader.readAsDataURL(file);
                        };
                        input.click();
                      }
                    },
                  }}
                  onEditorChange={content => setPostContent(content)}
                />{' '}
              </div>

              <button
                className="send-button mr-1 ml-1"
                onClick={handleSubmit}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Confirm Schedule
              </button>
              <div style={{ marginTop: '15px' }}>
                <button
                  className="cancel-button"
                  onClick={cancelSchedule}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: 'bold',
                    marginRight: '8px',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="container mx-auto p-4">
            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-6">Scheduled Social Media Posts</h1>

            {/* Platform Select Dropdown */}
            <div className="flex text-center mb-6 ml-8" style={{ display: 'flex', gap: '1rem' }}>
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

              <select
                className="p-3 border rounded-lg w-72"
                onChange={handleDateRangeChange}
                value={selectedDateRange}
              >
                <option value="">Filter by Time Range</option>
                <option value="10">Last 10 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="60">Last 2 Months</option>
                <option value="180">Last 6 Months</option>
                <option value="365">Last 1 Year</option>
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

          {/* Example Scheduled Posts List */}
          <ul style={{ marginTop: '1rem' }}>
            <li>Aug 5 at 3:00 PM — “New product alert!”</li>
            <li>Aug 12 at 12:00 PM — “Weekly roundup”</li>
          </ul>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div>
          <p>
            <strong>Post History for {platform}</strong>
          </p>
          <ul>
            <li>July 20 — “Thanks for 10k followers!”</li>
            <li>July 15 — “Introducing our summer series…”</li>
          </ul>
        </div>
      )}

      {activeSubTab === 'details' && (
        <div>
          <p>
            <strong>{platform}-Specific Details</strong>
          </p>
          <ul>
            <li>Max characters: 280</li>
            <li>Supports hashtags: Yes</li>
            <li>Image support: Yes</li>
            <li>Recommended dimensions: 1200x675 px</li>
          </ul>
        </div>
      )}
    </div>
  );
}
