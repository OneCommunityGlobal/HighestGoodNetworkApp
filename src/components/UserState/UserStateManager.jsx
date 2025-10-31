import React from 'react';
import axios from 'axios';
import UserState from './UserState';
import UserStateEdit from './UserStateEdit';
import styles from './UserStateEdit.module.css';

const API_BASE = (process.env.REACT_APP_APIENDPOINT || '/api') + '/user-states';

export default function UserStateManager({ userId, canEdit, initialSelections = [] }) {
  const [open, setOpen] = React.useState(false);
  const [selections, setSelections] = React.useState(
    (Array.isArray(initialSelections) ? initialSelections : []).map(s =>
      typeof s === 'string' ? { key: s } : s
    )
  );
  const [catalog, setCatalog] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const api = React.useMemo(() => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : '';
    return axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }, []);

  React.useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get(`/users/${userId}/state-indicators`)
      .then(res => {
        if (cancelled) return;
        const d = res?.data || {};
        const arr = Array.isArray(d?.selections)
          ? d.selections
          : (d?.stateIndicators || []).map(k => ({ key: k }));
        setSelections(arr);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load user state');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api, userId]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get('/catalog')
      .then(res => {
        if (cancelled) return;
        const items = Array.isArray(res?.data?.items) ? res.data.items : [];
        setCatalog(items);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load catalog');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  return (
    <div>
      <UserState selections={selections} catalog={catalog} />
      <div style={{ marginTop: 6 }}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => setOpen(true)}
          disabled={!canEdit}
        >
          Add
        </button>
      </div>

      {open && (
        <UserStateEdit
          open={open}
          onClose={() => setOpen(false)}
          userId={userId}
          catalog={catalog}
          selections={selections}
          canEditCatalog={canEdit}
          apiBase={process.env.REACT_APP_APIENDPOINT || '/api'}
          onSaved={(nextSelections, nextCatalog) => {
            setSelections(nextSelections);
            setCatalog(nextCatalog);
          }}
        />
      )}

      {loading && <div style={{ opacity: 0.7, marginTop: 6 }}>(loading…)</div>}
      {!!error && !loading && <div style={{ color: 'red', marginTop: 6 }}>— {error}</div>}
    </div>
  );
}
