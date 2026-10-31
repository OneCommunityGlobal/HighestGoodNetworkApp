import { useEffect, useId, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { highlightParts, normalizeSearch } from './memberSearch';
import styles from './ProjectLog.module.css';

export function HighlightMatch({ value, query }) {
  return highlightParts(value, query).map(part =>
    part.match ? (
      <mark className={styles.match} key={part.key}>
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  );
}

HighlightMatch.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  query: PropTypes.string,
};

export default function MemberSearchInput({ column, value, options, onChange, onSelect }) {
  const id = useId();
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const query = normalizeSearch(value);
  const matches = useMemo(
    () =>
      query ? options.filter(option => normalizeSearch(option).includes(query)).slice(0, 8) : [],
    [options, query],
  );
  const expanded = Boolean(column.suggest && open && matches.length);
  const active = expanded && activeIndex >= 0 && activeIndex < matches.length;

  useEffect(() => {
    listRef.current?.children[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex]);

  const select = option => {
    onSelect(option);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = event => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    } else if (column.suggest && matches.length && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex(previous => {
        if (!expanded || previous < 0) return direction === 1 ? 0 : matches.length - 1;
        return (previous + direction + matches.length) % matches.length;
      });
    } else if (event.key === 'Enter' && active) {
      event.preventDefault();
      select(matches[activeIndex]);
    }
  };

  return (
    <div className={styles.filter}>
      <label htmlFor={id}>{column.label}</label>
      <input
        id={id}
        type="text"
        className={styles.searchInput}
        value={value}
        placeholder={`Search ${column.label.toLowerCase()}`}
        autoComplete="off"
        role={column.suggest ? 'combobox' : undefined}
        aria-autocomplete={column.suggest ? 'list' : undefined}
        aria-expanded={column.suggest ? expanded : undefined}
        aria-controls={expanded ? `${id}-suggestions` : undefined}
        aria-activedescendant={active ? `${id}-option-${activeIndex}` : undefined}
        onChange={event => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
      />
      {expanded && (
        <ul
          id={`${id}-suggestions`}
          role="listbox"
          aria-label={`${column.label} suggestions`}
          className={styles.suggestions}
          ref={listRef}
        >
          {matches.map((option, index) => (
            <li
              key={option}
              id={`${id}-option-${index}`}
              role="option"
              aria-label={option}
              aria-selected={index === activeIndex}
              className={styles.option}
              onMouseDown={event => event.preventDefault()}
              onClick={() => select(option)}
              onKeyDown={event => {
                if (event.key === 'Enter') select(option);
              }}
            >
              <HighlightMatch value={option} query={value} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

MemberSearchInput.propTypes = {
  column: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    suggest: PropTypes.bool,
  }).isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};
