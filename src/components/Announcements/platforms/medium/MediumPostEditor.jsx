import React from 'react';
import classNames from 'classnames';
import { copyText } from '../../shared/autoPosterUtils';

const TITLE_MIN = 10;
const TITLE_MAX = 100;
const CONTENT_MIN = 50;

const MediumPostEditor = ({
  styles,
  darkMode,
  buttonStyle,
  handleReset,
  title,
  setTitle,
  trimmedTitle,
  titleInvalid,
  canonicalUrl,
  setCanonicalUrl,
  urlInvalid,
  content,
  setContent,
  trimmedContent,
  contentInvalid,
  tagsText,
  setTagsText,
  tags,
  removeTag,
  visibility,
  setVisibility,
  handleScheduleClick,
  openMediumEditor,
  readyToCopy,
  preview,
}) => (
  <>
    <section className={styles.card}>
      <h3>Medium Auto-Poster</h3>
      <p>
        Create and format a Medium article draft. Add a title, article content, relevant tags, and
        optional canonical URL. Preview your draft, copy the content, or open Medium to submit it
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
          <label htmlFor="medium-title">Article title *</label>
          <span
            className={classNames(styles.fieldMeta, {
              [styles.invalidText]: titleInvalid,
            })}
          >
            {title.length}/{TITLE_MAX}
          </span>
        </div>

        <input
          id="medium-title"
          value={title}
          maxLength={TITLE_MAX}
          onChange={event => setTitle(event.target.value)}
          className={styles.input}
          placeholder="Write a clear, engaging title"
        />

        {!trimmedTitle && <p className={styles.hint}>Use at least {TITLE_MIN} characters.</p>}

        {titleInvalid && (
          <p className={styles.error}>
            The title must contain {TITLE_MIN}-{TITLE_MAX} characters.
          </p>
        )}

        <div className={styles.fieldActions}>
          <button
            type="button"
            style={buttonStyle('ghost', darkMode)}
            onClick={() => copyText(title, 'Title')}
          >
            Copy title
          </button>

          <button type="button" style={buttonStyle('ghost', darkMode)} onClick={() => setTitle('')}>
            Clear title
          </button>
        </div>
      </section>

      <section
        className={classNames(styles.card, {
          [styles.invalid]: urlInvalid,
        })}
      >
        <div className={styles.fieldHeader}>
          <label htmlFor="medium-canonical">Canonical URL</label>
          <span className={styles.fieldMeta}>optional</span>
        </div>

        <input
          id="medium-canonical"
          type="url"
          value={canonicalUrl}
          onChange={event => setCanonicalUrl(event.target.value)}
          className={styles.input}
          placeholder="https://example.com/original-article"
        />

        <p className={urlInvalid ? styles.error : styles.hint}>
          {urlInvalid
            ? 'Enter a valid HTTP(S) URL.'
            : 'Add the original article URL if this content was published elsewhere.'}
        </p>

        <div className={styles.fieldActions}>
          <button
            type="button"
            style={buttonStyle('ghost', darkMode)}
            onClick={() => copyText(canonicalUrl, 'Canonical URL')}
          >
            Copy URL
          </button>

          <button
            type="button"
            style={buttonStyle('ghost', darkMode)}
            onClick={() => setCanonicalUrl('')}
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
          <label htmlFor="medium-content">Article content *</label>
          <span
            className={classNames(styles.fieldMeta, {
              [styles.invalidText]: contentInvalid,
            })}
          >
            {content.length.toLocaleString()} characters
          </span>
        </div>

        <textarea
          id="medium-content"
          value={content}
          onChange={event => setContent(event.target.value)}
          className={classNames(styles.input, styles.textarea)}
          rows={9}
          placeholder="Write your article here..."
        />

        {!trimmedContent && <p className={styles.hint}>Add the main body of your article.</p>}

        {contentInvalid && (
          <p className={styles.error}>Add at least {CONTENT_MIN} characters of article content.</p>
        )}

        <div className={styles.fieldActions}>
          <button
            type="button"
            style={buttonStyle('ghost', darkMode)}
            onClick={() => copyText(content, 'Article content')}
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

      <section
        className={classNames(styles.card, {
          [styles.invalid]: !tags.length && Boolean(tagsText.trim()),
        })}
      >
        <div className={styles.fieldHeader}>
          <label htmlFor="medium-tags">Tags *</label>
          <span className={styles.fieldMeta}>up to 5 tags</span>
        </div>

        <textarea
          id="medium-tags"
          value={tagsText}
          onChange={event => setTagsText(event.target.value)}
          className={classNames(styles.input, styles.tagInput)}
          rows={2}
          placeholder="Technology, Software Engineering, AI"
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

        {!tags.length && <p className={styles.hint}>Add comma-separated tags for your article.</p>}

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
          <label htmlFor="medium-visibility">Article visibility</label>
        </div>

        <select
          id="medium-visibility"
          value={visibility}
          onChange={event => setVisibility(event.target.value)}
          className={styles.input}
        >
          <option value="draft">Draft</option>
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
        </select>

        <p className={styles.hint}>
          This setting is part of the local draft preview only. It does not change any Medium
          publishing settings.
        </p>
      </section>
    </div>

    <section className={styles.card}>
      <div className={styles.previewHeader}>
        <h4>Article preview</h4>

        <div className={styles.previewActions}>
          <button
            type="button"
            style={buttonStyle('ghost', darkMode)}
            onClick={handleScheduleClick}
          >
            Schedule this post
          </button>

          <button type="button" style={buttonStyle('outline', darkMode)} onClick={openMediumEditor}>
            Open Medium editor
          </button>

          <button
            type="button"
            style={{
              ...buttonStyle('primary', darkMode),
              opacity: readyToCopy ? 1 : 0.5,
            }}
            onClick={() => copyText(preview, 'Medium draft')}
            disabled={!readyToCopy}
          >
            Copy full draft
          </button>
        </div>
      </div>

      <pre className={styles.previewBody}>
        {preview || 'Your article preview will appear here as you type.'}
      </pre>

      {!readyToCopy && (
        <p className={styles.previewHint}>
          Add a valid title, at least {CONTENT_MIN} characters of content, and one tag to enable
          copying the complete draft.
        </p>
      )}
    </section>
  </>
);

export default MediumPostEditor;
