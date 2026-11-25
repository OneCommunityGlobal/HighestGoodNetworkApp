import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ACCEPTED_LINKS_HINT, MAX_REVIEW_LINKS, splitJoinedLinks } from './reviewLinkUtils';
import styles from './LinkListInput.module.css';

function LinkListInput({ id, label, links, errors, onChange, darkMode, maxLinks }) {
  const inputRefs = useRef([]);
  const addButtonRef = useRef(null);
  const pendingFocus = useRef(null);

  useEffect(() => {
    if (pendingFocus.current === null) return;
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (target === 'add') {
      addButtonRef.current?.focus();
    } else {
      inputRefs.current[target]?.focus();
    }
  }, [links.length]);

  const updateLink = (index, value) => {
    onChange(links.map((item, i) => (i === index ? value : item)));
  };

  const addLink = () => {
    if (links.length >= maxLinks) return;
    pendingFocus.current = links.length;
    onChange([...links, '']);
  };

  const removeLink = index => {
    if (links.length <= 1) return;
    pendingFocus.current = index > 0 ? index - 1 : 0;
    onChange(links.filter((_, i) => i !== index));
  };

  // Pasting several links at once (joined with ";", commas, spaces or new lines) fills one row each
  const handlePaste = (index, event) => {
    const pasted = event.clipboardData?.getData('text') || '';
    const parts = splitJoinedLinks(pasted);
    if (parts.length < 2) return;
    event.preventDefault();
    const room = maxLinks - links.length + 1;
    const accepted = parts.slice(0, room);
    const next = [...links.slice(0, index), ...accepted, ...links.slice(index + 1)];
    pendingFocus.current = index + accepted.length - 1;
    onChange(next);
  };

  const atLimit = links.length >= maxLinks;

  return (
    <fieldset className={`${styles.group} ${darkMode ? styles.dark : ''}`}>
      <legend className={styles.legend}>{label}</legend>
      <p id={`${id}-hint`} className={styles.hint}>
        {ACCEPTED_LINKS_HINT}
      </p>
      <ul className={styles.list}>
        {links.map((value, index) => {
          const error = errors?.[index] || '';
          const inputId = `${id}-${index}`;
          const errorId = `${id}-error-${index}`;
          return (
            // Rows have no stable id and can be reordered only by removal, so the index is the key
            // eslint-disable-next-line react/no-array-index-key
            <li key={index} className={styles.row}>
              <label htmlFor={inputId} className={styles.srOnly}>
                Link {index + 1}
              </label>
              <div className={styles.inputLine}>
                <Input
                  id={inputId}
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  value={value}
                  invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-hint ${errorId}` : `${id}-hint`}
                  innerRef={node => {
                    inputRefs.current[index] = node;
                  }}
                  onChange={event => updateLink(index, event.target.value)}
                  onPaste={event => handlePaste(index, event)}
                />
                {links.length > 1 && (
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Remove link ${index + 1}`}
                    onClick={() => removeLink(index)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
              {error && (
                <p id={errorId} className={styles.error} role="alert">
                  {error}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        ref={addButtonRef}
        className={styles.add}
        onClick={addLink}
        disabled={atLimit}
      >
        Add another link
      </button>
      {atLimit && <span className={styles.limit}>Up to {maxLinks} links.</span>}
    </fieldset>
  );
}

LinkListInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  links: PropTypes.arrayOf(PropTypes.string).isRequired,
  errors: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  maxLinks: PropTypes.number,
};

LinkListInput.defaultProps = {
  label: 'Links to your work',
  errors: [],
  darkMode: false,
  maxLinks: MAX_REVIEW_LINKS,
};

export default LinkListInput;
