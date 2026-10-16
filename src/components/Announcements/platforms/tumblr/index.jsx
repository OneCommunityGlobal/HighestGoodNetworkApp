import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import styles from './Tumblr.module.css';
import httpService from '~/services/httpService';
import { buildNpfPost, isValidUrl } from './TumblrHelpers';
import { toast } from 'react-toastify';

class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const isTumblrReauth = err => err.status === 401 && err.code === 'reauth_required';

async function request(method, path, body, extraConfig = {}) {
  const config = { skipGlobalErrorToast: true, ...extraConfig };
  try {
    const res =
      method === 'get' || method === 'delete'
        ? await httpService[method](path, config)
        : await httpService[method](path, body, config);
    return res.data;
  } catch (err) {
    throw new ApiError(
      err.response?.data?.error || err.message || 'Request failed',
      err.response?.status,
      err.response?.data?.code,
    );
  }
}

const api = {
  get: (path, config) => request('get', path, undefined, config),
  post: (path, body, config) => request('post', path, body, config),
  delete: (path, config) => request('delete', path, undefined, config),
};

const MODAL_TITLES = {
  photo: 'Add image URL',
  gif: 'Add GIF URL',
  link: 'Insert link',
  audio: 'Embed audio URL',
  video: 'Embed video URL',
};

const BLOCK_LABELS = { audio: '🎧 Audio', video: '📹 Video', link: '🔗 Link' };

const newTextBlock = () => ({ id: crypto.randomUUID(), type: 'text', text: '' });

const notify = (type, message) => toast[type](message, { toastId: message });

