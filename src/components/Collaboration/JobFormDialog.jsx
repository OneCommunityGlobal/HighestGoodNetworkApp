import { useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './JobFormDialog.module.css';

/**
 * In-app replacement for window.alert / confirm / prompt on the Job Form Builder.
 * Uses the native <dialog> element; responsive and dark-mode aware.
 */
function JobFormDialog({
  open = false,
  mode = 'confirm',
  title = '',
  message = '',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  defaultValue = '',
  inputPlaceholder = '',
  requireInput = false,
  darkMode = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const inputId = useId();
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [value, setValue] = useState(defaultValue);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    setValue(defaultValue);
    setInputError('');
    const timer = window.setTimeout(() => {
      if (mode === 'prompt') inputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, defaultValue, mode]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (open) {
      if (!dialog.open) dialog.showModal();
      return undefined;
    }

    if (dialog.open) dialog.close();
    return undefined;
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    if (mode === 'prompt') {
      const trimmed = String(value || '').trim();
      if (requireInput && !trimmed) {
        setInputError('This field is required.');
        inputRef.current?.focus();
        return;
      }
      onConfirm?.(trimmed);
      return;
    }
    onConfirm?.(true);
  };

  return (
    // Backdrop click dismiss: Escape is handled via onCancel; click is the common dialog pattern.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- native <dialog> backdrop dismiss
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${darkMode ? styles.darkMode : ''}`}
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        onCancel?.();
      }}
      onClick={event => {
        if (event.target === dialogRef.current) onCancel?.();
      }}
    >
      <div className={styles.dialogBody}>
        <h2 id={titleId} className={title ? styles.title : styles.visuallyHidden}>
          {title || 'Dialog'}
        </h2>
        {message ? <p className={styles.message}>{message}</p> : null}
        {mode === 'prompt' ? (
          <>
            <label className={styles.visuallyHidden} htmlFor={inputId}>
              {inputPlaceholder || 'Value'}
            </label>
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              className={`${styles.input} ${inputError ? styles.inputError : ''}`}
              value={value}
              placeholder={inputPlaceholder}
              onChange={e => {
                setValue(e.target.value);
                if (inputError) setInputError('');
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              aria-invalid={Boolean(inputError)}
            />
            {inputError ? (
              <p className={styles.fieldError} role="alert">
                {inputError}
              </p>
            ) : null}
          </>
        ) : null}
        <div className={styles.actions}>
          {mode !== 'alert' ? (
            <button type="button" className={styles.cancelButton} onClick={() => onCancel?.()}>
              {cancelLabel}
            </button>
          ) : null}
          <button type="button" className={styles.confirmButton} onClick={handleConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

JobFormDialog.propTypes = {
  open: PropTypes.bool,
  mode: PropTypes.oneOf(['alert', 'confirm', 'prompt']),
  title: PropTypes.string,
  message: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  defaultValue: PropTypes.string,
  inputPlaceholder: PropTypes.string,
  requireInput: PropTypes.bool,
  darkMode: PropTypes.bool,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
};

JobFormDialog.defaultProps = {
  open: false,
  mode: 'confirm',
  title: '',
  message: '',
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  defaultValue: '',
  inputPlaceholder: '',
  requireInput: false,
  darkMode: false,
  onConfirm: undefined,
  onCancel: undefined,
};

export default JobFormDialog;
