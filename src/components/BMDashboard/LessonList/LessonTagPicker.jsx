import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './LessonListForm.module.css';

function nextSuggestion(current, length, open, key) {
  if (!length) return 0;
  if (!open) {
    if (key === 'ArrowDown') return 0;
    return length - 1;
  }
  const direction = key === 'ArrowDown' ? 1 : -1;
  return (current + direction + length) % length;
}

export default function LessonTagPicker({
  id,
  label,
  value,
  onInputChange,
  availableTags,
  selectedTags,
  counts,
  onSelect,
  disabled,
  resetKey,
  maxSelected,
}) {
  const root = useRef(null);
  const activeOption = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const options = useMemo(
    () =>
      availableTags
        .filter(
          tag => tag.toLowerCase().includes(value.toLowerCase()) && !selectedTags.includes(tag),
        )
        .sort((a, b) => (counts ? (counts[b] || 0) - (counts[a] || 0) : 0)),
    [availableTags, selectedTags, value, counts],
  );
  useEffect(() => {
    setActive(0);
  }, [value, selectedTags]);
  useEffect(() => {
    setOpen(false);
  }, [resetKey]);
  useEffect(() => {
    const outside = event => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  const limitReached = maxSelected !== undefined && selectedTags.length >= maxSelected;
  const select = tag => {
    if (disabled || limitReached || selectedTags.includes(tag)) return;
    onSelect(tag);
    setOpen(false);
    setActive(0);
  };
  const expanded = open && !disabled && !limitReached;
  const highlighted = Math.min(active, Math.max(options.length - 1, 0));
  useEffect(() => {
    if (expanded) activeOption.current?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [expanded, highlighted, options]);
  return (
    <div
      ref={root}
      className={styles.picker}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <input
        id={id}
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={`${id}-options`}
        aria-activedescendant={
          expanded && options.length ? `${id}-option-${highlighted}` : undefined
        }
        type="text"
        value={value}
        disabled={disabled}
        readOnly={limitReached}
        aria-disabled={disabled || limitReached}
        aria-describedby={limitReached ? `${id}-limit` : undefined}
        className={`form-control ${styles.formControl}`}
        placeholder="Search or select a tag"
        onChange={event => {
          if (limitReached) return;
          onInputChange(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActive(previous => nextSuggestion(previous, options.length, expanded, event.key));
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            if (expanded && options.length) select(options[highlighted]);
          }
        }}
      />
      {limitReached && (
        <output id={`${id}-limit`} className="d-block mt-2">
          A maximum of {maxSelected} tags can be selected. Remove a tag or use Reset All to select
          others.
        </output>
      )}
      {expanded && (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-label={`${label} suggestions`}
          className={styles.tagDropdown}
        >
          {options.map((tag, index) => (
            <button
              ref={index === highlighted ? activeOption : null}
              id={`${id}-option-${index}`}
              key={tag}
              type="button"
              role="option"
              aria-selected={index === highlighted}
              tabIndex={-1}
              className={`${styles.tagDropdownItem} ${
                index === highlighted ? styles.activeSuggestion : ''
              }`}
              onMouseDown={event => event.preventDefault()}
              onClick={() => select(tag)}
            >
              {tag}
              {counts ? ` (${counts[tag] || 0})` : ''}
            </button>
          ))}
          {!options.length && <output className={styles.noSuggestions}>No matching tags.</output>}
        </div>
      )}
    </div>
  );
}
