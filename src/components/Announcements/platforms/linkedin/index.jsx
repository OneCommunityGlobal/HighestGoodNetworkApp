import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, Edit, Loader, Trash2, Upload, X } from 'lucide-react';
import { boxStyle, boxStyleDark } from '~/styles';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from '../../Announcements.module.css';

const MAX_IMAGES = 9;
const MAX_VIDEOS = 1;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

const getPreviewId = file =>
  window.crypto?.randomUUID?.() || `${file.name}-${file.size}-${Date.now()}`;

const getFieldStyle = darkMode => ({
  backgroundColor: darkMode ? '#1f2937' : '#fff',
  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
  borderRadius: '0.5rem',
  color: darkMode ? '#fff' : '#111827',
  width: '100%',
});

const getCardStyle = darkMode => ({
  backgroundColor: darkMode ? '#0f1e33' : '#f8fafc',
  border: `1px solid ${darkMode ? '#324563' : '#d9e2ec'}`,
  borderRadius: '0.75rem',
  padding: '1rem',
});

export default function LinkedInAutoPoster({ darkMode }) {
  const [linkedinContent, setLinkedinContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [editingJobId, setEditingJobId] = useState(null);

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const resetLinkedInForm = () => {
    setLinkedinContent('');
    setMediaFiles([]);
    setPreviews([]);
    setScheduleDate('');
    setScheduleTime('');
    setEditingJobId(null);
  };

  const fetchScheduledPosts = async () => {
    try {
      const response = await axios.get(ENDPOINTS.LINKEDIN_SCHEDULED_POSTS);
      if (response.data.success) {
        setScheduledPosts(response.data.scheduledPosts);
        return;
      }

      throw new Error(response.data.message || 'Failed to fetch scheduled posts');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch scheduled posts');
    }
  };

  const handleMediaUpload = event => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    const existingVideoCount = mediaFiles.filter(file => file.type.includes('video')).length;
    const existingImageCount = mediaFiles.filter(file => file.type.includes('image')).length;
    const newVideoCount = files.filter(file => file.type.includes('video')).length;
    const newImageCount = files.filter(file => file.type.includes('image')).length;

    if (existingVideoCount + newVideoCount > MAX_VIDEOS) {
      toast.error('Only one video file is allowed per post');
      return;
    }

    if (existingImageCount + newImageCount > MAX_IMAGES) {
      toast.error('Maximum 9 images allowed per post');
      return;
    }

    if (
      (newVideoCount > 0 && (existingImageCount > 0 || newImageCount > 0)) ||
      (existingVideoCount > 0 && newImageCount > 0)
    ) {
      toast.error('Cannot mix videos and images in the same post');
      return;
    }

    const validFiles = files.filter(file => {
      const maxSize = file.type.includes('video') ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" exceeds the upload size limit`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews(previous => [
          ...previous,
          {
            id: getPreviewId(file),
            url: reader.result,
            type: file.type,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    setMediaFiles(previous => [...previous, ...validFiles]);
    event.target.value = '';
  };

  const removeMedia = index => {
    setMediaFiles(previous => previous.filter((_, previewIndex) => previewIndex !== index));
    setPreviews(previous => previous.filter((_, previewIndex) => previewIndex !== index));
  };

  const handleScheduleDateChange = event => {
    const nextDate = event.target.value;
    setScheduleDate(nextDate);

    if (!nextDate) {
      setScheduleTime('');
      return;
    }

    const twoMinutesFromNow = new Date(Date.now() + 2 * 60 * 1000);
    const hours = String(twoMinutesFromNow.getHours()).padStart(2, '0');
    const minutes = String(twoMinutesFromNow.getMinutes()).padStart(2, '0');
    setScheduleTime(`${hours}:${minutes}`);
  };

  const handleScheduleTimeChange = event => {
    const nextTime = event.target.value;
    const scheduledDateTime = new Date(`${scheduleDate}T${nextTime}`);
    const twoMinutesFromNow = new Date(Date.now() + 2 * 60 * 1000);

    if (scheduledDateTime < twoMinutesFromNow) {
      const hours = String(twoMinutesFromNow.getHours()).padStart(2, '0');
      const minutes = String(twoMinutesFromNow.getMinutes()).padStart(2, '0');
      setScheduleTime(`${hours}:${minutes}`);
      toast.info('Time automatically adjusted to 2 minutes from now');
      return;
    }

    setScheduleTime(nextTime);
  };

  const handlePostToLinkedIn = async () => {
    if (!linkedinContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    if (scheduleDate && scheduleTime) {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      if (scheduledDateTime <= new Date()) {
        toast.error('Schedule time must be in the future');
        return;
      }
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', linkedinContent.trim());

      if (scheduleDate && scheduleTime) {
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        formData.append('scheduleTime', scheduledDateTime.toISOString());
      }

      mediaFiles.forEach(file => {
        formData.append('media', file);
      });

      const response = await axios.post(ENDPOINTS.LINKEDIN_POST, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to post to LinkedIn');
      }

      if (editingJobId) {
        await axios.delete(ENDPOINTS.LINKEDIN_SCHEDULED_POST_BY_ID(editingJobId));
      }

      toast.success(
        scheduleDate && scheduleTime
          ? `Post scheduled for ${new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}`
          : 'Posted successfully to LinkedIn',
      );

      resetLinkedInForm();
      fetchScheduledPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post to LinkedIn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScheduledPost = async jobId => {
    // Local confirm is acceptable here because the action is destructive and immediate.
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsCanceling(true);

    try {
      await axios.delete(ENDPOINTS.LINKEDIN_SCHEDULED_POST_BY_ID(jobId));
      toast.success('Post deleted successfully');
      fetchScheduledPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsCanceling(false);
    }
  };

  const loadScheduledPostForEditing = post => {
    const scheduledDateTime = new Date(post.scheduleTime);
    setLinkedinContent(post.content);
    setScheduleDate(scheduledDateTime.toISOString().split('T')[0]);
    setScheduleTime(scheduledDateTime.toTimeString().slice(0, 5));
    setEditingJobId(post.jobId);
    toast.info('Post loaded for editing');
  };

  const todayDate = new Date().toLocaleDateString('en-CA');
  const fieldStyle = getFieldStyle(darkMode);
  const cardStyle = getCardStyle(darkMode);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>LinkedIn Post Editor</h3>
        <textarea
          value={linkedinContent}
          onChange={event => setLinkedinContent(event.target.value)}
          placeholder="Enter your LinkedIn post content here..."
          rows={6}
          className={styles.inputTextForAnnouncement}
          style={{ ...fieldStyle, resize: 'vertical' }}
        />

        <div style={{ marginTop: '1rem' }}>
          <label
            htmlFor="linkedin-media-upload"
            className={styles.sendButton}
            style={{
              ...(darkMode ? boxStyleDark : boxStyle),
              alignItems: 'center',
              display: 'inline-flex',
              gap: '0.5rem',
              marginTop: 0,
            }}
          >
            <Upload size={18} />
            Upload Media
            <input
              id="linkedin-media-upload"
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={handleMediaUpload}
            />
          </label>
          <span style={{ color: darkMode ? '#d1d5db' : '#4b5563', marginLeft: '0.75rem' }}>
            Up to 9 images or 1 video
          </span>
        </div>

        {previews.length > 0 && (
          <div
            style={{
              display: 'grid',
              gap: '0.75rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              marginTop: '1rem',
            }}
          >
            {previews.map((preview, index) => (
              <div
                key={preview.id}
                style={{
                  backgroundColor: darkMode ? '#132238' : '#fff',
                  border: `1px solid ${darkMode ? '#324563' : '#d9e2ec'}`,
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  style={{
                    background: '#dc2626',
                    border: 'none',
                    borderRadius: '999px',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: '0.35rem',
                    position: 'absolute',
                    right: '0.5rem',
                    top: '0.5rem',
                    zIndex: 1,
                  }}
                >
                  <X size={14} />
                </button>
                {preview.type.includes('image') ? (
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    style={{ display: 'block', height: '180px', objectFit: 'cover', width: '100%' }}
                  />
                ) : (
                  // Uploaded-video previews do not have caption tracks available client-side.
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={preview.url}
                    controls
                    style={{ display: 'block', height: '180px', objectFit: 'cover', width: '100%' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginTop: '1rem',
          }}
        >
          <Calendar color={darkMode ? '#d1d5db' : '#4b5563'} size={18} />
          <input
            type="date"
            value={scheduleDate}
            min={todayDate}
            onChange={handleScheduleDateChange}
            className={styles.inputTextForAnnouncement}
            style={{ ...fieldStyle, marginTop: 0, maxWidth: '220px' }}
          />
          <input
            type="time"
            value={scheduleTime}
            step="60"
            onChange={handleScheduleTimeChange}
            className={styles.inputTextForAnnouncement}
            style={{ ...fieldStyle, marginTop: 0, maxWidth: '180px' }}
          />
          {(scheduleDate || scheduleTime) && (
            <button
              type="button"
              onClick={() => {
                setScheduleDate('');
                setScheduleTime('');
              }}
              style={{
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                display: 'inline-flex',
                padding: 0,
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {scheduleDate && scheduleTime && (
          <p style={{ color: darkMode ? '#d1d5db' : '#4b5563', margin: '0.75rem 0 0' }}>
            Will post at: {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            className={styles.sendButton}
            onClick={handlePostToLinkedIn}
            disabled={isLoading || !linkedinContent.trim()}
            style={{
              ...(darkMode ? boxStyleDark : boxStyle),
              cursor: isLoading || !linkedinContent.trim() ? 'not-allowed' : 'pointer',
              marginTop: 0,
              opacity: isLoading || !linkedinContent.trim() ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <span style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}>
                <Loader size={16} />
                Working...
              </span>
            ) : scheduleDate && scheduleTime ? (
              'Schedule Post'
            ) : (
              'Post Now'
            )}
          </button>

          {editingJobId && (
            <button
              type="button"
              className={styles.sendButton}
              onClick={resetLinkedInForm}
              style={{
                backgroundColor: darkMode ? '#1f2937' : '#e5e7eb',
                color: darkMode ? '#fff' : '#111827',
                marginTop: 0,
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </section>

      <section style={cardStyle}>
        <h4 style={{ marginTop: 0 }}>Scheduled Posts</h4>
        {scheduledPosts.length === 0 ? (
          <p style={{ color: darkMode ? '#d1d5db' : '#4b5563', marginBottom: 0 }}>
            No posts scheduled yet.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {scheduledPosts.map(post => (
              <div
                key={post.jobId}
                style={{
                  backgroundColor: darkMode ? '#132238' : '#fff',
                  border: `1px solid ${darkMode ? '#324563' : '#d9e2ec'}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    alignItems: 'flex-start',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <p style={{ margin: 0 }}>
                      <strong>Content:</strong> {post.content}
                    </p>
                    <p style={{ margin: '0.5rem 0 0' }}>
                      <strong>Scheduled Time:</strong>{' '}
                      {new Date(post.scheduleTime).toLocaleString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => loadScheduledPostForEditing(post)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title="Edit scheduled post"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteScheduledPost(post.jobId)}
                      disabled={isCanceling}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#dc2626',
                        cursor: isCanceling ? 'not-allowed' : 'pointer',
                        opacity: isCanceling ? 0.6 : 1,
                        padding: 0,
                      }}
                      title="Delete scheduled post"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
