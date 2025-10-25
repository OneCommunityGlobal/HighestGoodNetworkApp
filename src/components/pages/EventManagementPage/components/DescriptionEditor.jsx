import { useRef, useState } from 'react';
import styles from '../EventOrganizerPage.module.css';

export default function DescriptionEditor({ initialValue, onSave, onUpload }) {
  const [val, setVal] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  async function handleSave() {
    setBusy(true);
    try {
      await onSave(val);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(f) {
    const file = f ?? fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const res = await onUpload(file);
      if (res && res.url) {
        const newVal = `${val}\n![media](${res.url})`;
        setVal(newVal);
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
