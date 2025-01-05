import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';g
import { Upload, Calendar, X, Loader } from 'lucide-react';
import axios from 'axios';

function Announcements() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [testEmail, setTestEmail] = useState('');
  
  const [linkedinContent, setLinkedinContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showEditor, setShowEditor] = useState(true); // State to control rendering of the editor
  const [scheduledPosts, setScheduledPosts] = useState([]);

  useEffect(() => {
    // Toggle the showEditor state to force re-render when dark mode changes
    setShowEditor(false);
    setTimeout(() => setShowEditor(true), 0);
  }, [darkMode]);

  const editorInit = {
    license_key: 'gpl',
    selector: 'textarea#open-source-plugins',
    height: 500,
    menubar: false,
    plugins: [
      'advlist autolink lists link image paste',
      'charmap print preview anchor help',
      'searchreplace visualblocks code',
      'insertdatetime media table paste wordcount',
    ],
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
            Note: Now we need to register the blob in TinyMCE's image blob
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
    menubar: 'file insert edit view format tools',
    toolbar:
      'undo redo | formatselect | bold italic | blocks fontfamily fontsize | image \
      alignleft aligncenter alignright | \
      bullist numlist outdent indent | removeformat | help',
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };

  const handleEmailListChange = e => {
    const emails = e.target.value.split(',');
    setEmailList(emails);
  };

  const handleHeaderContentChange = e => {
    setHeaderContent(e.target.value);
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

  const validateEmail = email => {
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

    dispatch(sendEmail(emailList.join(','), 'Weekly Update', htmlContent));
  };

  const handleBroadcastEmails = () => {
    const htmlContent = `
    <div style="max-width: 900px; width: 100%; margin: auto;">
      ${emailContent}
    </div>
  `;
    dispatch(broadcastEmailsToAll('Weekly Update', htmlContent));
  };

  // Handle media upload
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // LinkedIn limits
    const MAX_IMAGES = 9;
    const MAX_VIDEOS = 1;
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

    const existingVideos = mediaFiles.filter(file => file.type.includes('video')).length;
    const existingImages = mediaFiles.filter(file => file.type.includes('image')).length;
    const newVideos = files.filter(file => file.type.includes('video')).length;
    const newImages = files.filter(file => file.type.includes('image')).length;

    // Validate video limit
    if (existingVideos + newVideos > MAX_VIDEOS) {
      toast.error('Only one video file is allowed per post');
      return;
    }

    // Validate image limit
    if (existingImages + newImages > MAX_IMAGES) {
      toast.error('Maximum 9 images allowed per post');
      return;
    }

    // Validate mixed content
    if (newVideos > 0 && (existingImages > 0 || newImages > 0)) {
      toast.error('Cannot mix videos and images in the same post');
      return;
    }
    if (existingVideos > 0 && (newImages > 0)) {
      toast.error('Cannot mix videos and images in the same post');
      return;
    }

    // Validate file sizes
    const validFiles = files.filter((file) => {
      const maxSize = file.type.includes('video') ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" exceeds size limit`);
        return false;
      }
      return true;
    });

    // Generate previews for valid files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result,
            type: file.type,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    setMediaFiles((prev) => [...prev, ...validFiles]);
  };

  // Remove media file
  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostToLinkedIn = async () => {
    console.log('Button clicked', {
      content: linkedinContent,
      scheduleDate,
      scheduleTime,
      mediaFiles
    });

    // Validate content
    if (!linkedinContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    // Validate schedule time if provided
    if (scheduleDate && scheduleTime) {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      const now = new Date();
      
      console.log('Schedule validation:', {
        scheduledDateTime,
        now,
        isValid: scheduledDateTime > now
      });

      if (scheduledDateTime <= now) {
        toast.error('Schedule time must be in the future');
        return;
      }
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', linkedinContent.trim());

      // Add schedule time if provided
      if (scheduleDate && scheduleTime) {
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        formData.append('scheduleTime', scheduledDateTime.toISOString());
      }

      // Append media files
      mediaFiles.forEach((file) => {
        formData.append('media', file);
      });

      // 添加请求日志
      console.log('Sending request to:', 'http://localhost:4500/api/postToLinkedIn');
      console.log('Request data:', {
        content: formData.get('content'),
        scheduleTime: formData.get('scheduleTime'),
        mediaFiles: Array.from(formData.getAll('media')).map(f => f.name)
      });

      const response = await axios.post(
        'http://localhost:4500/api/postToLinkedIn',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log('Response:', response.data);

      if (response.data.success) {
        if (scheduleDate && scheduleTime) {
          toast.success(`Post scheduled for ${new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}`);
          fetchScheduledPosts(); // Refresh the scheduled posts list
        } else {
          toast.success('Posted successfully to LinkedIn');
        }
        resetLinkedInForm();
      } else {
        throw new Error(response.data.message || 'Failed to post to LinkedIn');
      }
    } catch (error) {
      console.error('LinkedIn post error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      toast.error(error.response?.data?.message || 'Failed to post to LinkedIn');
    } finally {
      setIsLoading(false);
    }
  };

  const isScheduleTimeValid = () => {
    if (!scheduleDate || !scheduleTime) {
      return true;
    }

    const now = new Date();
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    
    return scheduledDateTime > now;
  };

  const handleScheduleDateChange = (e) => {
    const newDate = e.target.value;
    setScheduleDate(newDate);
    
    if (newDate) {
      const now = new Date();
      const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000);
      const hours = String(twoMinutesFromNow.getHours()).padStart(2, '0');
      const minutes = String(twoMinutesFromNow.getMinutes()).padStart(2, '0');
      setScheduleTime(`${hours}:${minutes}`);
    } else {
      setScheduleTime('');
    }
  };

  const handleScheduleTimeChange = (e) => {
    const newTime = e.target.value;
    const now = new Date();
    const scheduledDateTime = new Date(`${scheduleDate}T${newTime}`);
    const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000);
    
    if (scheduledDateTime < twoMinutesFromNow) {
      const hours = String(twoMinutesFromNow.getHours()).padStart(2, '0');
      const minutes = String(twoMinutesFromNow.getMinutes()).padStart(2, '0');
      setScheduleTime(`${hours}:${minutes}`);
      toast.info('Time automatically adjusted to 2 minutes from now');
    } else {
      setScheduleTime(newTime);
    }
  };

  // Reset LinkedIn form
  const resetLinkedInForm = () => {
    setLinkedinContent('');
    setMediaFiles([]);
    setPreviews([]);
    setScheduleDate('');
    setScheduleTime('');
  };

  const fetchScheduledPosts = async () => {
    try {
      const response = await axios.get('http://localhost:4500/api/scheduledPosts');
      if (response.data.success) {
        setScheduledPosts(response.data.scheduledPosts);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled posts:', error);
      toast.error('Failed to fetch scheduled posts');
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const handleCancelScheduledPost = async (postId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled post?')) {
      return;
    }

    setIsCanceling(true);
    try {
      console.log('Canceling post:', postId);
      const response = await axios.delete(`http://localhost:4500/api/scheduledPosts/${postId}`);
      console.log('Cancel response:', response.data);
      
      toast.success('Post cancelled successfully');
      fetchScheduledPosts(); // Refresh the list
    } catch (error) {
      console.error('Failed to cancel post:', {
        postId,
        error: error.message,
        response: error.response?.data
      });
      toast.error(error.response?.data?.message || 'Failed to cancel scheduled post');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <div className="email-update-container">
        <div className="editor">
          <h3>Weekly Progress Editor</h3>
          <br />
          {showEditor && (
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              id="email-editor"
              initialValue="<p>This is the initial content of the editor</p>"
              init={editorInit}
              onEditorChange={(content, editor) => {
                setEmailContent(content);
              }}
            />
          )}
          <button
            type="button"
            className="send-button"
            onClick={handleBroadcastEmails}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Broadcast Weekly Update
          </button>

          {/* LinkedIn Editor Section */}
          <div className={`${darkMode ? 'bg-oxford-blue text-light' : ''}`} style={{ minHeight: '100%' }}>
            <div className="linkedin-post-container">
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                LinkedIn Post Editor
              </h3>
              
              {/* LinkedIn Content Input */}
              <textarea
                value={linkedinContent}
                onChange={(e) => setLinkedinContent(e.target.value)}
                placeholder="Enter your LinkedIn post content here..."
                rows={5}
                className={`w-full p-3 border rounded-md resize-none ${
                  darkMode 
                    ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                    : 'bg-white border-gray-300 placeholder-gray-500'
                }`}
              />

              {/* Media Upload */}
              <div className="mt-4">
                <label 
                  htmlFor="media-upload" 
                  className={`send-button inline-flex items-center cursor-pointer ${
                    darkMode ? 'text-white' : ''
                  }`}
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Media
                  <input
                    type="file"
                    id="media-upload"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
                <span className={`ml-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Up to 9 images or 1 video
                </span>
              </div>

              {/* Media Previews */}
              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div key={preview.id} className="relative">
                      <button
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        onClick={() => removeMedia(index)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {preview.type.includes('image') ? (
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ) : (
                        <video
                          src={preview.url}
                          controls
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Schedule Date and Time */}
              <div className="mt-4 flex items-center gap-2">
                <Calendar className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={handleScheduleDateChange}
                  min={new Date().toLocaleDateString('en-CA')}
                  className={`p-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={handleScheduleTimeChange}
                  step="60"
                  className={`p-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                {scheduleDate && scheduleTime && (
                  <button
                    onClick={() => {
                      setScheduleDate('');
                      setScheduleTime('');
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Scheduled Time Display */}
              {scheduleDate && scheduleTime && (
                <div className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Will post at: {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={(e) => {
                    console.log('Button clicked event:', e);
                    console.log('Button state:', {
                      isLoading,
                      scheduleDate,
                      scheduleTime,
                      isValid: isScheduleTimeValid(),
                      content: linkedinContent.trim()
                    });
                    handlePostToLinkedIn();
                  }}
                  disabled={isLoading || !linkedinContent.trim()}
                  className={`send-button ${
                    isLoading || !linkedinContent.trim()
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : scheduleDate && scheduleTime ? (
                    'Schedule Post'
                  ) : (
                    'Post Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`emails ${darkMode ? 'bg-yinmn-blue' : ''}`}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          <label htmlFor="email-list-input" className={darkMode ? 'text-light' : 'text-dark'}>
            Email List (comma-separated):
          </label>
          <input
            type="text"
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
            Send Email to specific user
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
    </div>
  );
}

export default Announcements;
