import { useRef, useState } from 'react';
import styles from '../EventManagementPage.module.css';

export default function DescriptionEditor({ initialValue, onSave, onUpload, onSubmit }) {
  // support both onSave (older) and onSubmit (parent currently passes onSubmit)
  const submitFn = onSave ?? onSubmit;
  const [val, setVal] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  async function handleSave() {
    setBusy(true);
    try {
      if (submitFn) await submitFn(val);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(f) {
    const file = f ?? fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      if (onUpload) {
        const res = await onUpload(file);
        if (res && res.url) {
          const newVal = `${val}\n![media](${res.url})`;
          setVal(newVal);
        }
      } else {
        // no onUpload handler provided; skip upload
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <textarea
        className={styles.descriptionBox}
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Add/edit event description..."
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input ref={fileRef} type="file" onChange={e => handleUpload(e.target.files?.[0])} />
        <button onClick={handleSave} disabled={busy}>
          Save
        </button>
      </div>
    </div>
  );
}
