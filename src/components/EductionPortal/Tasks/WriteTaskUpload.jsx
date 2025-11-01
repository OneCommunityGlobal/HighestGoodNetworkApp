// src/components/EducationPortal/Tasks/WriteTaskUpload.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styles from './WriteTaskUpload.module.css';
import UploadPanel from './UploadPanel';

/* ---------- Icons (unchanged) ---------- */
const Icon = ({ name, className }) => {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', 'aria-hidden': true };
  const stroke = {
    stroke: '#000',
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
const BellIcon = () => (
  <svg className={styles.bellIcon} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14v-3a6 6 0 10-12 0v3a2 2 0 0 1-.6 1.4L4 17h5"
      fill="none"
      stroke="#000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.7 21a2 2 0 0 1-3.4 0"
      fill="none"
      stroke="#000"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/* ---------- Name helpers (updated) ---------- */

// Normalize to a clean first name.
// Handles: "Welcome, Rishir", "RishirHello", "RishirHello M", camelCase, extra punctuation.
function cleanName(raw) {
  let s = String(raw || '').trim();

  // If it looks like "Welcome, XXX", take XXX
  const mWelcome = s.match(/Welcome,\s*([^\s,]+)/i);
  if (mWelcome) s = mWelcome[1];

  // Start with a word-like token
  const word = s.match(/[A-Za-z][A-Za-z'-]*/);
  s = word ? word[0] : s;

  // Remove trailing "Hello" artifacts (e.g., "RishirHello")
  s = s.replace(/Hello.*$/i, '');

  // Split simple CamelCase "RishirHello" => "Rishir"
  const camel = s.match(/^([A-Z][a-z]+)(?=[A-Z][a-z]+)/);
  if (camel) s = camel[1];

  // Final sanitization
  s = s.replace(/[^A-Za-z'-]/g, '').trim();

  return s || 'Student Name';
}

// Read name from URL state/query/localStorage if available
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

/* ---------- Link helpers ---------- */
const isValidUrl = v => /^https?:\/\/\S+/i.test(v?.trim() || '');

/* ---------- Component ---------- */
export default function WriteTaskUpload() {
  const { taskId } = useParams();
  const location = useLocation();

  // Name
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

  // Files added from UploadPanel
  const handleAddFiles = newFiles => {
    setItems(cur => [
      ...cur,
      ...newFiles.map(f => ({ id: crypto.randomUUID(), type: 'file', ...f })),
    ]);
  };

  // Submit link via side upload icon
  const submitLink = () => {
    if (!showLink) setShowLink(true);

    const needLink = !isValidUrl(linkUrl);
    const needComment = !comment.trim();

    setErrLink(needLink ? 'Please add the link (include https://)' : '');
    setErrComment(!needLink && needComment ? 'Please add the comment' : '');

    if (needLink || needComment) {
      if (needLink) setTimeout(() => linkRef.current?.focus(), 0);
      else setTimeout(() => commentRef.current?.focus(), 0);
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

  return (
    <div className={styles.page}>
      {/* LEFT RAIL */}
      <aside className={styles.leftNav}>
        <div className={styles.burger} aria-hidden />
        <nav className={styles.iconList}>
          <button className={`${styles.iconBtn} ${styles.active}`} title="Home">
            <Icon name="home" className={styles.svg} />
          </button>
          <button className={styles.iconBtn} title="Stats">
            <Icon name="stats" className={styles.svg} />
          </button>
          <button className={styles.iconBtn} title="Folder">
            <Icon name="folder" className={styles.svg} />
          </button>
          <button className={styles.iconBtn} title="Star">
            <Icon name="star" className={styles.svg} />
          </button>
          <button className={styles.iconBtn} title="Calendar">
            <Icon name="calendar" className={styles.svg} />
          </button>
          <button className={styles.iconBtn} title="Write">
            <Icon name="pen" className={styles.svg} />
          </button>
        </nav>
        <div className={styles.navFooter}>
          <button className={styles.navAction} title="Settings">
            <Icon name="settings" className={styles.svg} />
            <span className={styles.navText}>Settings</span>
          </button>
          <button className={styles.navAction} title="Log out">
            <Icon name="logout" className={styles.svg} />
            <span className={styles.navText}>Log out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>
            Activity - <span style={{ fontWeight: 800 }}>1</span> : Technology, Art, Trades, Health
          </h1>
          <div className={styles.headerRight}>
            <span className={styles.welcome}>Welcome, {userName}</span>
            <BellIcon />
          </div>
        </header>

        {/* Chart */}
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

        {/* Two-column layout */}
        <section className={styles.formGrid}>
          <div className={styles.leftColumn}>
            {/* Unit pills */}
            <section className={styles.unitWrap}>
              <div className={styles.pillRow}>
                <div className={styles.pillInput}>{unitLabel}</div>
                <div className={styles.pillInput}>{tradeLabel}</div>
              </div>
            </section>

            {/* Comment + side icons + link field */}
            <div className={styles.longInputCard}>
              <div className={styles.longCol}>
                <textarea
                  ref={commentRef}
                  className={`${styles.longTextArea} ${errComment ? styles.inputError : ''}`}
                  placeholder="Trades related trade from the indigo section of the Arts and Trades Subject Page"
                  value={comment}
                  onChange={e => {
                    setComment(e.target.value);
                    if (errComment) setErrComment('');
                  }}
                />

                {/* Error area (red) between textarea and link input */}
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
                    className={`${styles.linkInput} ${errLink ? styles.inputError : ''}`}
                    placeholder="Paste a link (include https://)"
                    value={linkUrl}
                    onChange={e => {
                      setLinkUrl(e.target.value);
                      if (errLink) setErrLink('');
                    }}
                  />
                )}
              </div>

              {/* Side icon actions */}
              <div className={styles.sideBtns}>
                <button
                  className={styles.sideBtn}
                  aria-label="Insert link"
                  onClick={() => {
                    setShowLink(true);
                    setTimeout(() => linkRef.current?.focus(), 0);
                  }}
                  title="Add a link"
                >
                  <Icon name="link" className={styles.svg} />
                </button>

                <button
                  className={styles.sideBtn}
                  aria-label="Comment"
                  onClick={() => commentRef.current?.focus()}
                  title="Add a comment"
                >
                  <Icon name="comment" className={styles.svg} />
                </button>

                <button
                  className={styles.sideBtn}
                  aria-label="Submit link"
                  onClick={submitLink}
                  title="Upload link"
                >
                  <Icon name="upload" className={styles.svg} />
                </button>

                <button
                  className={styles.sideBtn}
                  aria-label="Go to file upload"
                  onClick={scrollToUpload}
                  title="Open file picker"
                >
                  <Icon name="folder-line" className={styles.svg} />
                </button>
              </div>
            </div>

            {/* File upload panel (drag & drop, browse, progress) */}
            <section className={styles.uploadSection}>
              <UploadPanel
                id="upload-dropzone"
                maxBytes={10 * 1024 * 1024}
                onFilesUploaded={handleAddFiles}
              />
            </section>

            {/* Unified history (files + links) */}
            {items.length > 0 && (
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
                      <span className={styles.simpleTime}>
                        {new Date(it.at).toLocaleString()}
                        {it.type === 'file' && it.size != null
                          ? ` • ${(it.size / 1024).toFixed(1)} KB`
                          : ''}
                        {it.type === 'link' && it.comment ? ` • ${it.comment}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress card */}
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
        </section>
      </main>
    </div>
  );
}
