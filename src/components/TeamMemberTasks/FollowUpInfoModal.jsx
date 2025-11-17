import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import styles from './FollowUpInfoModal.module.css';

function FollowUpInfoModal() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, maxWidth: 440 });

  const computePosition = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 8;
    const tooltipWidth = 440; // keep in sync with CSS width/max-width
    const vw = window.innerWidth;

    // place below the icon, clamp horizontally to stay within viewport
    const left = Math.max(12, Math.min(r.right - tooltipWidth, vw - tooltipWidth - 12));
    const top = r.bottom + gap;

    setPos({ top, left, maxWidth: tooltipWidth });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    const onScroll = computePosition;
    const onResize = computePosition;
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, computePosition]);

  return (
    <div className="fu-trigger">
      <button
        ref={btnRef}
        type="button"
        className="fu-btn"
        aria-label="Follow up info"
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
      >
        <FontAwesomeIcon
          className={styles['fu-btn-icon']}
          icon={faCircleInfo}
          style={{ color: darkMode ? 'silver' : 'black' }}
        />
      </button>

      {open &&
        createPortal(
          <div
            className={`${styles['fu-tooltip']} ${
              darkMode ? styles['fu--dark'] : styles['fu--light']
            }`}
            style={{ top: pos.top, left: pos.left, maxWidth: pos.maxWidth }}
            // allow moving the mouse into the tooltip without it disappearing
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <div className="mb-3">
              This checkbox allows you to track follow-ups. By clicking it, you indicate that you
              have checked in with a person to ensure they are on track to meet their deadline.
            </div>
            <div className="mb-3">
              The checkbox is visible and accessible to all classes except volunteers. Checking the
              box will modify its appearance for all others who can see it.
            </div>
            <div className="mb-3">
              When a person&apos;s task is at 50%, 75%, or 90% of the deadline, the checkbox
              automatically clears and changes to a red outline with a light pink filler. This
              visual cue indicates that the person requires follow-up.
            </div>
            <div className="mb-3">
              Once checked, the box reverts to a green outline with a light green filler and a check
              mark inside.
            </div>
            <div className="mb-3">
              If a person is followed up with when their progress is between 50–75%, the checkbox
              will not automatically clear until the person reaches over 75% progress.
            </div>
            <div className="mb-3">
              Similarly, if a person is followed up with when their progress is between 75–90%, the
              checkbox remains checked until the person reaches over 90% progress.
            </div>
            <div className="mb-3">
              If the checkbox is unchecked it resets to the initial state. (If the progress is less
              than 50%, the checkbox will be unchecked and shown in green. If the progress is over
              50%, the checkbox will be unchecked and shown in red.)
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default FollowUpInfoModal;
