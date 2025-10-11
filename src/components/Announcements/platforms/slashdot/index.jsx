import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const HEADLINE_MIN = 12;
const HEADLINE_MAX = 95;
const SUMMARY_MIN = 80;
const STOP_WORDS = new Set([
  'about',
  'after',
  'also',
  'another',
  'because',
  'been',
  'being',
  'between',
  'can',
  'could',
  'during',
  'each',
  'from',
  'have',
  'into',
  'more',
  'other',
  'over',
  'since',
  'some',
  'than',
  'that',
  'their',
  'there',
  'these',
  'they',
  'this',
  'through',
  'under',
  'until',
  'where',
  'which',
  'while',
  'with',
  'within',
]);

const sanitizeTags = text =>
  text
    .split(',')
    .map(tag =>
      tag
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    )
    .filter(Boolean);

const slugify = text =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();

const extractTagCandidates = (headline, summary, existing) => {
  if (Array.isArray(existing) && existing.length) return existing.slice(0, 6);
  const corpus = `${headline} ${summary}`.toLowerCase();
  const words = corpus.match(/[a-z0-9']+/g) || [];
  const candidates = [];
  for (const raw of words) {
    const cleaned = raw.replace(/'/g, '');
    if (cleaned.length < 4) continue;
    if (STOP_WORDS.has(cleaned)) continue;
    if (!candidates.includes(cleaned)) candidates.push(cleaned);
    if (candidates.length === 6) break;
  }
  return candidates;
};

const buildPreview = ({ headline, sourceUrl, dept, tags, intro }) =>
  `Headline\n${headline?.trim() || '—'}\n\nSource URL\n${sourceUrl?.trim() ||
    '—'}\n\nDept\n${dept?.trim() || '—'}\n\nTags\n${
    tags.length ? tags.join(', ') : '—'
  }\n\nIntro / Summary\n${intro?.trim() || '—'}\n`;

const topCardActions = () => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '16px',
});

const buttonStyle = (variant, darkMode) => {
  const base = {
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    padding: '10px 18px',
    transition: 'filter 0.2s ease',
  };
  if (variant === 'primary') {
    return {
      ...base,
      backgroundColor: '#0d6efd',
      color: '#fff',
    };
  }
  if (variant === 'outline') {
    return {
      ...base,
      backgroundColor: 'transparent',
      color: darkMode ? '#9bb5ff' : '#0d6efd',
      border: `1px solid ${darkMode ? '#3d4d6d' : '#0d6efd'}`,
    };
  }
  return {
    ...base,
    backgroundColor: darkMode ? '#1c2b44' : '#e9efff',
    color: darkMode ? '#cfd9f8' : '#1c3f82',
  };
};

const fieldActionRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '12px',
};

