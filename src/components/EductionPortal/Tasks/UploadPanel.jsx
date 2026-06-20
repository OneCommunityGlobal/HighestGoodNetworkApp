import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './UploadPanel.module.css';

/* Small inline icons */
const CloudUp = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="28" height="28" aria-hidden>
    <path
      d="M6 19h12a4 4 0 0 0 0-8h-.5a6 6 0 0 0-11.6-2A4.5 4.5 0 0 0 6 19Z"
      fill="none"
      stroke="#111"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14V8M9.5 10.5 12 8l2.5 2.5"
      fill="none"
      stroke="#111"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
    <path
      d="M12 16V6M8.5 9.5 12 6l3.5 3.5M4 18h16"
      fill="none"
      stroke="#111"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Props:
 * - id (string) : optional DOM id for scrollIntoView
 * - maxBytes (number) : default 10MB limit per file
 * - onFilesUploaded(files[]) : callback => [{name,url,size,at}]
 */
export default function UploadPanel({ id, maxBytes = 10 * 1024 * 1024, onFilesUploaded }) {
  const inputRef = useRef(null);

  const [pendingFiles, setPendingFiles] = useState([]); // File[]
  const [isDragOver, setIsDragOver] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [progress, setProgress] = useState(0);

  // Notes – kept (optional)
  const [notes, setNotes] = useState('');

  // file-size error (shown near dropzone)
  const [sizeError, setSizeError] = useState('');

  const addFiles = useCallback(
    fileList => {
      const picked = Array.from(fileList || []).filter(Boolean);
      if (!picked.length) return;

      const tooBig = picked.find(f => f.size > maxBytes);
      if (tooBig) {
        setSizeError('Each file must be ≤ 10MB.');
        return;
      }
      setSizeError('');

      setPendingFiles(cur => {
        const map = new Map(cur.map(f => [`${f.name}|${f.size}`, f]));
        picked.forEach(f => map.set(`${f.name}|${f.size}`, f));
        return Array.from(map.values());
      });
    },
    [maxBytes],
  );

  const onBrowse = e => addFiles(e.target.files);

  // DnD
  const onDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };
  const onDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  const onDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };
  const onDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  };

  // Prevent browser navigating on outside drop
  useEffect(() => {
    const cancel = ev => {
      ev.preventDefault();
      ev.stopPropagation();
    };
    window.addEventListener('dragover', cancel, false);
    window.addEventListener('drop', cancel, false);
    return () => {
      window.removeEventListener('dragover', cancel, false);
      window.removeEventListener('drop', cancel, false);
    };
  }, []);

  const dzLabel = useMemo(() => {
    if (isUploading && currentName) return `${currentName} is uploading…`;
    if (pendingFiles.length > 0) return `${pendingFiles.length} file(s) selected`;
    return 'Drag & Drop';
  }, [isUploading, currentName, pendingFiles.length]);

  // fake upload (replace with API later)
  const uploadOne = file =>
    new Promise(resolve => {
      setCurrentName(file.name);
      setProgress(0);
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const pct = Math.min(100, Math.round((elapsed / 1800) * 100));
        setProgress(pct);
        if (pct >= 100) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

  const doUpload = async () => {
    if (!pendingFiles.length || isUploading) return;
    setIsUploading(true);

    const uploaded = [];
    for (let i = 0; i < pendingFiles.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await uploadOne(pendingFiles[i]);
      const file = pendingFiles[i];
      uploaded.push({
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        at: Date.now(),
      });
    }

    setIsUploading(false);
    setCurrentName('');
    setProgress(0);
    setPendingFiles([]);
    // eslint-disable-next-line testing-library/no-node-access
    if (inputRef.current) inputRef.current.value = '';

    onFilesUploaded?.(uploaded);
  };

  // ---------- A11y: label ↔ control association ----------
  const notesInputId = 'notes-to-teacher';

  return (
    <div className={styles.outer} id={id}>
      {/* DROP ZONE */}
      <div
        className={`${styles.dropzone} ${isDragOver ? styles.over : ''}`}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          // eslint-disable-next-line testing-library/no-node-access
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        aria-label="File upload drop zone"
      >
        <CloudUp className={styles.cloud} />
        <div className={styles.dzTitle}>{dzLabel}</div>

        {isUploading ? (
          <div className={styles.progressWrap} aria-live="polite">
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.progressPct}>{progress}%</div>
          </div>
        ) : (
          <>
            <div className={styles.or}>OR</div>
            <div className={styles.actions}>
              <input
                ref={inputRef}
                type="file"
                multiple
                onChange={onBrowse}
                className={styles.hiddenInput}
                aria-label="Choose files"
              />
              <button
                type="button"
                className={styles.browseBtn}
                // eslint-disable-next-line testing-library/no-node-access
                onClick={() => inputRef.current?.click()}
              >
                Browse File
              </button>

              <button
                type="button"
                className={styles.uploadBtn}
                onClick={doUpload}
                disabled={pendingFiles.length === 0}
                title={
                  pendingFiles.length
                    ? `Upload ${pendingFiles.length} file(s)`
                    : 'Select a file first'
                }
              >
                <UploadIcon />
                <span>Upload</span>
              </button>
            </div>
          </>
        )}

        {sizeError ? <div className={styles.sizeError}>{sizeError}</div> : null}
      </div>

      {/* Notes to Teacher (optional) */}
      <div className={styles.notesBlock}>
        <label className={styles.notesLabel} htmlFor={notesInputId}>
          Notes to Teacher <span className={styles.muted}>(Optional)</span>
        </label>
        <textarea
          id={notesInputId}
          className={styles.notes}
          placeholder="Add any notes for the teacher here"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
