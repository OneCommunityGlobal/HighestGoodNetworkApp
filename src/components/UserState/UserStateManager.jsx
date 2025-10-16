import React from 'react';
import axios from 'axios';
import UserState from './UserState';
import UserStateEdit from './UserStateEdit';
import styles from './UserStateEdit.module.css';

const API_BASE = process.env.REACT_APP_APIENDPOINT || '';

let catalogCache = null;
let catalogPromise = null;

const selectionsCache = new Map();
const selectionsPromiseCache = new Map();

export default function UserStateManager({ userId, canEdit, user, initialSelections = [] }) {
  const [open, setOpen] = React.useState(false);

  const [selections, setSelections] = React.useState(
    (Array.isArray(initialSelections) ? initialSelections : []).map(s =>
      typeof s === 'string' ? { key: s } : s,
    ),
  );

  const [catalog, setCatalog] = React.useState(catalogCache || []);
  const [loadingSel, setLoadingSel] = React.useState(false);
  const [loadingCat, setLoadingCat] = React.useState(false);
  const [error, setError] = React.useState('');

  const api = React.useMemo(() => {
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : '';

      // Try to build an axios instance
      const instance = axios?.create?.({
        baseURL: `${process.env.REACT_APP_APIENDPOINT || ''}/user-states`,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (instance && typeof instance.get === 'function') {
        return instance;
      }
    } catch { }
    return {
      get: async () => ({ data: { selections: [] } }),
      post: async () => ({ data: {} }),
      put: async () => ({ data: {} }),
      delete: async () => ({ data: {} }),
    };
  }, []);

  React.useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    if (selectionsCache.has(userId)) {
      setSelections(selectionsCache.get(userId));
      return;
    }

    const inflight = selectionsPromiseCache.get(userId);
    if (inflight) {
      setLoadingSel(true);
      inflight
        .then(data => {
          if (!cancelled) setSelections(data);
        })
        .catch(() => {
          if (!cancelled) setError('Failed to load user state');
        })
        .finally(() => {
          if (!cancelled) setLoadingSel(false);
        });
      return;
    }

    setLoadingSel(true);
    const p = api
      .get(`/users/${userId}/state-indicators`)
      .then(res => {
        const d = res?.data;
        const sels = Array.isArray(d?.selections)
          ? d.selections
          : (d?.stateIndicators || []).map(k => ({ key: k, assignedAt: null }));
        selectionsCache.set(userId, sels);
        return sels;
      })
      .finally(() => selectionsPromiseCache.delete(userId));

    selectionsPromiseCache.set(userId, p);

    p.then(sels => {
      if (!cancelled) setSelections(sels);
    })
      .catch(() => {
        if (!cancelled) setError('Failed to load user state');
      })
      .finally(() => {
        if (!cancelled) setLoadingSel(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api, userId]);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadCatalog = async () => {
      if (catalogCache) return catalogCache;
      if (!catalogPromise) {
        catalogPromise = api
          .get('/catalog')
          .then(res => (Array.isArray(res?.data?.items) ? res.data.items : []))
          .then(items => (catalogCache = items))
          .finally(() => {
            catalogPromise = null;
          });
      }
      return catalogPromise;
    };

    setLoadingCat(true);
    loadCatalog()
      .then(items => {
        if (!cancelled) setCatalog(items || []);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load catalog');
      })
      .finally(() => {
        if (!cancelled) setLoadingCat(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, api]);

  return (
    <div>
      <UserState selections={selections} catalog={catalog} />

      <div style={{ marginTop: 6 }}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => setOpen(true)}
          title="Add user state"
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
          apiBase={`${API_BASE}`}
          onSaved={(nextSelections, nextCatalog) => {
            setSelections(nextSelections);
            setCatalog(nextCatalog);
            selectionsCache.set(userId, nextSelections);
            catalogCache = nextCatalog;
          }}
        />
      )}

      {(loadingSel || loadingCat) && (
        <div style={{ opacity: 0.7, marginTop: 6 }}>
          {loadingSel ? '(loading user state…)' : ''}
          {loadingCat ? ' (loading catalog…)' : ''}
        </div>
      )}
      {!!error && !(loadingSel || loadingCat) && (
        <div style={{ color: 'red', marginTop: 6 }}>— {error}</div>
      )}
    </div>
  );
}
