import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import styles from './EquipmentUpdateForm.module.css';

const today = () => new Date().toLocaleDateString('en-CA');
const emptyForm = () => ({
  project: '',
  type: '',
  item: '',
  count: '',
  date: today(),
  condition: '',
});
const personName = person =>
  person && typeof person === 'object'
    ? [person.firstName, person.lastName].filter(Boolean).join(' ') || person.userid || person._id
    : person || 'User not recorded';

export default function EquipmentUpdateForm() {
  const user = useSelector(state => state.auth?.user);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [form, setForm] = useState(emptyForm);
  const [data, setData] = useState({ projects: [], tools: [], equipment: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [touched, setTouched] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [projects, tools, equipment] = await Promise.all([
        axios.get(ENDPOINTS.BM_PROJECTS),
        axios.get(ENDPOINTS.BM_TOOLS),
        axios.get(ENDPOINTS.BM_EQUIPMENTS),
      ]);
      setData({ projects: projects.data, tools: tools.data, equipment: equipment.data });
    } catch (error) {
      setLoadError('Unable to load inventory. Please retry before updating.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const items = (form.type === 'Tool' ? data.tools : data.equipment).filter(
    item => String(item.project?._id || item.project) === form.project,
  );
  const selected = items.find(item => item._id === form.item);
  const project = data.projects.find(item => item._id === form.project);
  const currentCount = selected?.count ?? null;
  const itemName = item => item.itemType?.name || `Unnamed item (${item._id})`;
  const errors = {
    project: !form.project && 'Select a project.',
    type: !form.type && 'Select Tool or Equipment.',
    item: !selected && 'Select an item from this project.',
    count:
      (!/^\d+$/.test(form.count) || !Number.isSafeInteger(Number(form.count))) &&
      'Enter a whole number of zero or more within the supported range.',
    date:
      (!/^\d{4}-\d{2}-\d{2}$/.test(form.date) || form.date > today()) &&
      'Select an update date today or earlier.',
    condition: !form.condition && 'Select the item condition.',
    user:
      !(user?.userid || user?._id || user?.id) && 'Sign in again to record who made this update.',
  };
  const change = event => {
    const { name, value } = event.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(['project', 'type'].includes(name) ? { item: '', count: '', condition: '' } : {}),
      ...(name === 'item' ? { count: '', condition: '' } : {}),
    }));
    setSaveError('');
  };
  const inputProps = name => ({
    id: name,
    name,
    value: form[name],
    onChange: change,
    onBlur: () => setTouched(prev => ({ ...prev, [name]: true })),
    required: true,
    'aria-invalid': Boolean(touched[name] && errors[name]),
    'aria-describedby': `${name}-hint ${name}-error`,
    disabled: loading || saving,
  });
  const feedback = name => (
    <span id={`${name}-error`} className={styles.toolFormError} aria-live="polite">
      {touched[name] && errors[name] ? errors[name] : ''}
    </span>
  );
  const reset = () => {
    setForm(emptyForm());
    setTouched({});
    setSaveError('');
  };
  const review = event => {
    event.preventDefault();
    setTouched(Object.fromEntries(Object.keys(errors).map(key => [key, true])));
    const invalid = Object.keys(errors).find(key => errors[key]);
    if (invalid) {
      document.getElementById(invalid)?.focus();
      return;
    }
    setConfirm(true);
  };
  const save = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const base =
        form.type === 'Tool'
          ? ENDPOINTS.BM_TOOL_BY_ID(form.item)
          : ENDPOINTS.BM_EQUIPMENT_BY_ID(form.item);
      const response = await axios.put(`${base}/count`, {
        count: Number(form.count),
        expectedCount: currentCount,
        projectId: form.project,
        date: form.date,
        condition: form.condition,
      });
      const key = form.type === 'Tool' ? 'tools' : 'equipment';
      setData(prev => ({
        ...prev,
        [key]: prev[key].map(item =>
          item._id === form.item
            ? {
                ...item,
                count: response.data.count,
                countHistory: response.data.countHistory.map(entry =>
                  String(entry.createdBy) === String(user.userid || user._id || user.id)
                    ? { ...entry, createdBy: user }
                    : entry,
                ),
              }
            : item,
        ),
      }));
      toast.success('Count and update history saved successfully.');
      setConfirm(false);
      reset();
    } catch (error) {
      setSaveError(
        error.response?.data?.message ||
          'Unable to save. Your entries have been kept. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };
  const history = [...(selected?.countHistory || []), ...(selected?.updateRecord || [])]
    .sort((a, b) => new Date(b.recordedAt || b.date) - new Date(a.recordedAt || a.date))
    .slice(0, 5);
  return (
    <div className={styles.addToolForm}>
      {loading && <p role="status">Loading projects and inventory…</p>}
      {loadError && (
        <div role="alert">
          {loadError} <Button onClick={load}>Retry</Button>
        </div>
      )}
      <form onSubmit={review} noValidate aria-busy={loading || saving}>
        <fieldset disabled={saving || loading || Boolean(loadError)}>
          <legend>1. Select the item</legend>
          <div className={styles.formGrid}>
            <div>
              <label htmlFor="project">Project *</label>
              <select {...inputProps('project')}>
                <option value="">Select Project</option>
                {data.projects.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <small id="project-hint">Choose the project holding this inventory.</small>
              {feedback('project')}
            </div>
            <div>
              <label htmlFor="type">Tool or Equipment *</label>
              <select {...inputProps('type')}>
                <option value="">Select type</option>
                <option>Tool</option>
                <option>Equipment</option>
              </select>
              <small id="type-hint">Choose the inventory category.</small>
              {feedback('type')}
            </div>
          </div>
          <label htmlFor="item">Name *</label>
          <select
            {...inputProps('item')}
            disabled={!form.project || !form.type || loading || saving}
          >
            <option value="">Select item</option>
            {items.map(item => (
              <option key={item._id} value={item._id}>
                {itemName(item)} — {item.code != null ? `Code ${item.code}` : `ID ${item._id}`}
              </option>
            ))}
          </select>
          <small id="item-hint">
            {!form.project || !form.type
              ? 'Select a project and type first.'
              : items.length
              ? 'Use the code or record ID to identify the correct item.'
              : 'No items exist for this project and type.'}
          </small>
          {feedback('item')}
        </fieldset>
        {selected && (
          <section className={styles.currentCountBox} aria-labelledby="preview-title">
            <h3 id="preview-title">Selected item</h3>
            <dl>
              <dt>Project</dt>
              <dd>{project?.name}</dd>
              <dt>Name</dt>
              <dd>{itemName(selected)}</dd>
              <dt>Record ID</dt>
              <dd>{selected._id}</dd>
              <dt>Current total</dt>
              <dd>{currentCount ?? 'Not recorded'}</dd>
              <dt>Proposed total</dt>
              <dd>{form.count || 'Enter a total below'}</dd>
            </dl>
            <h3>Last update history</h3>
            {history.length ? (
              <ul>
                {history.map((entry, index) => (
                  <li key={`${entry.date}-${index}`}>
                    {entry.date && !Number.isNaN(new Date(entry.date).getTime())
                      ? new Date(`${entry.date.slice(0, 10)}T00:00:00`).toLocaleDateString()
                      : 'Date not recorded'}
                    {' — '}
                    {personName(entry.createdBy)}
                    {' — '}
                    {entry.condition || 'Condition not recorded'}
                    {entry.count != null &&
                      ` — Total: ${entry.previousCount ?? 'Not recorded'} → ${entry.count}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No update history has been recorded for this item.</p>
            )}
          </section>
        )}
        <fieldset disabled={saving || loading || Boolean(loadError)}>
          <legend>2. Enter the update</legend>
          <label htmlFor="count">New Total Number *</label>
          <input {...inputProps('count')} type="text" inputMode="numeric" />
          <small id="count-hint">
            Enter zero or a positive whole number. This replaces the current total.
          </small>
          {feedback('count')}
          <div className={styles.formGrid}>
            <div>
              <label htmlFor="date">Update date *</label>
              <input {...inputProps('date')} type="date" max={today()} />
              <small id="date-hint">The date this inventory was checked.</small>
              {feedback('date')}
            </div>
            <div>
              <label htmlFor="condition">Condition *</label>
              <select {...inputProps('condition')}>
                <option value="">Select condition</option>
                <option>Good</option>
                <option>Needs Repair</option>
                <option>Out of Order</option>
              </select>
              <small id="condition-hint">Record the condition observed.</small>
              {feedback('condition')}
            </div>
          </div>
          <label htmlFor="user">Updated by *</label>
          <input
            id="user"
            value={personName(user)}
            readOnly
            aria-describedby="user-hint user-error"
            aria-invalid={Boolean(errors.user)}
          />
          <small id="user-hint">Your signed-in account is recorded automatically.</small>
          <span id="user-error" role="alert">
            {errors.user || ''}
          </span>
        </fieldset>
        <div className={styles.addToolButtons}>
          <Button color="primary" type="submit" disabled={loading || saving || Boolean(loadError)}>
            Review update
          </Button>
          <Button type="button" onClick={reset} disabled={saving}>
            Reset form
          </Button>
        </div>
      </form>
      <Modal
        isOpen={confirm}
        toggle={saving ? undefined : () => setConfirm(false)}
        labelledBy="confirm-count-title"
        className={darkMode ? styles.darkModal : ''}
        backdrop={saving ? 'static' : true}
        keyboard={!saving}
      >
        <ModalHeader id="confirm-count-title" toggle={saving ? undefined : () => setConfirm(false)}>
          Confirm inventory update
        </ModalHeader>
        <ModalBody>
          <p>
            Replace the total for <strong>{selected && itemName(selected)}</strong> in{' '}
            <strong>{project?.name}</strong>?
          </p>
          <p>Record ID: {form.item}</p>
          <p>
            Current total: {currentCount ?? 'Not recorded'} → New total: {form.count}
          </p>
          <p>
            Date: {form.date} · Condition: {form.condition} · Updated by: {personName(user)}
          </p>
          {saveError && <p role="alert">{saveError}</p>}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setConfirm(false)} disabled={saving}>
            Back to form
          </Button>
          <Button color="primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Confirm update'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
