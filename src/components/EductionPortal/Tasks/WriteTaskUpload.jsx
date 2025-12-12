import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './WriteTaskUpload.module.css';
import UploadPanel from './UploadPanel';
import CommentBox from './CommentBox';
import CommentList from './CommentList';
import { ToastContainer } from './Toast';
import useToast from './useToast';

const Icon = ({ name, className, darkMode = false }) => {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', 'aria-hidden': true };
  const stroke = {
    stroke: darkMode ? '#e0e0e0' : '#000',
    strokeWidth: 2,
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'home':
      return (
        <svg {...common} className={className}>
          <path d="M3 11.5 12 3l9 8.5" {...stroke} />
          <path
            d="M5 12.5v7a1.5 1.5 0 0 0 1.5 1.5H10v-6h4v6h3.5A1.5 1.5 0 0 0 19 19.5v-7"
            {...stroke}
          />
        </svg>
      );
    case 'stats':
      return (
        <svg {...common} className={className}>
          <rect x="3" y="10" width="4" height="10" {...stroke} />
          <rect x="10" y="6" width="4" height="14" {...stroke} />
          <rect x="17" y="13" width="4" height="7" {...stroke} />
        </svg>
      );
    case 'folder':
      return (
        <svg {...common} className={className}>
          <path
            d="M3 6h6l2 2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
            fill="#000"
          />
        </svg>
      );
    case 'star':
      return (
        <svg {...common} className={className}>
          <path
            d="M12 3.5l2.9 5.88 6.5.94-4.7 4.58 1.1 6.45L12 18.5 6.2 22.35l1.1-6.45-4.7-4.58 6.5-.94L12 3.5z"
            {...stroke}
          />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common} className={className}>
          <rect x="3" y="5" width="18" height="16" rx="2" {...stroke} />
          <path d="M7 3v4M17 3v4M3 9h18" {...stroke} />
        </svg>
      );
    case 'pen':
      return (
        <svg {...common} className={className}>
          <path
            d="M3 21l3.5-.7L19.2 7.6a2 2 0 0 0 0-2.8L17.2 2.8a2 2 0 0 0-2.8 0L5.8 11.4 5 15.5 3 21z"
            {...stroke}
          />
          <path d="M12.5 5.5l6 6" {...stroke} />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common} className={className}>
          <path
            d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8.5 4a6.5 6.5 0 0 0-.08-1l2.1-1.63-2-3.46-2.53 1a6.7 6.7 0 0 0-1.73-1l-.38-2.7H10.1l-.38 2.7a6.7 6.7 0 0 0-1.73 1l-2.53-1-2 3.46L3.56 11a6.5 6.5 0 0 0 0 2l-2.1 1.63 2 3.46 2.53-1c.52.42 1.1.77 1.73 1l.38 2.7h4.78l.38-2.7c.63-.23 1.21-.58 1.73-1l2.53 1 2-3.46L20.42 13c.05-.33.08-.66.08-1z"
            fill="#000"
          />
        </svg>
      );
    case 'logout':
      return (
        <svg {...common} className={className}>
          <path d="M15 12H3" {...stroke} />
          <path d="M6 9l-3 3 3 3" {...stroke} />
          <rect x="15" y="4" width="6" height="16" rx="2" {...stroke} />
        </svg>
      );
    case 'link':
      return (
        <svg {...common} className={className}>
          <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 12" {...stroke} />
          <path d="M14 11a5 5 0 0 1 0 7L12.5 20a5 5 0 0 1-7-7L7 12" {...stroke} />
        </svg>
      );
    case 'comment':
      return (
        <svg {...common} className={className}>
          <path
            d="M21 15a3 3 0 0 1-3 3H9l-4 3v-3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z"
            {...stroke}
          />
          <path d="M8 8h8M8 12h6" {...stroke} />
        </svg>
      );
    case 'upload':
      return (
        <svg {...common} className={className}>
          <path d="M12 16V6" {...stroke} />
          <path d="M8.5 9.5 12 6l3.5 3.5" {...stroke} />
          <path d="M4 18h16" {...stroke} />
        </svg>
      );
    case 'folder-line':
      return (
        <svg {...common} className={className}>
          <path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...stroke} />
        </svg>
      );
    default:
      return null;
  }
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  darkMode: PropTypes.bool,
};

