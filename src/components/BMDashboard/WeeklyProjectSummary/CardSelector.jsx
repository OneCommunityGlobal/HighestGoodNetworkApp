import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './CardSelector.module.css';

export const CARD_LIMIT_OPTIONS = ['4', '6', '8', 'all'];

// Preset card groups. Keys that are not on the page are ignored.
export const CARD_PRESETS = [
  {
    id: 'finance',
    label: 'Finance Focus',
    keys: ['Financials', 'Financials Tracking', 'Loss Tracking', 'Material Consumption'],
  },
  {
    id: 'schedule',
    label: 'Schedule Focus',
    keys: [
      'Project Status',
      'Risk profile for projects',
      'Issue Tracking',
      'Issues Breakdown',
      'Labor and Time Tracking',
    ],
  },
  {
    id: 'operations',
    label: 'Operations Focus',
    keys: [
      'Tools and Equipment Tracking',
      'Rental Tracking',
      'Material Consumption',
      'Injury Severity by Projects',
      'Lessons Learned',
      'Global Distribution and Project Status Overview',
    ],
  },
  { id: 'all', label: 'All Cards', keys: null },
];

function CardSelector({ cards, visibleKeys, cardLimit, shownCount, onChange, darkMode }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (open === false) return undefined;
    const handleClickOutside = event => {
      if (wrapperRef.current && wrapperRef.current.contains(event.target) === false) {
        setOpen(false);
      }
    };
    const handleEscape = event => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const allKeys = cards.map(card => card.key);

  const toggleKey = key => {
    const next = new Set(visibleKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(
      allKeys.filter(k => next.has(k)),
      cardLimit,
    );
  };

  const applyPreset = preset => {
    const keys = preset.keys ? allKeys.filter(k => preset.keys.includes(k)) : allKeys;
    onChange(keys, 'all');
  };

  return (
    <div className={styles.cardSelector} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.toggleButton} ${darkMode ? styles.toggleButtonDark : ''}`}
        onClick={() => setOpen(prev => prev === false)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">⚙</span> Customize Cards ({shownCount}/{cards.length})
      </button>

      {open && (
        <div
          className={`${styles.panel} ${darkMode ? styles.panelDark : ''}`}
          role="dialog"
          aria-label="Customize cards"
        >
          <div className={styles.group}>
            <span className={styles.groupLabel}>Presets</span>
            <div className={styles.presetRow}>
              {CARD_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className={styles.presetButton}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <label htmlFor="card-limit-select" className={styles.groupLabel}>
              Show
            </label>
            <select
              id="card-limit-select"
              className={styles.limitSelect}
              value={cardLimit}
              onChange={e => onChange(visibleKeys, e.target.value)}
            >
              {CARD_LIMIT_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All' : option}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.group}>
            <div className={styles.listHeader}>
              <span className={styles.groupLabel}>Cards</span>
              <div>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => onChange(allKeys, cardLimit)}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => onChange([], cardLimit)}
                >
                  Clear
                </button>
              </div>
            </div>
            <ul className={styles.cardList}>
              {cards.map((card, index) => {
                const inputId = `card-option-${index}`;
                return (
                  <li key={card.key}>
                    <label htmlFor={inputId} className={styles.cardOption}>
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={visibleKeys.includes(card.key)}
                        onChange={() => toggleKey(card.key)}
                      />
                      {card.title}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

CardSelector.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.string.isRequired, title: PropTypes.string.isRequired }),
  ).isRequired,
  visibleKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  cardLimit: PropTypes.oneOf(CARD_LIMIT_OPTIONS).isRequired,
  shownCount: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

CardSelector.defaultProps = {
  darkMode: false,
};

export default CardSelector;