export default function TumblrComposer() {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  // Connection
  const [connection, setConnection] = useState({ status: 'loading', blogs: [] }); // loading | connected | disconnected
  const [selectedBlog, setSelectedBlog] = useState('');

  // Core state
  const [activeSubTab, setActiveSubTab] = useState('make');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('everyone');
  const [blocks, setBlocks] = useState(() => [newTextBlock()]);
  const [scheduleAt, setScheduleAt] = useState('');

  // Modal
  const [activeModal, setActiveModal] = useState(null); // 'photo' | 'gif' | 'link' | 'audio' | 'video'
  const [modalInput, setModalInput] = useState('');
  const [modalError, setModalError] = useState('');
  const triggerRef = useRef(null);
  const modalInputRef = useRef(null);

  // Submit state
  const [submitting, setSubmitting] = useState(null); // null | 'post' | 'schedule'

  // Scheduled posts
  const [scheduled, setScheduled] = useState({ status: 'idle', items: [], error: '' });

  const isConnected = connection.status === 'connected';
  const hasContent = blocks.some(b => b.type !== 'text' || b.text.trim());
  const scheduleDate = scheduleAt ? new Date(scheduleAt) : null;
  const scheduleValid = scheduleDate && scheduleDate.getTime() > Date.now();
  const busy = submitting !== null;

  /* ── connection ── */

  const handleAuthLost = useCallback(() => {
    setConnection(prev => ({ ...prev, status: 'disconnected' }));
    notify('error', 'Your Tumblr connection expired. Reconnect to keep posting.');
  }, []);

  const loadConnection = useCallback(async () => {
    try {
      const data = await api.get('/api/tumblr/status');
      if (data.connected) {
        setConnection({ status: 'connected', blogs: data.blogs || [] });
        setSelectedBlog(prev => prev || data.blogs?.[0]?.name || '');
      } else {
        setConnection({ status: 'disconnected', blogs: [] });
      }
    } catch (err) {
      setConnection({ status: 'disconnected', blogs: [] });
      notify('error', `Couldn't check your Tumblr connection. ${err.message}`);
    }
  }, []);

  useEffect(() => {
    loadConnection();
  }, [loadConnection]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('tumblr');
    if (!p) return;
    const messages = {
      connected: { type: 'success', message: 'Tumblr connected.' },
      denied: { type: 'error', message: 'Tumblr access was denied.' },
      error: { type: 'error', message: 'Tumblr connection failed. Check server logs.' },
    };
    if (messages[p]) notify(messages[p].type, messages[p].message);
    window.history.replaceState({}, '', window.location.pathname);
    loadConnection();
  }, [loadConnection]);

  const handleConnect = async () => {
    try {
      // withCredentials lets the browser store the short-lived OAuth nonce cookie the backend sets
      const { url } = await api.get('/api/auth/tumblr/start', { withCredentials: true });
      window.location.href = url; // Tumblr's authorize URL
    } catch (err) {
      notify('error', `Couldn't start Tumblr connection. ${err.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.post('/api/tumblr/disconnect');
      setConnection({ status: 'disconnected', blogs: [] });
      setSelectedBlog('');
      notify('success', 'Tumblr disconnected.');
    } catch (err) {
      notify('error', `Couldn't disconnect. ${err.message}`);
    }
  };

  /* ── scheduled posts ── */

  const loadScheduled = useCallback(async () => {
    if (!selectedBlog) return;
    setScheduled(prev => ({ ...prev, status: 'loading', error: '' }));
    try {
      const data = await api.get(`/api/tumblr/scheduled?blog=${encodeURIComponent(selectedBlog)}`);
      setScheduled({ status: 'ready', items: data.items || [], error: '' });
    } catch (err) {
      if (isTumblrReauth(err)) handleAuthLost();
      setScheduled({ status: 'error', items: [], error: err.message });
    }
  }, [handleAuthLost, selectedBlog]);

  useEffect(() => {
    if (activeSubTab === 'schedule' && isConnected) loadScheduled();
  }, [activeSubTab, isConnected, loadScheduled]);

  const cancelScheduled = async id => {
    try {
      await api.delete(
        `/api/tumblr/scheduled/${encodeURIComponent(id)}?blog=${encodeURIComponent(selectedBlog)}`,
      );
      setScheduled(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
    } catch (err) {
      if (err.status === 401) handleAuthLost();
      else setScheduled(prev => ({ ...prev, error: `Couldn't cancel that post. ${err.message}` }));
    }
  };

  /* ── blocks ── */

  const updateText = (id, text) =>
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, text } : b)));

  const addBlock = (type, url) => {
    setBlocks(prev => {
      const media = { id: crypto.randomUUID(), type, url };
      const last = prev[prev.length - 1];
      // Reuse a trailing empty text block so the user never gets stacked empty textareas
      if (last.type === 'text' && !last.text.trim()) return [...prev.slice(0, -1), media, last];
      return [...prev, media, newTextBlock()];
    });
  };

  const removeBlock = id => {
    setBlocks(prev => {
      const next = prev.filter(b => b.id !== id);
      return next.some(b => b.type === 'text') ? next : [...next, newTextBlock()];
    });
  };

  /* ── modal ── */

  const openMediaModal = (type, e) => {
    triggerRef.current = e.currentTarget;
    setActiveModal(type);
    setModalInput('');
    setModalError('');
  };

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalError('');
    triggerRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!activeModal) return undefined;
    const onKey = e => e.key === 'Escape' && closeModal();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeModal, closeModal]);

  // Move focus into the dialog when it opens (replaces the autoFocus prop)
  useEffect(() => {
    if (activeModal) modalInputRef.current?.focus();
  }, [activeModal]);

  const handleModalSubmit = () => {
    const url = modalInput.trim();
    if (!isValidUrl(url)) {
      setModalError('Enter a full URL starting with http:// or https://');
      return;
    }
    addBlock(activeModal, url);
    setModalInput('');
    setActiveModal(null);
    setModalError('');
    triggerRef.current?.focus?.();
  };

  /* ── submit ── */

  const handleReset = () => {
    setTitle('');
    setTags('');
    setVisibility('everyone');
    setBlocks([newTextBlock()]);
    setScheduleAt('');
  };

  const submit = async mode => {
    if (busy || !hasContent || !selectedBlog) return;
    if (mode === 'schedule' && !scheduleValid) {
      notify('error', 'Pick a date and time in the future to schedule this post.');
      return;
    }

    setSubmitting(mode);
    try {
      const post = buildNpfPost({ title, blocks, tags, visibility });
      if (mode === 'post') {
        await api.post('/api/tumblr/post', { blog: selectedBlog, post });
        notify('success', `Posted to ${selectedBlog}.`);
      } else {
        await api.post('/api/tumblr/schedule', {
          blog: selectedBlog,
          post,
          scheduledAt: scheduleDate.toISOString(),
        });
        notify('success', `Scheduled for ${scheduleDate.toLocaleString()}.`);
      }
      setTitle('');
      setTags('');
      setBlocks([newTextBlock()]);
      setScheduleAt('');
    } catch (err) {
      if (isTumblrReauth(err)) handleAuthLost();
      else if (err.status === 429)
        notify('error', 'Tumblr rate limit reached. Try again in a few minutes.');
      else notify('error', err.message);
    } finally {
      setSubmitting(null);
    }
  };

  /* ── render helpers ── */

  const renderBlock = (block, index) => {
    if (block.type === 'text') {
      const isFirst = index === 0;
      return (
        <textarea
          key={block.id}
          id={isFirst ? 'tumblr-body' : undefined}
          aria-label={isFirst ? 'Post body' : 'Continue post'}
          value={block.text}
          onChange={e => updateText(block.id, e.target.value)}
          className={classNames(
            styles['tumblr-field__input'],
            styles['tumblr-composer__textarea'],
            { [styles['tumblr-composer__textarea--compact']]: !isFirst },
          )}
          placeholder={isFirst ? 'Go ahead, put anything.' : 'Keep writing…'}
          rows={isFirst ? 8 : 3}
        />
      );
    }

    const isImage = block.type === 'photo' || block.type === 'gif';
    return (
      <div key={block.id} className={styles['tumblr-block']}>
        {isImage && (
          <div className={styles['tumblr-media-preview-item']}>
            <img
              src={block.url}
              alt={block.type === 'gif' ? 'GIF attachment' : 'Attached image'}
              className={styles['tumblr-media-preview-thumb']}
            />
          </div>
        )}
        {block.type === 'video' && (
          <video src={block.url} controls className={styles['tumblr-video-preview']}>
            {/* User-supplied preview URL, so no caption file is available to point at */}
            <track kind="captions" />
          </video>
        )}
        {!isImage && (
          <div className={styles['tumblr-embed-preview']}>
            <span>
              {BLOCK_LABELS[block.type]}: <code>{block.url}</code>
            </span>
          </div>
        )}
        <button
          type="button"
          className={styles['tumblr-block-remove']}
          aria-label={`Remove ${block.type}`}
          onClick={() => removeBlock(block.id)}
        >
          ✕
        </button>
      </div>
    );
  };

  const toolButtons = [
    {
      type: 'photo',
      title: 'Add photo URL',
      cls: 'tumblr-tool-photo',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
        </svg>
      ),
    },
    { type: 'gif', title: 'Add GIF URL', cls: 'tumblr-tool-gif', icon: <span>GIF</span> },
    {
      type: 'link',
      title: 'Add link',
      cls: 'tumblr-tool-link',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
        </svg>
      ),
    },
    {
      type: 'audio',
      title: 'Add audio URL',
      cls: 'tumblr-tool-audio',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      ),
    },
    {
      type: 'video',
      title: 'Add video URL',
      cls: 'tumblr-tool-video',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
      ),
    },
  ];

  const disabledReason = !isConnected
    ? 'Connect Tumblr first'
    : !hasContent
    ? 'Add some content first'
    : '';

  /* ── render ── */

  return (
    <div className={classNames(styles['tumblr-autoposter'], { [styles.dark]: darkMode })}>
      {/* Connection */}
      <section
        className={classNames(styles['tumblr-card'], styles['tumblr-connection'])}
        aria-label="Tumblr connection"
      >
        {connection.status === 'loading' && (
          <span className={styles['tumblr-field__meta']}>Checking Tumblr connection…</span>
        )}

        {connection.status === 'disconnected' && (
          <>
            <span>Connect your Tumblr account to post or schedule.</span>
            <button
              type="button"
              className={classNames(styles['tumblr-btn'], styles['tumblr-btn--primary'])}
              onClick={handleConnect}
            >
              Connect Tumblr
            </button>
          </>
        )}

        {isConnected && (
          <>
            <div className={styles['tumblr-connection__blog']}>
              <label htmlFor="tumblr-blog">Post to</label>
              <select
                id="tumblr-blog"
                value={selectedBlog}
                onChange={e => setSelectedBlog(e.target.value)}
                className={styles['tumblr-field__input']}
              >
                {connection.blogs.map(b => (
                  <option key={b.name} value={b.name}>
                    {b.name || b.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={classNames(styles['tumblr-btn'], styles['tumblr-btn--ghost'])}
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </>
        )}
      </section>

      <div
        className={classNames(styles['tumblr-subtabs'], { [styles.dark]: darkMode })}
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'make'}
          className={classNames(styles['tumblr-subtab'], {
            [styles.active]: activeSubTab === 'make',
          })}
          onClick={() => setActiveSubTab('make')}
        >
          📝 Create Post
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'schedule'}
          className={classNames(styles['tumblr-subtab'], {
            [styles.active]: activeSubTab === 'schedule',
          })}
          onClick={() => setActiveSubTab('schedule')}
        >
          ⏰ Scheduled Post
        </button>
      </div>

      {activeSubTab === 'make' ? (
        <>
          <div className={styles['tumblr-grid']}>
            <div className={styles['tumblr-card']}>
              <div className={styles['tumblr-field__header']}>
                <label htmlFor="tumblr-title">Title</label>
                <span className={styles['tumblr-field__meta']}>optional</span>
              </div>
              <input
                id="tumblr-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={styles['tumblr-field__input']}
                placeholder="Title"
              />
            </div>

            <div className={styles['tumblr-card']}>
              <div className={styles['tumblr-field__header']}>
                <label htmlFor="tumblr-visibility">Visibility</label>
                <span className={styles['tumblr-field__meta']}>required</span>
              </div>
              <select
                id="tumblr-visibility"
                value={visibility}
                onChange={e => setVisibility(e.target.value)}
                className={styles['tumblr-field__input']}
              >
                <option value="everyone">For Everyone</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div
              className={classNames(
                styles['tumblr-card'],
                styles['tumblr-card--wide'],
                styles['tumblr-composer-card'],
              )}
            >
              <div className={styles['tumblr-composer-header']}>
                <div className={styles['tumblr-composer-toolbar']}>
                  {toolButtons.map(t => (
                    <button
                      key={t.type}
                      type="button"
                      title={t.title}
                      aria-label={t.title}
                      onClick={e => openMediaModal(t.type, e)}
                      className={classNames(styles['tumblr-tool-btn'], styles[t.cls])}
                    >
                      {t.icon}
                    </button>
                  ))}
                </div>
              </div>

              {blocks.map(renderBlock)}

              <div className={styles['tumblr-composer-footer']}>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className={styles['tumblr-tag-input']}
                  placeholder="#add tags"
                  aria-label="Tags"
                />
                <span className={styles['tumblr-field__hint']}>Separate tags with commas or #</span>
              </div>
            </div>
          </div>

          <section className={styles['tumblr-card']}>
            <div className={styles['tumblr-preview__header']}>
              <button
                type="button"
                className={classNames(styles['tumblr-btn'], styles['tumblr-btn--ghost'])}
                onClick={handleReset}
                disabled={busy}
              >
                Clear all
              </button>

              <div className={styles['tumblr-actions']}>
                <div className={styles['tumblr-schedule-field']}>
                  <label htmlFor="tumblr-schedule-at">Schedule for</label>
                  <input
                    id="tumblr-schedule-at"
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={e => setScheduleAt(e.target.value)}
                    className={styles['tumblr-field__input']}
                  />
                </div>
                <button
                  type="button"
                  className={classNames(styles['tumblr-btn'], styles['tumblr-btn--outline'])}
                  disabled={busy || !isConnected || !hasContent || !scheduleValid}
                  title={disabledReason || (!scheduleValid ? 'Pick a future date and time' : '')}
                  onClick={() => submit('schedule')}
                >
                  {submitting === 'schedule' ? 'Scheduling…' : 'Schedule'}
                </button>
                <button
                  type="button"
                  className={classNames(styles['tumblr-btn'], styles['tumblr-btn--primary'])}
                  disabled={busy || !isConnected || !hasContent}
                  title={disabledReason}
                  onClick={() => submit('post')}
                >
                  {submitting === 'post' ? 'Posting…' : 'Post Now'}
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className={styles['tumblr-scheduler__grid']}>
          <section className={classNames(styles['tumblr-card'], styles['tumblr-card--scheduler'])}>
            <h3>Scheduled Posts</h3>

            {!isConnected && (
              <p className={styles['tumblr-field__hint']}>
                Connect Tumblr to see your scheduled posts.
              </p>
            )}
            {isConnected && scheduled.status === 'loading' && (
              <p className={styles['tumblr-field__hint']}>Loading…</p>
            )}
            {isConnected && scheduled.error && (
              <p role="alert" className={styles['tumblr-error-text']}>
                {scheduled.error}
              </p>
            )}
            {isConnected && scheduled.status === 'ready' && scheduled.items.length === 0 && (
              <p className={styles['tumblr-field__hint']}>
                Nothing scheduled yet. Write a post and pick a date to schedule it.
              </p>
            )}

            {scheduled.items.length > 0 && (
              <ul className={styles['tumblr-scheduled-list']}>
                {scheduled.items.map(item => (
                  <li key={item.id} className={styles['tumblr-scheduled-item']}>
                    <div>
                      <strong>{item.blog}</strong>
                      <div className={styles['tumblr-field__meta']}>
                        {item.scheduledAt
                          ? new Date(item.scheduledAt).toLocaleString()
                          : 'Scheduled'}{' '}
                        · {item.status}
                      </div>
                      {item.preview && <div>{item.preview}</div>}
                    </div>
                    {item.status === 'pending' && (
                      <button
                        type="button"
                        className={classNames(styles['tumblr-btn'], styles['tumblr-btn--ghost'])}
                        onClick={() => cancelScheduled(item.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* URL input modal */}
      {activeModal && (
        // Pointer convenience only: Escape and the Cancel button are the keyboard paths.
        <div
          className={styles['tumblr-modal-backdrop']}
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className={styles['tumblr-modal']}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tumblr-modal-title"
          >
            <div className={styles['tumblr-modal-content']}>
              <h4 id="tumblr-modal-title">{MODAL_TITLES[activeModal]}</h4>
              <input
                ref={modalInputRef}
                type="url"
                value={modalInput}
                onChange={e => {
                  setModalInput(e.target.value);
                  if (modalError) setModalError('');
                }}
                className={styles['tumblr-field__input']}
                placeholder="https://"
                aria-label="URL"
                aria-invalid={Boolean(modalError)}
                aria-describedby={modalError ? 'tumblr-modal-error' : undefined}
                onKeyDown={e => e.key === 'Enter' && handleModalSubmit()}
              />
              {modalError && (
                <p id="tumblr-modal-error" role="alert" className={styles['tumblr-error-text']}>
                  {modalError}
                </p>
              )}
              <div className={styles['tumblr-modal__actions']}>
                <button
                  type="button"
                  className={classNames(styles['tumblr-btn'], styles['tumblr-btn--ghost'])}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={classNames(styles['tumblr-btn'], styles['tumblr-btn--primary'])}
                  onClick={handleModalSubmit}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