function SlashdotAutoPoster({ platform }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [headline, setHeadline] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [dept, setDept] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [intro, setIntro] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('make');
  const [scheduledDraft, setScheduledDraft] = useState('');

  const subTabs = useMemo(
    () => [
      { id: 'make', label: '📝 Make Post' },
      { id: 'schedule', label: '⏰ Scheduled Post' },
    ],
    [],
  );

  const tags = useMemo(() => sanitizeTags(tagsText), [tagsText]);

  const trimmedHeadline = headline.trim();
  const trimmedUrl = sourceUrl.trim();
  const trimmedDept = dept.trim();
  const trimmedIntro = intro.trim();

  const headlineInRange =
    trimmedHeadline.length >= HEADLINE_MIN && trimmedHeadline.length <= HEADLINE_MAX;
  const urlValid = /^https?:\/\//i.test(trimmedUrl);
  const deptValid = trimmedDept.length >= 3;
  const summaryValid = trimmedIntro.length >= SUMMARY_MIN;
  const tagsValid = tags.length > 0;

  const readyToCopy = headlineInRange && urlValid && deptValid && summaryValid && tagsValid;

  const highlightHeadline = trimmedHeadline.length > 0 && !headlineInRange;
  const highlightUrl = trimmedUrl.length > 0 && !urlValid;
  const highlightDept = trimmedDept.length > 0 && !deptValid;
  const highlightSummary = trimmedIntro.length > 0 && !summaryValid;

  const preview = useMemo(() => buildPreview({ headline, sourceUrl, dept, tags, intro }), [
    headline,
    sourceUrl,
    dept,
    tags,
    intro,
  ]);

  const copyText = async (text, label) => {
    const value = text?.trim();
    if (!value) {
      toast.warn(`Nothing to copy for ${label}.`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  };

  const handleReset = () => {
    setHeadline('');
    setSourceUrl('');
    setDept('');
    setTagsText('');
    setIntro('');
  };

  const openSlashdotSubmit = () => {
    if (typeof window !== 'undefined') {
      window.open('https://slashdot.org/submit', '_blank', 'noopener,noreferrer');
    }
  };

  const handleScheduleClick = () => {
    setScheduledDraft(preview);
    setActiveSubTab('schedule');
    toast.success('Draft moved to Schedule tab.');
  };

  const removeTag = tagToRemove => {
    const remaining = tags.filter(tag => tag !== tagToRemove);
    setTagsText(remaining.join(', '));
  };

  return (
    <div className={classNames('slashdot-autoposter', { dark: darkMode })}>
      <div className={classNames('slashdot-subtabs', { dark: darkMode })}>
        {subTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={classNames('slashdot-subtab', { active: activeSubTab === id })}
            onClick={() => setActiveSubTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSubTab === 'make' ? (
        <>
          <section className="slashdot-card">
            <h3>Slashdot Auto-Poster</h3>
            <p>
              Slashdot submissions require five pieces: a strong headline, the source URL, a short
              department slug, relevant tags, and an 80+ character summary. Use the tools below to
              build a ready-to-submit draft, then copy it (or open slashdot.org/submit) to finish
              the manual submission.
            </p>
            <div style={topCardActions()}>
              <button type="button" style={buttonStyle('outline', darkMode)} onClick={handleReset}>
                Clear fields
              </button>
            </div>
          </section>

          <div className="slashdot-grid">
            <div className={classNames('slashdot-card', { invalid: highlightHeadline })}>
              <div className="slashdot-field__header">
                <label htmlFor="slashdot-headline">Headline *</label>
                <span
                  className={classNames('slashdot-field__meta', {
                    invalid: highlightHeadline || (!trimmedHeadline && readyToCopy),
                  })}
                >
                  {headline.trim().length}/{HEADLINE_MAX}
                </span>
              </div>
              <input
                id="slashdot-headline"
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                className="slashdot-field__input"
                placeholder="e.g. Open Source Volunteers Deliver Weekly Progress Platform"
              />
              {!trimmedHeadline && (
                <p className="slashdot-field__hint">
                  Add a headline with at least {HEADLINE_MIN} characters and keep it below{' '}
                  {HEADLINE_MAX}.
                </p>
              )}
              {highlightHeadline && (
                <p className="slashdot-field__error">
                  Aim for {HEADLINE_MIN}-{HEADLINE_MAX} characters so the headline fits Slashdot’s
                  front page.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(headline, 'Headline')}
                >
                  Copy headline
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setHeadline('')}
                >
                  Clear headline
                </button>
              </div>
            </div>

            <div className={classNames('slashdot-card', { invalid: highlightUrl })}>
              <div className="slashdot-field__header">
                <label htmlFor="slashdot-url">Source URL *</label>
              </div>
              <input
                id="slashdot-url"
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                className="slashdot-field__input"
                placeholder="https://"
              />
              {!trimmedUrl && (
                <p className="slashdot-field__hint">Paste an article or project URL.</p>
              )}
              {highlightUrl && (
                <p className="slashdot-field__error">
                  Slashdot only accepts fully qualified HTTP(S) links.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(sourceUrl, 'Source URL')}
                >
                  Copy URL
                </button>
              </div>
            </div>

            <div className={classNames('slashdot-card', { invalid: highlightDept })}>
              <div className="slashdot-field__header">
                <label htmlFor="slashdot-dept">Dept *</label>
                <span className="slashdot-field__meta">short slug</span>
              </div>
              <input
                id="slashdot-dept"
                type="text"
                value={dept}
                onChange={e => setDept(e.target.value.toLowerCase())}
                className="slashdot-field__input"
                placeholder="e.g. volunteer-tech"
              />
              {!trimmedDept && <p className="slashdot-field__hint"> Department label. </p>}
              {highlightDept && (
                <p className="slashdot-field__error">
                  Use a short slug-style phrase with lowercase letters and dashes.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setDept(slugify(dept || headline || platform || 'one-community'))}
                >
                  Suggest dept
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(dept, 'Dept')}
                >
                  Copy dept
                </button>
              </div>
            </div>

            <div
              className={classNames('slashdot-card', { invalid: !tagsValid && !!tagsText.trim() })}
            >
              <div className="slashdot-field__header">
                <label htmlFor="slashdot-tags">Tags *</label>
                <span className="slashdot-field__meta">comma separated</span>
              </div>
              <textarea
                id="slashdot-tags"
                value={tagsText}
                onChange={e => setTagsText(e.target.value)}
                className="slashdot-field__input slashdot-field__textarea"
                rows={2}
                placeholder="open-source, volunteering, sustainability"
              />
              <div className="slashdot-chips">
                {tags.map(tag => (
                  <span key={tag} className="slashdot-chip">
                    <span className="slashdot-chip__label">{tag}</span>
                    <button
                      type="button"
                      className="slashdot-chip__clear"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                    >
                      ✖
                    </button>
                  </span>
                ))}
              </div>
              {!tagsValid && (
                <p className="slashdot-field__hint">
                  Provide at least one descriptive tag separated by commas.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setTagsText(extractTagCandidates(headline, intro).join(', '))}
                >
                  Suggest tags
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(tags.join(', '), 'Tags')}
                >
                  Copy tags
                </button>
              </div>
            </div>

            <div className={classNames('slashdot-card', { invalid: highlightSummary })}>
              <div className="slashdot-field__header">
                <label htmlFor="slashdot-summary">Intro / Summary *</label>
                <span
                  className={classNames('slashdot-field__meta', {
                    invalid: highlightSummary || (!trimmedIntro && readyToCopy),
                  })}
                >
                  {intro.trim().length} characters
                </span>
              </div>
              <textarea
                id="slashdot-summary"
                value={intro}
                onChange={e => setIntro(e.target.value)}
                className="slashdot-field__input slashdot-field__textarea"
                rows={5}
                placeholder="Craft a 3-4 sentence summary that highlights why the story matters to Slashdot readers."
              />
              {!trimmedIntro && (
                <p className="slashdot-field__hint">
                  Write a 2–3 sentence overview tailored for Slashdot readers.
                </p>
              )}
              {highlightSummary && (
                <p className="slashdot-field__error">
                  Slashdot requires at least {SUMMARY_MIN} characters of summary text.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(intro, 'Intro / Summary')}
                >
                  Copy summary
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setIntro('')}
                >
                  Clear summary
                </button>
              </div>
            </div>
          </div>

          <section className="slashdot-card">
            <div className="slashdot-preview__header">
              <h4>Submission preview</h4>
              <div className="slashdot-preview__actions">
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={handleScheduleClick}
                >
                  Schedule this post
                </button>
                <button
                  type="button"
                  style={buttonStyle('outline', darkMode)}
                  onClick={openSlashdotSubmit}
                >
                  Open slashdot.org/submit
                </button>
                <button
                  type="button"
                  style={{ ...buttonStyle('primary', darkMode), opacity: readyToCopy ? 1 : 0.5 }}
                  onClick={() => copyText(preview, 'Slashdot draft')}
                  disabled={!readyToCopy}
                >
                  Copy full draft
                </button>
              </div>
            </div>
            <pre className="slashdot-preview__body">{preview}</pre>
            {!readyToCopy && (
              <p className="slashdot-preview__hint">
                Fill every required field to enable copying the complete draft. Slashdot’s form
                mirrors this layout.
              </p>
            )}
          </section>
        </>
      ) : (
        <section className="slashdot-card slashdot-card--scheduler">
          <h3>Schedule Slashdot Post</h3>
          <p>Scheduled posts.</p>
          <label htmlFor="slashdot-schedule-content">Scheduled draft</label>
          <textarea
            id="slashdot-schedule-content"
            value={scheduledDraft}
            onChange={e => setScheduledDraft(e.target.value)}
            className="slashdot-field__input slashdot-scheduler__textarea"
            placeholder="Click “Schedule this post” in the composer to load content here."
            rows={8}
          />
          <div className="slashdot-scheduler__actions">
            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => copyText(scheduledDraft, 'Scheduled draft')}
            >
              Copy scheduled draft
            </button>
            <button
              type="button"
              style={buttonStyle('outline', darkMode)}
              onClick={() => setActiveSubTab('make')}
            >
              Back to Make Post
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

SlashdotAutoPoster.propTypes = {
  platform: PropTypes.string,
};

SlashdotAutoPoster.defaultProps = {
  platform: 'slashdot',
};

export default SlashdotAutoPoster;
