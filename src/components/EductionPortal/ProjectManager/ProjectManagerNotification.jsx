import React from "react";
import styles from "./ProjectManagerNotification.module.css";

async function sendNotification({ educatorIds, message }) {
  await new Promise((r) => setTimeout(r, 550));
  if (!educatorIds.length || !message.trim()) {
    throw new Error("Select at least one educator and enter a message.");
  }
  return { ok: true };
}

export default function ProjectManagerNotification({ educators, onClose, onSent }) {
  const [selected, setSelected] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState(null);

  const allChecked = selected.length === educators.length && educators.length > 0;
  const someChecked = selected.length > 0 && selected.length < educators.length;

  function toggleAll() {
    if (allChecked) {
      setSelected([]);
    } else {
      setSelected(educators.map((e) => e.id));
    }
  }

  function toggleOne(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      await sendNotification({ educatorIds: selected, message });
      onSent({ educatorIds: selected, message });
    } catch (e) {
      setError(e.message || "Failed to send.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="composer-title">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 id="composer-title" className={styles.title}>New Announcement</h3>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Recipients</div>

            <label className={styles.checkAll}>
              <input
                type="checkbox"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked;
                }}
                onChange={toggleAll}
              />
              Select all
            </label>

            <div className={styles.list}>
              {educators.map((e) => (
                <label key={e.id} className={styles.item}>
                  <input
                    type="checkbox"
                    checked={selected.includes(e.id)}
                    onChange={() => toggleOne(e.id)}
                  />
                  <span className={styles.itemText}>
                    <span className={styles.itemName}>{e.name}</span>
                    <span className={styles.itemMeta}> • {e.subject}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>Message</div>
            <textarea
              className={styles.textarea}
              placeholder="Write your announcement to teachers…"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
            />
            <div className={styles.counter}>{message.length}/1000</div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtnNotify} onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button
            className={styles.primaryBtn}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? "Sending…" : "Send Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
}
