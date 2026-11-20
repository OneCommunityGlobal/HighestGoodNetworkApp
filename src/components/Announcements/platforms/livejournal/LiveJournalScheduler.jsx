import React from 'react';
import classNames from 'classnames';
import { formatDateTime, formatExcerpt, copyText } from '../../shared/autoPosterUtils';

function LiveJournalScheduler({
  styles,
  darkMode,
  buttonStyle,
  editingSchedule,
  today,
  scheduledDate,
  handleScheduleDateChange,
  scheduleAttemptedSave,
  scheduledTime,
  scheduleTimeMin,
  handleScheduleTimeChange,
  scheduledDraft,
  scheduleHasDraft,
  handleSaveSchedule,
  editingId,
  setActiveTab,
  savedSchedules,
  handleEditSchedule,
  openLiveJournalEditor,
  handleDeleteSchedule,
}) {
  return (
    <div className={styles.schedulerGrid}>
      <section className={classNames(styles.card, styles.schedulerCard)}>
        <h3>Schedule LiveJournal Entry</h3>

        <p>
          Save a local schedule entry for your LiveJournal post. This does not automatically publish
          the entry at the selected time.
        </p>

        {editingSchedule && (
          <p className={styles.schedulerNote}>
            Editing "{editingSchedule.title || 'Untitled entry'}". Saving will update the existing
            entry.
          </p>
        )}

        <div className={styles.scheduleControls}>
          <div className={styles.scheduleField}>
            <label htmlFor="livejournal-schedule-date">Scheduled date *</label>

            <input
              id="livejournal-schedule-date"
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
            <label htmlFor="livejournal-schedule-time">Scheduled time *</label>

            <input
              id="livejournal-schedule-time"
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

        <label htmlFor="livejournal-schedule-draft">Scheduled entry</label>

        <textarea
          id="livejournal-schedule-draft"
          value={scheduledDraft}
          readOnly
          rows={9}
          className={classNames(styles.input, styles.schedulerTextarea)}
          placeholder="Choose Schedule this entry in Make Entry to load your draft."
        />

        <div className={styles.schedulerActions}>
          <button
            type="button"
            style={buttonStyle('primary', darkMode)}
            onClick={handleSaveSchedule}
            disabled={!scheduleHasDraft}
          >
            {editingId ? 'Update scheduled entry' : 'Save scheduled entry'}
          </button>

          <button
            type="button"
            style={buttonStyle('ghost', darkMode)}
            onClick={() => copyText(scheduledDraft, 'Scheduled entry')}
            disabled={!scheduleHasDraft}
          >
            Copy scheduled entry
          </button>

          <button
            type="button"
            style={buttonStyle('outline', darkMode)}
            onClick={() => setActiveTab('make')}
          >
            Back to Make Entry
          </button>
        </div>
      </section>

      <section className={classNames(styles.card, styles.savedCard)}>
        <h3>Saved scheduled entries</h3>

        <p className={styles.hint}>
          Edit a saved entry, copy it, or open LiveJournal to publish it manually.
        </p>

        <div className={styles.savedList}>
          {savedSchedules.length === 0 ? (
            <p className={styles.empty}>
              No scheduled entries yet. Save one to see it listed here.
            </p>
          ) : (
            savedSchedules.map(item => (
              <article
                key={item.id}
                className={classNames(styles.savedItem, {
                  [styles.savedItemActive]: item.id === editingId,
                })}
              >
                <div className={styles.savedHeader}>
                  <h4 className={styles.savedTitle}>{item.title || 'Untitled entry'}</h4>

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
                    onClick={() => handleEditSchedule(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    style={buttonStyle('outline', darkMode)}
                    onClick={() => copyText(item.scheduledDraft, 'Scheduled entry')}
                  >
                    Copy
                  </button>

                  <button
                    type="button"
                    style={buttonStyle('outline', darkMode)}
                    onClick={openLiveJournalEditor}
                  >
                    Open LiveJournal
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
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default LiveJournalScheduler;
