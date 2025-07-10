import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import './EditTitle.css';

const patchTitle = (id, title) =>
  axios.patch(`/api/bitly/bitlink/${encodeURIComponent(id)}/title`, { title });

export default function EditableTitle({ bitlinkId, initial, onSave }) {
  const [value, setValue] = useState(initial);
  const [editing, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const commit = async () => {
    if (!editing || value === initial) {
      setEdit(false);
      return;
    }
    setSaving(true);
    try {
      try {
        await patchTitle(bitlinkId, value);
        onSave(value); // optimistic update confirmed
        setEdit(false);
      } catch {
        toast.error('Failed to update title');
        setValue(initial); // revert text
        setEdit(false); // exit edit-mode
      }
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <input
        disabled={saving}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && commit()}
      />
    );
  }

  return (
    <span className="editable-title">
      {value || <em>(untitled)</em>}
      <FontAwesomeIcon
        icon={faPen}
        className="edit-icon"
        onClick={() => setEdit(true)}
        title="Edit title"
      />
    </span>
  );
}