const BellIcon = ({ darkMode = false }) => (
  <svg className={styles.bellIcon} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14v-3a6 6 0 10-12 0v3a2 2 0 0 1-.6 1.4L4 17h5"
      fill="none"
      stroke={darkMode ? '#e0e0e0' : '#000'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.7 21a2 2 0 0 1-3.4 0"
      fill="none"
      stroke={darkMode ? '#e0e0e0' : '#000'}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

BellIcon.propTypes = {
  darkMode: PropTypes.bool,
};

function cleanName(raw) {
  let s = String(raw || '').trim();

  const mWelcome = s.match(/Welcome,\s*([^\s,]+)/i);
  if (mWelcome) s = mWelcome[1];

  const word = s.match(/[A-Za-z][A-Za-z'-]*/);
  s = word ? word[0] : s;

  s = s.replace(/Hello.*$/i, '');

  const camel = s.match(/^([A-Z][a-z]+)(?=[A-Z][a-z]+)/);
  if (camel) s = camel[1];

  s = s.replace(/[^A-Za-z'-]/g, '').trim();

  return s || 'Student Name';
}

function resolveUserName(location) {
  const st =
    location?.state?.user?.preferredName ||
    location?.state?.user?.firstName ||
    location?.state?.preferredName ||
    location?.state?.firstName ||
    location?.state?.name;
  if (st) return cleanName(st);

  const sp = new URLSearchParams(location.search);
  const q = sp.get('name') || sp.get('firstName') || sp.get('user') || sp.get('u');
  if (q) return cleanName(q);

  const candidates = ['currentUser', 'user', 'hgn_user', 'profile', 'authUser', 'userInfo'];
  for (const key of candidates) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const o = JSON.parse(raw);
      const nm =
        o?.preferredName ||
        o?.firstName ||
        o?.first_name ||
        o?.name ||
        (o?.user && (o.user.preferredName || o.user.firstName || o.user.name));
      if (nm) return cleanName(nm);
    } catch {
      /* ignore */
    }
  }
  const flat =
    localStorage.getItem('preferredName') ||
    localStorage.getItem('firstName') ||
    localStorage.getItem('name');
  if (flat) return cleanName(flat);

  return null; // let DOM sniff attempt next
}

// As a last resort, scan the page for "Welcome, <Name>"
function sniffDomWelcome() {
  const nodes = Array.from(document.body.querySelectorAll('body, body *')).slice(0, 2500);
  for (const n of nodes) {
    const t = (n.textContent || '').trim();
    if (!t) continue;
    const m = t.match(/Welcome,\s*([A-Za-z][A-Za-z'-]*)/);
    if (m) return cleanName(m[1]);
  }
  return null;
}

const isValidUrl = v => /^https?:\/\/\S+/i.test(v?.trim() || '');
export default function WriteTaskUpload() {
  const { taskId } = useParams();
  const location = useLocation();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const authUser = useSelector(state => state.auth?.user);
  const currentUserId = authUser?.userid || null;

  const [userName, setUserName] = useState('Student Name');
  useEffect(() => {
    let name = resolveUserName(location);
    if (!name) name = sniffDomWelcome();
    setUserName(name || 'Student Name');
  }, [location]);

  // Labels
  const sp = new URLSearchParams(location.search);
  const unitLabel = location.state?.unitLabel || sp.get('unit') || 'Unit 1: Selection';
  const tradeLabel = location.state?.tradeLabel || sp.get('trade') || 'Choose Trades person (4%)';

  // Link & comment (link requires comment; files don't)
  const [comment, setComment] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [errLink, setErrLink] = useState('');
  const [errComment, setErrComment] = useState('');
  const linkRef = useRef(null);
  const commentRef = useRef(null);

  // Unified items (files + links)
  const [items, setItems] = useState([]);

  const { toasts, removeToast, success, error } = useToast();

  const loadCommentsFromStorage = () => {
    try {
      const saved = localStorage.getItem(`task-comments-${taskId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(comment => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
          userId: comment.userId || null,
        }));
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('Failed to load comments from localStorage:', err);
      }
    }
    return null;
  };

  const getDefaultComments = () => [
    {
      id: 1,
      content: 'Great work on this task! The approach you took is very thorough.',
      author: 'Prof. Smith',
      role: 'Educator',
      userId: null,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      edited: false,
    },
    {
      id: 2,
      content: 'I have a question about the second part of the assignment. Can you clarify?',
      author: userName,
      role: 'Student',
      userId: currentUserId,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      edited: false,
    },
  ];

  const getInitialComments = () => {
    const savedComments = loadCommentsFromStorage();
    return savedComments || getDefaultComments();
  };

  const [comments, setComments] = useState(getInitialComments);

  const handleAddFiles = newFiles => {
    setItems(cur => [
      ...cur,
      ...newFiles.map(f => ({ id: crypto.randomUUID(), type: 'file', ...f })),
    ]);
  };

  // Validate link submission
  const validateLinkSubmission = () => {
    const needLink = !isValidUrl(linkUrl);
    const needComment = !comment.trim();

    setErrLink(needLink ? 'Please add the link (include https://)' : '');
    setErrComment(!needLink && needComment ? 'Please add the comment' : '');

    if (needLink || needComment) {
      if (needLink) setTimeout(() => linkRef.current?.focus(), 0);
      else setTimeout(() => commentRef.current?.focus(), 0);
      return false;
    }
    return true;
  };

  // Submit link via side upload icon
  const submitLink = () => {
    if (!showLink) setShowLink(true);

    if (!validateLinkSubmission()) {
      return;
    }

    setItems(cur => [
      ...cur,
      {
        id: crypto.randomUUID(),
        type: 'link',
        name: linkUrl.trim(),
        url: linkUrl.trim(),
        at: Date.now(),
        comment: comment.trim(),
      },
    ]);
    setLinkUrl('');
    setErrLink('');
    setErrComment('');
  };

  const openItem = it => window.open(it.url, '_blank', 'noopener,noreferrer');
  const scrollToUpload = () =>
    document
      .getElementById('upload-dropzone')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Extract comment management logic
  const saveCommentsToStorage = updatedComments => {
    try {
      localStorage.setItem(`task-comments-${taskId}`, JSON.stringify(updatedComments));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error saving comments:', err);
      }
    }
  };

  const createNewComment = content => ({
    id: Date.now(),
    content,
    author: userName,
    role: 'Student',
    userId: currentUserId,
    createdAt: new Date(),
    edited: false,
  });

  const handleCommentSubmit = content => {
    try {
      if (!currentUserId) {
        error('Unable to identify user. Please refresh the page and try again.');
        return;
      }

      const newComment = createNewComment(content);
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      saveCommentsToStorage(updatedComments);
      success('Comment posted successfully!');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error posting comment:', err);
      }
      error('Failed to post comment. Please try again.');
    }
  };

  const validateDeletePermission = commentToDelete => {
    if (!commentToDelete) {
      error('Comment not found.');
      return false;
    }
    if (commentToDelete.userId !== currentUserId) {
      error('You can only delete your own comments.');
      return false;
    }
    return true;
  };

  const handleDeleteComment = commentId => {
    try {
      const commentToDelete = comments.find(comment => comment.id === commentId);
      if (!validateDeletePermission(commentToDelete)) {
        return;
      }

      const updatedComments = comments.filter(comment => comment.id !== commentId);
      setComments(updatedComments);
      saveCommentsToStorage(updatedComments);
      success('Comment deleted successfully!');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error deleting comment:', err);
      }
      error('Failed to delete comment. Please try again.');
    }
  };

  // Extract render helpers to reduce cognitive complexity
  const renderSidebar = () => (
    <aside className={`${styles.leftNav} ${darkMode ? styles.leftNavDark : ''}`}>
      <div className={`${styles.burger} ${darkMode ? styles.burgerDark : ''}`} aria-hidden />
      <nav className={styles.iconList}>
        <button
          className={`${styles.iconBtn} ${styles.active} ${darkMode ? styles.iconBtnDark : ''}`}
          title="Home"
        >
          <Icon name="home" className={styles.svg} darkMode={darkMode} />
        </button>
        <button className={`${styles.iconBtn} ${darkMode ? styles.iconBtnDark : ''}`} title="Stats">
          <Icon name="stats" className={styles.svg} darkMode={darkMode} />
        </button>
        <button
          className={`${styles.iconBtn} ${darkMode ? styles.iconBtnDark : ''}`}
          title="Folder"
        >
          <Icon name="folder" className={styles.svg} darkMode={darkMode} />
        </button>
        <button className={`${styles.iconBtn} ${darkMode ? styles.iconBtnDark : ''}`} title="Star">
          <Icon name="star" className={styles.svg} darkMode={darkMode} />
        </button>
        <button
          className={`${styles.iconBtn} ${darkMode ? styles.iconBtnDark : ''}`}
          title="Calendar"
        >
          <Icon name="calendar" className={styles.svg} darkMode={darkMode} />
        </button>
        <button className={`${styles.iconBtn} ${darkMode ? styles.iconBtnDark : ''}`} title="Write">
          <Icon name="pen" className={styles.svg} darkMode={darkMode} />
        </button>
      </nav>
      <div className={styles.navFooter}>
        <button
          className={`${styles.navAction} ${darkMode ? styles.navActionDark : ''}`}
          title="Settings"
        >
          <Icon name="settings" className={styles.svg} darkMode={darkMode} />
          <span className={`${styles.navText} ${darkMode ? styles.navTextDark : ''}`}>
            Settings
          </span>
        </button>
        <button
          className={`${styles.navAction} ${darkMode ? styles.navActionDark : ''}`}
          title="Log out"
        >
          <Icon name="logout" className={styles.svg} darkMode={darkMode} />
          <span className={`${styles.navText} ${darkMode ? styles.navTextDark : ''}`}>Log out</span>
        </button>
      </div>
    </aside>
  );

  const renderHeader = () => (
    <header className={`${styles.header} ${darkMode ? styles.headerDark : ''}`}>
      <h1>
        Activity - <span style={{ fontWeight: 800 }}>1</span> : Technology, Art, Trades, Health
      </h1>
      <div className={styles.headerRight}>
        <span className={styles.welcome}>Welcome, {userName}</span>
        <BellIcon darkMode={darkMode} />
      </div>
    </header>
  );

  const formatItemTime = it => {
    const timeStr = new Date(it.at).toLocaleString();
    const sizeStr =
      it.type === 'file' && it.size != null ? ` • ${(it.size / 1024).toFixed(1)} KB` : '';
    const commentStr = it.type === 'link' && it.comment ? ` • ${it.comment}` : '';
    return `${timeStr}${sizeStr}${commentStr}`;
  };

  const renderHistorySection = () => {
    if (items.length === 0) return null;

    return (
      <div className={styles.historyWrap}>
        <button type="button" className={styles.historyHeader}>
          <span className={styles.chev}>▾</span>
          Previously Uploaded documents
        </button>
        <div className={styles.simpleList}>
          {[...items].reverse().map(it => (
            <div key={it.id} className={styles.simpleRow}>
              <button
                type="button"
                className={styles.simpleLink}
                onClick={() => openItem(it)}
                title={`Open ${it.name}`}
              >
                {it.type === 'link' ? 'Link: ' : ''}
                {it.name}
              </button>
              <span className={styles.simpleTime}>{formatItemTime(it)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProgressPane = () => (
    <aside className={styles.progressPane}>
      <div className={styles.progressCard}>
        <h3 className={styles.progressHeading}>Progress Bar</h3>
        <div className={styles.progressBlock}>
          <div className={styles.progressRow}>
            <span>Overall Activity</span>
            <span>25%</span>
          </div>
          <div className={styles.progressBar}>
            <span style={{ width: '25%' }} />
          </div>
        </div>
        <div className={styles.progressBlock}>
          <div className={styles.progressRow}>
            <span>This Task</span>
            <span>50%</span>
          </div>
          <div className={styles.progressBar}>
            <span style={{ width: '50%' }} />
          </div>
        </div>
      </div>
    </aside>
  );

  const renderFormGrid = () => (
    <section className={styles.formGrid}>
      <div className={styles.leftColumn}>
        <section className={styles.unitWrap}>
          <div className={styles.pillRow}>
            <div className={`${styles.pillInput} ${darkMode ? styles.pillInputDark : ''}`}>
              {unitLabel}
            </div>
            <div className={`${styles.pillInput} ${darkMode ? styles.pillInputDark : ''}`}>
              {tradeLabel}
            </div>
          </div>
        </section>

        {renderFormSection()}

        <section className={styles.uploadSection}>
          <UploadPanel
            id="upload-dropzone"
            maxBytes={10 * 1024 * 1024}
            onFilesUploaded={handleAddFiles}
          />
        </section>

        {renderHistorySection()}

        <section className={styles.commentsSection}>
          <h2 className={styles.commentsHeading}>Comments/Queries Section</h2>
          <CommentBox
            onSubmit={handleCommentSubmit}
            placeholder="Please enter your comments/Queries here"
          />
          <CommentList
            comments={comments}
            onDeleteComment={handleDeleteComment}
            currentUserId={currentUserId}
          />
        </section>
      </div>

      {renderProgressPane()}
    </section>
  );

  const handleCommentChange = e => {
    setComment(e.target.value);
    if (errComment) setErrComment('');
  };

  const handleLinkUrlChange = e => {
    setLinkUrl(e.target.value);
    if (errLink) setErrLink('');
  };

  const handleShowLink = () => {
    setShowLink(true);
    setTimeout(() => linkRef.current?.focus(), 0);
  };

  const renderFormSection = () => (
    <div className={`${styles.longInputCard} ${darkMode ? styles.longInputCardDark : ''}`}>
      <div className={styles.longCol}>
        <textarea
          ref={commentRef}
          className={`${styles.longTextArea} ${errComment ? styles.inputError : ''} ${
            darkMode ? styles.longTextAreaDark : ''
          }`}
          placeholder="Trades related trade from the indigo section of the Arts and Trades Subject Page"
          value={comment}
          onChange={handleCommentChange}
        />

        {(errLink || errComment) && (
          <div className={styles.fieldErrorGroup}>
            {errLink && <div>{errLink}</div>}
            {errComment && <div>{errComment}</div>}
          </div>
        )}

        {showLink && (
          <input
            ref={linkRef}
            type="url"
            className={`${styles.linkInput} ${errLink ? styles.inputError : ''} ${
              darkMode ? styles.linkInputDark : ''
            }`}
            placeholder="Paste a link (include https://)"
            value={linkUrl}
            onChange={handleLinkUrlChange}
          />
        )}
      </div>

      <div className={styles.sideBtns}>
        <button
          className={`${styles.sideBtn} ${darkMode ? styles.sideBtnDark : ''}`}
          aria-label="Insert link"
          onClick={handleShowLink}
          title="Add a link"
        >
          <Icon name="link" className={styles.svg} darkMode={darkMode} />
        </button>

        <button
          className={`${styles.sideBtn} ${darkMode ? styles.sideBtnDark : ''}`}
          aria-label="Comment"
          onClick={() => commentRef.current?.focus()}
          title="Add a comment"
        >
          <Icon name="comment" className={styles.svg} darkMode={darkMode} />
        </button>

        <button
          className={`${styles.sideBtn} ${darkMode ? styles.sideBtnDark : ''}`}
          aria-label="Submit link"
          onClick={submitLink}
          title="Upload link"
        >
          <Icon name="upload" className={styles.svg} darkMode={darkMode} />
        </button>

        <button
          className={`${styles.sideBtn} ${darkMode ? styles.sideBtnDark : ''}`}
          aria-label="Go to file upload"
          onClick={scrollToUpload}
          title="Open file picker"
        >
          <Icon name="folder-line" className={styles.svg} darkMode={darkMode} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`${styles.page} ${darkMode ? styles.pageDark : ''}`}>
      {renderSidebar()}

      <main className={`${styles.main} ${darkMode ? styles.mainDark : ''}`}>
        {renderHeader()}

        <section className={styles.chart}>
          <div className={styles.chartCard}>
            <img
              src="/upload_chart.png"
              alt="Activity chart"
              className={styles.chartImg}
              draggable="false"
            />
          </div>
        </section>

        {renderFormGrid()}
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
