import React from 'react';
import classNames from 'classnames';
import { copyText } from '../../shared/autoPosterUtils';

const SUBJECT_MAX = 255;

function LiveJournalPostEditor({
  styles,
  darkMode,
  buttonStyle,
  handleReset,
  title,
  setTitle,
  titleInvalid,
  trimmedTitle,
  originalUrl,
  setOriginalUrl,
  urlInvalid,
  content,
  setContent,
  contentInvalid,
  trimmedContent,
  tagsText,
  setTagsText,
  tags,
  removeTag,
  privacy,
  setPrivacy,
  handleScheduleClick,
  openLiveJournalEditor,
  readyToCopy,
  preview,
}) {
  return (
    <>
      <section className={styles.card}>
        <h3>LiveJournal Auto-Poster</h3>

        <p>
          Create and format a LiveJournal entry. Add a subject, entry content, optional tags, and an
          original article URL. Preview and copy your entry, or open LiveJournal to publish it
          manually.
        </p>

        <div className={styles.topActions}>
          <button type="button" style={buttonStyle('outline', darkMode)} onClick={handleReset}>
            Clear fields
          </button>
        </div>
      </section>

      <div className={styles.grid}>
        <section
          className={classNames(styles.card, {
            [styles.invalid]: titleInvalid,
          })}
        >
          <div className={styles.fieldHeader}>
            <label htmlFor="livejournal-title">Entry subject *</label>

            <span
              className={classNames(styles.fieldMeta, {
                [styles.invalidText]: titleInvalid,
              })}
            >
              {title.length}/{SUBJECT_MAX}
            </span>
          </div>

          <input
            id="livejournal-title"
            value={title}
            maxLength={SUBJECT_MAX}
            onChange={event => setTitle(event.target.value)}
            className={styles.input}
            placeholder="Enter your entry subject"
          />

          {!trimmedTitle && (
            <p className={styles.hint}>Add a subject for your LiveJournal entry.</p>
          )}

          {titleInvalid && (
            <p className={styles.error}>Subject cannot exceed {SUBJECT_MAX} characters.</p>
          )}

          <div className={styles.fieldActions}>
            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => copyText(title, 'Subject')}
            >
              Copy subject
            </button>

            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => setTitle('')}
            >
              Clear subject
            </button>
          </div>
        </section>

        <section
          className={classNames(styles.card, {
            [styles.invalid]: urlInvalid,
          })}
        >
          <div className={styles.fieldHeader}>
            <label htmlFor="livejournal-url">Original article URL</label>
            <span className={styles.fieldMeta}>optional</span>
          </div>

          <input
            id="livejournal-url"
            type="url"
            value={originalUrl}
            onChange={event => setOriginalUrl(event.target.value)}
            className={styles.input}
            placeholder="https://example.com/article"
          />

          <p className={urlInvalid ? styles.error : styles.hint}>
            {urlInvalid
              ? 'Enter a valid HTTP(S) URL.'
              : 'Add a link to the original article if applicable.'}
          </p>

          <div className={styles.fieldActions}>
            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => copyText(originalUrl, 'Original URL')}
            >
              Copy URL
            </button>

            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => setOriginalUrl('')}
            >
              Clear URL
            </button>
          </div>
        </section>

        <section
          className={classNames(styles.card, {
            [styles.invalid]: contentInvalid,
          })}
        >
          <div className={styles.fieldHeader}>
            <label htmlFor="livejournal-content">Entry content *</label>

            <span className={styles.fieldMeta}>{content.length.toLocaleString()} characters</span>
          </div>

          <textarea
            id="livejournal-content"
            value={content}
            onChange={event => setContent(event.target.value)}
            className={classNames(styles.input, styles.textarea)}
            rows={9}
            placeholder="Write your LiveJournal entry here..."
          />

          {!trimmedContent && <p className={styles.hint}>Add the main body of your entry.</p>}

          <div className={styles.fieldActions}>
            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => copyText(content, 'Entry content')}
            >
              Copy content
            </button>

            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => setContent('')}
            >
              Clear content
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.fieldHeader}>
            <label htmlFor="livejournal-tags">Tags</label>
            <span className={styles.fieldMeta}>Up to 10 tags</span>
          </div>

          <textarea
            id="livejournal-tags"
            value={tagsText}
            onChange={event => setTagsText(event.target.value)}
            className={classNames(styles.input, styles.tagInput)}
            rows={2}
            placeholder="Technology, Personal, Travel"
          />

          <div className={styles.chips}>
            {tags.map(tag => (
              <span className={styles.chip} key={tag}>
                <span>{tag}</span>

                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className={styles.chipClear}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <p className={styles.hint}>Tags are optional. Separate multiple tags with commas.</p>

          <div className={styles.fieldActions}>
            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => copyText(tags.join(', '), 'Tags')}
            >
              Copy tags
            </button>

            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => setTagsText('')}
            >
              Clear tags
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.fieldHeader}>
            <label htmlFor="livejournal-privacy">Entry privacy</label>
          </div>

          <select
            className={styles['privacy-select']}
            value={privacy}
            onChange={event => setPrivacy(event.target.value)}
          >
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="private">Private</option>
          </select>

          <p className={styles.hint}>
            Select who should be able to view your entry. This is included in the local preview
            only. You must select the actual privacy setting in LiveJournal when publishing.
          </p>
        </section>
      </div>

      <section className={styles.card}>
        <div className={styles.previewHeader}>
          <h4>LiveJournal entry preview</h4>

          <div className={styles.previewActions}>
            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={handleScheduleClick}
            >
              Schedule this entry
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
              style={{
                ...buttonStyle('primary', darkMode),
                opacity: readyToCopy ? 1 : 0.5,
              }}
              onClick={() => copyText(preview, 'LiveJournal entry')}
              disabled={!readyToCopy}
            >
              Copy full entry
            </button>
          </div>
        </div>

        <pre className={styles.previewBody}>
          {preview || 'Your entry preview will appear here as you type.'}
        </pre>

        {!readyToCopy && (
          <p className={styles.previewHint}>
            Add a subject and entry content to enable copying the complete entry.
          </p>
        )}
      </section>
    </>
  );
}

export default LiveJournalPostEditor;
