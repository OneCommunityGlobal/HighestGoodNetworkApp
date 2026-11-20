import React from 'react';
import classNames from 'classnames';
import { formatDateTime, formatExcerpt, copyText } from '../../shared/autoPosterUtils';

const SavedScheduleList = ({
  styles,
  buttonStyle,
  savedSchedules,
  editingId,
  darkMode,
  editMediumSchedule,
  openMediumEditor,
  handleDeleteSchedule,
}) => {
  if (savedSchedules.length === 0) {
    return (
      <div className={styles.savedList}>
        <p className={styles.empty}>No scheduled posts yet. Save one to see it listed here.</p>
      </div>
    );
  }

  return (
    <div className={styles.savedList}>
      {savedSchedules.map(item => (
        <article
          key={item.id}
          className={classNames(styles.savedItem, {
            [styles.savedItemActive]: item.id === editingId,
          })}
        >
          <div className={styles.savedHeader}>
            <h4 className={styles.savedTitle}>{item.title || 'Untitled article'}</h4>

            <span className={styles.savedMeta}>
              {formatDateTime(item.scheduledDate, item.scheduledTime)}
            </span>
          </div>

          <p className={styles.savedExcerpt}>
            {formatExcerpt(item.content, 'No content captured.')}
          </p>

          <div className={styles.savedActions}>
            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => editMediumSchedule(item)}
            >
              Edit
            </button>

            <button
              type="button"
              style={buttonStyle('outline', darkMode)}
              onClick={() => copyText(item.scheduledDraft, 'Scheduled draft')}
            >
              Copy
            </button>

            <button
              type="button"
              style={buttonStyle('outline', darkMode)}
              onClick={openMediumEditor}
            >
              Open Medium
            </button>

            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => handleDeleteSchedule(item.id)}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

const MediumPostScheduler = ({
  styles,
  darkMode,
  buttonStyle,
  editingSchedule,
  today,
  scheduledDate,
  scheduledTime,
  scheduleTimeMin,
  handleScheduleDateChange,
  handleScheduleTimeChange,
  scheduleAttemptedSave,
  scheduledDraft,
  scheduleHasDraft,
  handleSaveSchedule,
  editingId,
  handleCancelEditing,
  setActiveTab,
  savedSchedules,
  editMediumSchedule,
  openMediumEditor,
  handleDeleteSchedule,
}) => (
  <div className={styles.schedulerGrid}>
    <section className={classNames(styles.card, styles.schedulerCard)}>
      <h3>Schedule Medium Post</h3>

      <p>
        Save a local schedule entry for your article. This demo does not publish automatically at
        the selected time.
      </p>

      {editingSchedule && (
        <p className={styles.schedulerNote}>
          Editing “{editingSchedule.title || 'Untitled article'}”. Saving will update the existing
          entry.
        </p>
      )}

      <div className={styles.scheduleControls}>
        <div className={styles.scheduleField}>
          <label htmlFor="medium-schedule-date">Scheduled date *</label>

          <input
            id="medium-schedule-date"
            type="date"
            min={today}
            value={scheduledDate}
            onChange={handleScheduleDateChange}
            className={styles.input}
            aria-invalid={scheduleAttemptedSave && !scheduledDate}
          />

          {scheduleAttemptedSave && !scheduledDate && (
            <p className={styles.error}>Select a date.</p>
          )}
        </div>

        <div className={styles.scheduleField}>
          <label htmlFor="medium-schedule-time">Scheduled time *</label>

          <input
            id="medium-schedule-time"
            type="time"
            min={scheduleTimeMin}
            value={scheduledTime}
            onChange={handleScheduleTimeChange}
            className={styles.input}
            aria-invalid={scheduleAttemptedSave && !scheduledTime}
          />

          {scheduleAttemptedSave && !scheduledTime && (
            <p className={styles.error}>Select a time.</p>
          )}
        </div>
      </div>

      <label htmlFor="medium-schedule-draft">Scheduled draft</label>

      <textarea
        id="medium-schedule-draft"
        value={scheduledDraft}
        readOnly
        rows={9}
        className={classNames(styles.input, styles.schedulerTextarea)}
        placeholder="Choose Schedule this post in Make Post to load your draft."
      />

      <div className={styles.schedulerActions}>
        <button
          type="button"
          style={buttonStyle('primary', darkMode)}
          onClick={handleSaveSchedule}
          disabled={!scheduleHasDraft}
        >
          {editingId ? 'Update scheduled post' : 'Save scheduled post'}
        </button>

        <button
          type="button"
          style={buttonStyle('ghost', darkMode)}
          onClick={() => copyText(scheduledDraft, 'Scheduled draft')}
          disabled={!scheduleHasDraft}
        >
          Copy scheduled draft
        </button>

        <button
          type="button"
          style={buttonStyle('outline', darkMode)}
          onClick={editingId ? handleCancelEditing : () => setActiveTab('make')}
        >
          Back to Make Post
        </button>
      </div>
    </section>

    <section className={classNames(styles.card, styles.savedCard)}>
      <h3>Saved scheduled posts</h3>

      <p className={styles.hint}>
        Edit a saved draft, copy it, or open Medium to submit it manually.
      </p>

      <SavedScheduleList
        styles={styles}
        buttonStyle={buttonStyle}
        savedSchedules={savedSchedules}
        editingId={editingId}
        darkMode={darkMode}
        editMediumSchedule={editMediumSchedule}
        openMediumEditor={openMediumEditor}
        handleDeleteSchedule={handleDeleteSchedule}
      />
    </section>
  </div>
);

export default MediumPostScheduler;
