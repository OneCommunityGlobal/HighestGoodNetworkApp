import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './LiveJournalAutoPoster.module.css';
import AutoPosterTabs from '../../shared/AutoPosterTabs';
import LiveJournalPostEditor from './LiveJournalPostEditor';
import LiveJournalScheduler from './LiveJournalScheduler';

import {
  formatDate,
  formatTime,
  normalizeScheduleDateTime,
  buttonStyle as getButtonStyle,
} from '../../shared/autoPosterUtils';

const SUBJECT_MAX = 255;

const sanitizeTags = text =>
  [
    ...new Map(
      text
        .split(',')
        .map(tag =>
          tag
            .trim()
            .replace(/^#/, '')
            .trim(),
        )
        .filter(Boolean)
        .map(tag => [tag.toLowerCase(), tag]),
    ).values(),
  ].slice(0, 10);

const makeId = () => `livejournal-${crypto.randomUUID()}`;

const buttonStyle = (variant, darkMode) =>
  getButtonStyle(variant, darkMode, {
    primary: '#0d6efd',
    ghostBackground: '#e9efff',
    ghostText: '#1c3f82',
  });

const validateEntry = ({ subject, content }) => {
  if (!subject.trim()) {
    toast.error('Please enter an entry subject.');
    return false;
  }

  if (subject.trim().length > SUBJECT_MAX) {
    toast.error(`Subject cannot exceed ${SUBJECT_MAX} characters.`);
    return false;
  }

  if (!content.trim()) {
    toast.error('Please enter entry content.');
    return false;
  }

  return true;
};

function LiveJournalAutoPoster() {
  const darkMode = useSelector(state => state.theme?.darkMode);

  const [activeTab, setActiveTab] = useState('make');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [privacy, setPrivacy] = useState('public');

  const [scheduledDraft, setScheduledDraft] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => formatDate(new Date()));
  const [scheduledTime, setScheduledTime] = useState(() => formatTime(new Date()));

  const [savedSchedules, setSavedSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);

  const tags = useMemo(() => sanitizeTags(tagsText), [tagsText]);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const trimmedUrl = originalUrl.trim();

  const urlValid = !trimmedUrl || /^https?:\/\/\S+$/i.test(trimmedUrl);
  const titleValid = trimmedTitle.length > 0 && trimmedTitle.length <= SUBJECT_MAX;
  const contentValid = Boolean(trimmedContent);
  const readyToCopy = titleValid && contentValid && urlValid;

  const titleInvalid = trimmedTitle.length > 0 && !titleValid;
  const contentInvalid = !contentValid && Boolean(content.trim());
  const urlInvalid = !urlValid;

  const hasInput = Boolean(trimmedTitle || trimmedContent || tagsText.trim() || trimmedUrl);

  const buildDraft = () => {
    const tagList = tags.length ? tags.map(tag => `#${tag}`).join(', ') : 'None';

    return [
      `Subject\n${trimmedTitle || 'Untitled entry'}`,
      `Content\n${trimmedContent || '—'}`,
      `Tags\n${tagList}`,
      `Original URL\n${trimmedUrl || '—'}`,
      `Privacy\n${privacy}`,
    ].join('\n\n');
  };

  const preview = useMemo(() => (hasInput ? buildDraft() : ''), [
    title,
    content,
    tagsText,
    originalUrl,
    privacy,
    hasInput,
  ]);

  const editingSchedule = useMemo(
    () => savedSchedules.find(item => item.id === editingId) || null,
    [savedSchedules, editingId],
  );

  const scheduleHasDraft = Boolean(scheduledDraft.trim());

  const resetEditor = () => {
    setTitle('');
    setContent('');
    setTagsText('');
    setOriginalUrl('');
    setPrivacy('public');
  };

  const handleReset = () => {
    resetEditor();
    toast.info('Editor fields cleared.');
  };

  const openLiveJournalEditor = () => {
    window.open('https://www.livejournal.com/update.bml', '_blank', 'noopener,noreferrer');
  };

  const handleScheduleClick = () => {
    const isValid = validateEntry({
      subject: trimmedTitle,
      content: trimmedContent,
    });

    if (!isValid || !urlValid) {
      if (!urlValid) {
        toast.error('Enter a valid HTTP(S) URL or leave it empty.');
      }
      return;
    }

    const now = new Date();

    setScheduledDate(formatDate(now));
    setScheduledTime(formatTime(now));
    setScheduledDraft(preview);
    setScheduleAttemptedSave(false);
    setEditingId(null);
    setActiveTab('schedule');

    toast.success('Entry moved to the Schedule tab.');
  };

  const handleScheduleDateChange = event => {
    const nextDate = event.target.value;

    if (!nextDate) return;

    const todayDate = formatDate(new Date());
    const safeDate = [nextDate, todayDate].sort((a, b) => a.localeCompare(b))[1];

    setScheduledDate(safeDate);
    setScheduleAttemptedSave(false);

    if (safeDate === todayDate) {
      const currentTime = formatTime(new Date());

      setScheduledTime(
        previous => [previous || currentTime, currentTime].sort((a, b) => a.localeCompare(b))[1],
      );
    }
  };

  const handleScheduleTimeChange = event => {
    const nextTime = event.target.value;

    if (!nextTime) return;

    if (scheduledDate === formatDate(new Date())) {
      const currentTime = formatTime(new Date());

      setScheduledTime([nextTime, currentTime].sort((a, b) => a.localeCompare(b))[1]);
    } else {
      setScheduledTime(nextTime);
    }

    setScheduleAttemptedSave(false);
  };

  const resetSchedule = () => {
    setScheduledDraft('');
    setScheduledDate(formatDate(new Date()));
    setScheduledTime(formatTime(new Date()));
    setScheduleAttemptedSave(false);
    setEditingId(null);
    setActiveTab('make');
  };

  const handleSaveSchedule = () => {
    setScheduleAttemptedSave(true);

    if (!scheduleHasDraft) {
      toast.warn('Add an entry to the schedule first.');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Choose a schedule date and time.');
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);

    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      toast.error('Choose a future date and time.');
      return;
    }

    const id = editingId || makeId();

    const record = {
      id,
      title: trimmedTitle,
      content: trimmedContent,
      tags: [...tags],
      tagsText,
      originalUrl: trimmedUrl,
      privacy,
      scheduledDraft: scheduledDraft.trim(),
      scheduledDate,
      scheduledTime,
      updatedAt: new Date().toISOString(),
    };

    setSavedSchedules(previous => [record, ...previous.filter(item => item.id !== id)]);

    toast.success(
      editingId
        ? 'Scheduled entry updated for this session.'
        : 'Scheduled entry saved for this session.',
    );

    resetEditor();
    resetSchedule();
  };

  const handleEditSchedule = item => {
    const { date, time } = normalizeScheduleDateTime(item.scheduledDate, item.scheduledTime);

    setTitle(item.title || '');
    setContent(item.content || '');
    setTagsText(item.tagsText || '');
    setOriginalUrl(item.originalUrl || '');
    setPrivacy(item.privacy || 'public');
    setScheduledDraft(item.scheduledDraft || '');
    setScheduledDate(date);
    setScheduledTime(time);
    setEditingId(item.id);
    setScheduleAttemptedSave(false);
    setActiveTab('schedule');

    toast.info('Loaded scheduled entry for editing.');
  };

  const handleDeleteSchedule = id => {
    setSavedSchedules(previous => previous.filter(item => item.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setScheduledDraft('');
    }

    toast.info('Scheduled entry removed from this session.');
  };

  const removeTag = tagToRemove => {
    setTagsText(tags.filter(tag => tag !== tagToRemove).join(', '));
  };

  const today = formatDate(new Date());
  const scheduleTimeMin = scheduledDate === today ? formatTime(new Date()) : undefined;

  return (
    <div
      className={classNames(styles['medium-autoposter'], {
        [styles.dark]: darkMode,
      })}
      data-testid="livejournal-auto-poster"
    >
      <AutoPosterTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        styles={styles}
        tabs={[
          { id: 'make', label: '📝 Make Entry' },
          { id: 'schedule', label: '⏰ Scheduled Entry' },
        ]}
      />

      {activeTab === 'make' ? (
        <LiveJournalPostEditor
          styles={styles}
          darkMode={darkMode}
          buttonStyle={buttonStyle}
          handleReset={handleReset}
          title={title}
          setTitle={setTitle}
          titleInvalid={titleInvalid}
          trimmedTitle={trimmedTitle}
          originalUrl={originalUrl}
          setOriginalUrl={setOriginalUrl}
          urlInvalid={urlInvalid}
          content={content}
          setContent={setContent}
          contentInvalid={contentInvalid}
          trimmedContent={trimmedContent}
          tagsText={tagsText}
          setTagsText={setTagsText}
          tags={tags}
          removeTag={removeTag}
          privacy={privacy}
          setPrivacy={setPrivacy}
          handleScheduleClick={handleScheduleClick}
          openLiveJournalEditor={openLiveJournalEditor}
          readyToCopy={readyToCopy}
          preview={preview}
        />
      ) : (
        <LiveJournalScheduler
          styles={styles}
          darkMode={darkMode}
          buttonStyle={buttonStyle}
          editingSchedule={editingSchedule}
          today={today}
          scheduledDate={scheduledDate}
          handleScheduleDateChange={handleScheduleDateChange}
          scheduleAttemptedSave={scheduleAttemptedSave}
          scheduledTime={scheduledTime}
          scheduleTimeMin={scheduleTimeMin}
          handleScheduleTimeChange={handleScheduleTimeChange}
          scheduledDraft={scheduledDraft}
          scheduleHasDraft={scheduleHasDraft}
          handleSaveSchedule={handleSaveSchedule}
          editingId={editingId}
          setActiveTab={setActiveTab}
          savedSchedules={savedSchedules}
          handleEditSchedule={handleEditSchedule}
          openLiveJournalEditor={openLiveJournalEditor}
          handleDeleteSchedule={handleDeleteSchedule}
        />
      )}
    </div>
  );
}

export default LiveJournalAutoPoster;
