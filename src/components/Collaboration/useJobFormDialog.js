import { useCallback, useRef, useState } from 'react';

const INITIAL_STATE = {
  open: false,
  mode: 'confirm',
  title: '',
  message: '',
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  defaultValue: '',
  inputPlaceholder: '',
  requireInput: false,
};

/**
 * Promise-based alert / confirm / prompt replacement for Job Form Builder pages.
 */
export default function useJobFormDialog() {
  const [dialogState, setDialogState] = useState(INITIAL_STATE);
  const resolverRef = useRef(null);
  const modeRef = useRef(INITIAL_STATE.mode);

  const closeDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false }));
  }, []);

  const openDialog = useCallback(options => {
    return new Promise(resolve => {
      const nextMode = options.mode || INITIAL_STATE.mode;
      modeRef.current = nextMode;
      resolverRef.current = resolve;
      setDialogState({
        ...INITIAL_STATE,
        ...options,
        mode: nextMode,
        open: true,
      });
    });
  }, []);

  const handleConfirm = useCallback(
    result => {
      const resolve = resolverRef.current;
      resolverRef.current = null;
      closeDialog();
      resolve?.(result);
    },
    [closeDialog],
  );

  const handleCancel = useCallback(() => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    closeDialog();
    const mode = modeRef.current;
    if (mode === 'prompt') resolve?.(null);
    else if (mode === 'confirm') resolve?.(false);
    else resolve?.(undefined);
  }, [closeDialog]);

  const showAlert = useCallback(
    (message, options = {}) =>
      openDialog({
        mode: 'alert',
        message,
        title: options.title || '',
        confirmLabel: options.confirmLabel || 'OK',
      }),
    [openDialog],
  );

  const showConfirm = useCallback(
    (message, options = {}) =>
      openDialog({
        mode: 'confirm',
        message,
        title: options.title || '',
        confirmLabel: options.confirmLabel || 'OK',
        cancelLabel: options.cancelLabel || 'Cancel',
      }),
    [openDialog],
  );

  const showPrompt = useCallback(
    (message, options = {}) =>
      openDialog({
        mode: 'prompt',
        message,
        title: options.title || '',
        confirmLabel: options.confirmLabel || 'OK',
        cancelLabel: options.cancelLabel || 'Cancel',
        defaultValue: options.defaultValue || '',
        inputPlaceholder: options.inputPlaceholder || '',
        requireInput: options.requireInput !== false,
      }),
    [openDialog],
  );

  return {
    dialogProps: {
      ...dialogState,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
    showAlert,
    showConfirm,
    showPrompt,
  };
}
