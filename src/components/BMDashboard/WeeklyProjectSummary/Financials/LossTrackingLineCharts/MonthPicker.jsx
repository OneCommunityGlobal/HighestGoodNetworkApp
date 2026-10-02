import { useEffect, useRef, useState } from 'react';
import styles from './LossTrackingLineChart.module.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const toKey = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;

export default function MonthPicker({ value, onChange, min, max, ariaLabel }) {
  const minYear = Number(min.slice(0, 4));
  const maxYear = Number(max.slice(0, 4));
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(minYear);
  const rootRef = useRef(null);

  const selectedYear = value ? Number(value.slice(0, 4)) : null;
  const selectedMonth = value ? Number(value.slice(5, 7)) - 1 : null;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      const y = selectedYear ?? minYear;
      setViewYear(Math.min(Math.max(y, minYear), maxYear));
    }
    setOpen(o => !o);
  };

  const pick = m => {
    onChange(toKey(viewYear, m));
    setOpen(false);
  };

  const label = value ? `${MONTHS[selectedMonth]} ${selectedYear}` : 'Select month';

  return (
    <div className={styles.monthInputWrapper} ref={rootRef}>
      <button
        type="button"
        className={styles.monthTrigger}
        onClick={toggle}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? '' : styles.placeholder}>{label}</span>
        <span className={styles.monthInputIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 8H5v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8ZM5 8h14V7a1 1 0 0 0-1-1H6A1 1 0 0 0 5 7v1Z" />
          </svg>
        </span>
      </button>

      {open && (
        <dialog open className={styles.calendarPopover} aria-label={ariaLabel}>
          <div className={styles.calendarHeader}>
            <button
              type="button"
              className={styles.calNav}
              onClick={() => setViewYear(y => y - 1)}
              disabled={viewYear <= minYear}
              aria-label="Previous year"
            >
              ‹
            </button>
            <span className={styles.calYear}>{viewYear}</span>
            <button
              type="button"
              className={styles.calNav}
              onClick={() => setViewYear(y => y + 1)}
              disabled={viewYear >= maxYear}
              aria-label="Next year"
            >
              ›
            </button>
          </div>

          <div className={styles.calendarGrid}>
            {MONTHS.map((name, m) => {
              const key = toKey(viewYear, m);
              const disabled = key < min || key > max;
              const selected = key === value;
              return (
                <button
                  key={name}
                  type="button"
                  disabled={disabled}
                  className={[styles.calMonth, selected ? styles.calMonthSelected : ''].join(' ')}
                  onClick={() => pick(m)}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <div className={styles.calendarFooter}>
            <button
              type="button"
              className={styles.calClear}
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              disabled={!value}
            >
              Clear
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
