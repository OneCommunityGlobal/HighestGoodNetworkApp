import { useEffect, useState } from 'react';
import './reddit.css';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '../../../../utils/URL';
import axios from 'axios';
import { isValidMediaUrl } from '~/utils/checkValidURL';
import { toast } from 'react-toastify';
import { init } from '@sentry/browser';

export default function SubmitPost({
  initialData = null,
  onSaved = () => {},
  onCancelEdit = () => {},
}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const isEditing = Boolean(initialData && (initialData.id || initialData._id));

  const [postType, setPostType] = useState('text');
  const [title, setTitle] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [redditScheduleTime, setRedditScheduleTime] = useState('');

  // Calculate max schedule date (6 months from now)
  const maxScheduleDate = new Date();
  maxScheduleDate.setMonth(maxScheduleDate.getMonth() + 6);

  // helper function to convert ISO/date to "YYYY-MM-DDTHH:MM" to local string for <input type="datetime-local" />
  const toInputDateTime = iso => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    // convert to local ISO without timezone offset
    const tzOffsetMs = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - tzOffsetMs);
    return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  };

  //initialize  form when editing
  useEffect(() => {
    if (!initialData) return;

    (async () => {
      await fetchScheduledPostById(initialData.id);
      setErrors({});
    })();
  }, [initialData]);

  const fetchScheduledPostById = async postId => {
    const res = await axios.get(`${ENDPOINTS.AP_REDDIT_POST}/${postId}`);
    if (res.status !== 200) {
      onCancelEdit();
      return false;
    }
    const post = res.data.post;

    setTitle(post.title || '');
    setSubreddit(post.subreddit || '');
    if (post.content && post.content != '') {
      setContent(post.content || '');
      setPostType('text');
    } else if (post.url && post.url != '') {
      setUrl(post.url);
      setPostType('link');
    }

    // use the fetched post date and convert to datetime-local format
    const scheduleValue =
      post.scheduledAt || post.scheduled_at || initialData.scheduledAt || initialData.scheduled_at;
    setRedditScheduleTime(toInputDateTime(scheduleValue));

    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!subreddit.trim()) newErrors.subreddit = 'Subreddit is required.';
    if (postType === 'text' && !content.trim()) newErrors.content = 'Content is required.';
    if (postType === 'link') {
      if (!url.trim()) {
        newErrors.url = 'URL is required.';
      } else if (!isValidMediaUrl(url.trim())) {
        newErrors.url = 'Please enter valid URL. ';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    let postData;
    postData = {
      title,
      subreddit,
      postType,
      ...(postType === 'text' && { content }),
      ...(postType === 'link' && { link: url }),
    };

    try {
      const res = await axios.post(`${ENDPOINTS.AP_REDDIT_SUBMIT_POST}`, postData);
      if (res.status === 201) {
        toast.success(`Reddit post submitted successfully`);
      } else {
        throw new Error('Unable to submit reddit post');
      }
    } catch (error) {
      toast.error(error.message || 'Unable to submit post to reddit');
    }
  };

  const handleSchedulePost = async () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!subreddit.trim()) newErrors.subreddit = 'Subreddit is required.';
    if (postType === 'text' && !content.trim()) newErrors.content = 'Content is required.';
    if (postType === 'link') {
      if (!url.trim()) {
        newErrors.url = 'URL is required.';
      } else if (!isValidMediaUrl(url.trim())) {
        newErrors.url = 'Please enter valid URL. ';
      }
    }

    if (!redditScheduleTime) {
      newErrors.redditScheduleTime = 'Please select a schedule time.';
    } else {
      const selected = new Date(redditScheduleTime);
      const now = new Date();

      if (Number.isNaN(selected.getTime())) {
        newErrors.redditScheduleTime = 'Invalid date/time.';
      } else if (selected <= now) {
        newErrors.redditScheduleTime = 'Please choose a future date/time.';
      } else if (selected > maxScheduleDate) {
        newErrors.redditScheduleTime = 'Schedule time must be within 6 months.';
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length > 0) return;

    // if valid, save post into database
    const payload = {
      title,
      subreddit,
      postType,
      ...(postType === 'text' && { content }),
      ...(postType === 'link' && { link: url }),
      scheduledAt: redditScheduleTime,
    };

    try {
      let res;
      if (isEditing) {
        //update existing post (PUT)
        res = await axios.put(
          `${ENDPOINTS.AP_REDDIT_POST}/${initialData.id || initialData._id}`,
          payload,
        );
      } else {
        res = await axios.post(`${ENDPOINTS.AP_REDDIT_POST}/schedule`, payload);
      }

      if (res?.status === 201) {
        toast.success(`Reddit post schduled scuccessfully`);
        setPostType('text');
        setTitle('');
        setSubreddit('');
        setContent('');
        setUrl('');
      } else if (isEditing && res.status === 200) {
        toast.success(`Scheduled post updated successfully`);
        onSaved();
      } else {
        throw new Error('Unable to create reddit post for scheduled date');
      }
    } catch (error) {
      toast.error(error.message || 'unable to schedule reddit post');
    }
  };

  return (
    <div
      className={`${isEditing ? 'reddit-form-container' : ''} ${
        darkMode ? 'reddit-form-container dark-mode' : ''
      }`}
    >
      <div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <select
              id="postType"
              className="form-select"
              value={postType}
              onChange={e => setPostType(e.target.value)}
            >
              <option value="text">Text</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div className="form-group">
            <input
              id="postTitle"
              type="text"
              placeholder="Enter Post Title*"
              className=" w-50 form-input"
              name="title"
              value={title}
              required
              onChange={e => setTitle(e.target.value)}
              style={{
                marginBottom: '0.5rem',
              }}
            />
            {errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Subreddit* e.g., programming"
              className="form-input w-50"
              name="subreddit"
              value={subreddit}
              required
              onChange={e => setSubreddit(e.target.value)}
              style={{ width: '80%', marginBottom: '0.5rem' }}
            />
            {errors.subreddit && <div style={{ color: 'red' }}>{errors.subreddit}</div>}
          </div>
          {postType === 'text' && (
            <div className="form-group">
              <textarea
                name="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={5}
                placeholder="Write your Reddit post here*...."
                className="form-textarea"
                style={{
                  width: '60%',
                  height: '300px',
                }}
              />
              {errors.content && <div style={{ color: 'red' }}>{errors.content}</div>}
            </div>
          )}
          {postType === 'link' && (
            <div className="form-group">
              <input
                type="url"
                value={url}
                required
                placeholder="Enter link URL"
                className="form-input w-50"
                onChange={e => setUrl(e.target.value)}
              />
              {errors.url && <div style={{ color: 'red' }}>{errors.url}</div>}
            </div>
          )}
          <div className="form-group">
            <input
              type="datetime-local"
              value={redditScheduleTime}
              onChange={e => setRedditScheduleTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              max={maxScheduleDate.toISOString().slice(0, 16)}
              className="form-input w-30"
              style={{
                width: '15%',
              }}
            />
            {errors.redditScheduleTime && (
              <div style={{ color: 'red' }}>{errors.redditScheduleTime}</div>
            )}
          </div>
          <div>
            {!isEditing && (
              <button type="submit" className="reddit-btn">
                Post to reddit
              </button>
            )}
            <button type="button" className="reddit-btn mt-4 mx-3" onClick={handleSchedulePost}>
              {isEditing ? 'Update Reddit Post' : 'Schedule Reddit Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
