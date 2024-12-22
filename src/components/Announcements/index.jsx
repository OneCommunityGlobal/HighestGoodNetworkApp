import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { Upload, Calendar, X } from 'lucide-react';
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

    if (mediaFiles.length + files.length > 9) {
      toast.error('Maximum 9 media files allowed per post');
      return;
    }

    const validFiles = files.filter((file) => {
      const maxSize = file.type.includes('video') ? 200 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" exceeds size limit.`);
        return false;
      }
      return true;
    });

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

  // Handle LinkedIn post submission
  const handlePostToLinkedIn = async () => {
    if (!linkedinContent.trim()) {
      toast.error('LinkedIn content cannot be empty.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', linkedinContent);
      mediaFiles.forEach((file) => formData.append('media', file));

      if (scheduleDate && scheduleTime) {
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        formData.append('scheduleTime', scheduledDateTime.toISOString());
      }

      const response = await axios.post(
        'http://localhost:4500/api/postToLinkedIn',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success('Posted to LinkedIn successfully!');
        resetLinkedInForm();
      } else {
        toast.error('Failed to post to LinkedIn');
      }
    } catch (error) {
      toast.error('Failed to post to LinkedIn');
      console.error('Error posting to LinkedIn:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
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
<div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <div className="linkedin-post-container">
        <h3>LinkedIn Post Editor</h3>
        {/* LinkedIn Content Input */}
        <textarea
          value={linkedinContent}
          onChange={(e) => setLinkedinContent(e.target.value)}
          placeholder="Enter your LinkedIn post content here..."
          rows={5}
          className="w-full p-3 border rounded-md"
        ></textarea>

        {/* Media Upload */}
        <div className="mt-4">
          <label htmlFor="media-upload" className="btn btn-upload">
            <Upload className="inline-block mr-2" /> Upload Media
          </label>
          <input
            type="file"
            id="media-upload"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="hidden"
          />
        </div>

        {/* Media Previews */}
        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={preview.id} className="relative">
                <button
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  onClick={() => removeMedia(index)}
                >
                  <X className="h-4 w-4" />
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
          <Calendar className="h-5 w-5" />
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="p-2 border rounded-md"
          />
          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handlePostToLinkedIn}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {scheduleDate ? 'Schedule Post' : 'Post Now'}
          </button>
          <button onClick={resetLinkedInForm} className="btn btn-secondary">
            Clear
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
