import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './MediumAutoPoster.module.css';

import {
  formatDate,
  formatTime,
  buttonStyle as getButtonStyle,
} from '../../shared/autoPosterUtils';

import AutoPosterTabs from '../../shared/AutoPosterTabs';
import MediumPostEditor from './MediumPostEditor';
import MediumPostScheduler from './MediumPostScheduler';

const TITLE_MIN = 10;
const TITLE_MAX = 100;
const CONTENT_MIN = 50;

const sanitizeTags = text =>
  [
    ...new Set(
      text
        .split(',')
        .map(tag =>
          tag
            .trim()
            .replace(/^#/, '')
            .toLowerCase(),
        )
        .filter(Boolean)
        .map(tag => tag.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
        .filter(Boolean),
    ),
  ].slice(0, 5);

const getToday = () => formatDate(new Date());

const getCurrentTime = () => formatTime(new Date());

const buttonStyle = (variant, darkMode) =>
  getButtonStyle(variant, darkMode, {
    primary: '#0d6efd',
    ghostBackground: '#e9efff',
    ghostText: '#1c3f82',
  });

const validateArticle = ({
  trimmedTitle,
  titleValid,
  trimmedContent,
  contentValid,
  tags,
  urlValid,
}) => {
  if (!trimmedTitle) {
    toast.error('Please enter an article title.');
    return false;
  }

  if (!titleValid) {
    toast.error(`Title must contain ${TITLE_MIN}-${TITLE_MAX} characters.`);
    return false;
  }

  if (!trimmedContent) {
    toast.error('Please enter article content.');
    return false;
  }

  if (!contentValid) {
    toast.error(`Article content must contain at least ${CONTENT_MIN} characters.`);
    return false;
  }

  if (!tags.length) {
    toast.error('Please add at least one tag.');
    return false;
  }

  if (!urlValid) {
    toast.error('Enter a valid HTTP(S) canonical URL or leave it empty.');
    return false;
  }

  return true;
};

const validateSchedule = ({ scheduledDraft, scheduledDate, scheduledTime }) => {
  if (!scheduledDraft.trim()) {
    toast.error('Please add a draft before saving.');
    return false;
  }

  if (!scheduledDate) {
    toast.error('Please select a scheduled date.');
    return false;
  }

  if (!scheduledTime) {
    toast.error('Please select a scheduled time.');
    return false;
  }

  const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

  if (Number.isNaN(selectedDateTime.getTime())) {
    toast.error('Please select a valid date and time.');
    return false;
  }

  if (selectedDateTime <= new Date()) {
    toast.error('Please select a future date and time.');
    return false;
  }

  return true;
};

const buildScheduleData = ({
  editingId,
  trimmedTitle,
  trimmedContent,
  tags,
  tagsText,
  trimmedUrl,
  visibility,
  scheduledDate,
  scheduledTime,
  scheduledDraft,
}) => ({
  id: editingId || `medium-${Date.now()}`,
  title: trimmedTitle,
  content: trimmedContent,
  tags,
  tagsText,
  canonicalUrl: trimmedUrl,
  visibility,
  scheduledDate,
  scheduledTime,
  scheduledDraft,
});

const persistSchedule = (scheduleData, editingId, setSavedSchedules) => {
  if (editingId) {
    setSavedSchedules(previousSchedules =>
      previousSchedules.map(item => (item.id === editingId ? scheduleData : item)),
    );

    toast.success('Scheduled post updated.');
    return;
  }

  setSavedSchedules(previousSchedules => [...previousSchedules, scheduleData]);
  toast.success('Scheduled post saved.');
};

function MediumAutoPoster() {
  const darkMode = useSelector(state => state.theme?.darkMode);

  // Editor state
  const [activeTab, setActiveTab] = useState('make');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [visibility, setVisibility] = useState('draft');

  // Scheduling state
  const [scheduledDraft, setScheduledDraft] = useState('');
  const [scheduledDate, setScheduledDate] = useState(getToday);
  const [scheduledTime, setScheduledTime] = useState(getCurrentTime);
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);

  // Derived values
  const today = getToday();
  const scheduleTimeMin = scheduledDate === today ? getCurrentTime() : '';

  const tags = useMemo(() => sanitizeTags(tagsText), [tagsText]);

  const editingSchedule = useMemo(
    () => savedSchedules.find(item => item.id === editingId) || null,
    [savedSchedules, editingId],
  );

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const trimmedUrl = canonicalUrl.trim();

  const titleValid = trimmedTitle.length >= TITLE_MIN && trimmedTitle.length <= TITLE_MAX;

  const contentValid = trimmedContent.length >= CONTENT_MIN;
  const urlValid = !trimmedUrl || /^https?:\/\/\S+$/i.test(trimmedUrl);

  const readyToCopy = titleValid && contentValid && tags.length > 0 && urlValid;

  const titleInvalid = trimmedTitle.length > 0 && !titleValid;
  const contentInvalid = trimmedContent.length > 0 && !contentValid;
  const urlInvalid = !urlValid;

  const scheduleHasDraft = Boolean(scheduledDraft.trim());

  const hasInput = Boolean(trimmedTitle || trimmedContent || tagsText.trim() || trimmedUrl);

  const preview = useMemo(() => {
    if (!hasInput) return '';

    const tagList = tags.length ? tags.map(tag => `#${tag}`).join(', ') : '—';

    return [
      `Title\n${trimmedTitle || '—'}`,
      `Content\n${trimmedContent || '—'}`,
      `Tags\n${tagList}`,
      `Canonical URL\n${trimmedUrl || '—'}`,
      `Visibility\n${visibility}`,
    ].join('\n\n');
  }, [hasInput, tags, trimmedTitle, trimmedContent, trimmedUrl, visibility]);

  // Editor handlers
  const resetEditor = () => {
    setTitle('');
    setContent('');
    setTagsText('');
    setCanonicalUrl('');
    setVisibility('draft');
  };

  const handleReset = () => {
    resetEditor();
    toast.info('Editor fields cleared.');
  };

  const openMediumEditor = () => {
    window.open('https://medium.com/new-story', '_blank', 'noopener,noreferrer');
  };

  const removeTag = tagToRemove => {
    setTagsText(tags.filter(tag => tag !== tagToRemove).join(', '));
  };

  // Scheduling reset
  const resetScheduleState = () => {
    setEditingId(null);
    setScheduledDraft('');
    setScheduledDate(getToday());
    setScheduledTime(getCurrentTime());
    setScheduleAttemptedSave(false);
  };

  // Scheduling handlers
  const handleScheduleDateChange = event => {
    const nextDate = event.target.value;
    const currentTime = getCurrentTime();

    setScheduledDate(nextDate);
    setScheduleAttemptedSave(false);

    if (nextDate === today && scheduledTime < currentTime) {
      setScheduledTime(currentTime);
    }
  };

  const handleScheduleTimeChange = event => {
    setScheduledTime(event.target.value);
    setScheduleAttemptedSave(false);
  };

  const handleScheduleClick = () => {
    const isValid = validateArticle({
      trimmedTitle,
      titleValid,
      trimmedContent,
      contentValid,
      tags,
      urlValid,
    });

    if (!isValid) return;

    const now = new Date();

    setScheduledDate(formatDate(now));
    setScheduledTime(formatTime(now));
    setScheduledDraft(preview);
    setScheduleAttemptedSave(false);
    setEditingId(null);
    setActiveTab('schedule');

    toast.success('Draft moved to the Schedule tab.');
  };

  const handleSaveSchedule = () => {
    setScheduleAttemptedSave(true);

    const isValid = validateSchedule({
      scheduledDraft,
      scheduledDate,
      scheduledTime,
    });

    if (!isValid) return;

    const scheduleData = buildScheduleData({
      editingId,
      trimmedTitle,
      trimmedContent,
      tags,
      tagsText,
      trimmedUrl,
      visibility,
      scheduledDate,
      scheduledTime,
      scheduledDraft,
    });

    persistSchedule(scheduleData, editingId, setSavedSchedules);

    resetScheduleState();
    resetEditor();
    setActiveTab('make');
  };

  const editMediumSchedule = item => {
    setEditingId(item.id);
    setScheduledDraft(item.scheduledDraft || '');
    setScheduledDate(item.scheduledDate || getToday());
    setScheduledTime(item.scheduledTime || getCurrentTime());

    setTitle(item.title || '');
    setContent(item.content || '');
    setTagsText(item.tagsText || '');
    setCanonicalUrl(item.canonicalUrl || '');
    setVisibility(item.visibility || 'draft');

    setScheduleAttemptedSave(false);
    setActiveTab('schedule');
  };

  const handleDeleteSchedule = id => {
    setSavedSchedules(previousSchedules => previousSchedules.filter(item => item.id !== id));

    if (editingId === id) {
      resetScheduleState();
    }

    toast.success('Scheduled post deleted.');
  };

  const handleCancelEditing = () => {
    resetScheduleState();
    resetEditor();
    setActiveTab('make');
  };

  return (
    <div
      className={classNames(styles['medium-autoposter'], {
        [styles.dark]: darkMode,
      })}
      data-testid="medium-auto-poster"
    >
      <AutoPosterTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        styles={styles}
        tabs={[
          { id: 'make', label: '📝 Make Post' },
          { id: 'schedule', label: '⏰ Scheduled Post' },
        ]}
      />

      {activeTab === 'make' ? (
        <MediumPostEditor
          styles={styles}
          darkMode={darkMode}
          buttonStyle={buttonStyle}
          handleReset={handleReset}
          title={title}
          setTitle={setTitle}
          trimmedTitle={trimmedTitle}
          titleInvalid={titleInvalid}
          canonicalUrl={canonicalUrl}
          setCanonicalUrl={setCanonicalUrl}
          urlInvalid={urlInvalid}
          content={content}
          setContent={setContent}
          trimmedContent={trimmedContent}
          contentInvalid={contentInvalid}
          tagsText={tagsText}
          setTagsText={setTagsText}
          tags={tags}
          removeTag={removeTag}
          visibility={visibility}
          setVisibility={setVisibility}
          handleScheduleClick={handleScheduleClick}
          openMediumEditor={openMediumEditor}
          readyToCopy={readyToCopy}
          preview={preview}
        />
      ) : (
        <MediumPostScheduler
          styles={styles}
          darkMode={darkMode}
          buttonStyle={buttonStyle}
          editingSchedule={editingSchedule}
          today={today}
          scheduledDate={scheduledDate}
          scheduledTime={scheduledTime}
          scheduleTimeMin={scheduleTimeMin}
          handleScheduleDateChange={handleScheduleDateChange}
          handleScheduleTimeChange={handleScheduleTimeChange}
          scheduleAttemptedSave={scheduleAttemptedSave}
          scheduledDraft={scheduledDraft}
          scheduleHasDraft={scheduleHasDraft}
          handleSaveSchedule={handleSaveSchedule}
          editingId={editingId}
          handleCancelEditing={handleCancelEditing}
          setActiveTab={setActiveTab}
          savedSchedules={savedSchedules}
          editMediumSchedule={editMediumSchedule}
          openMediumEditor={openMediumEditor}
          handleDeleteSchedule={handleDeleteSchedule}
        />
      )}
    </div>
  );
}

export default MediumAutoPoster;
