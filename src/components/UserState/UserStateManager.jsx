// src/components/UserState/UserStateManager.jsx
import React from "react";
import axios from "axios";
import UserState from "./UserState";
import UserStateEdit from "./UserStateEdit";
import styles from "./UserStateEdit.module.css";

const API_BASE = process.env.REACT_APP_APIENDPOINT;

// ---- Global caches ----------------------------------------------------------
let catalogCache = null;
let catalogPromise = null;

const selectionsCache = new Map();          // userId -> [{key, assignedAt?}, ...]
const selectionsPromiseCache = new Map();   // userId -> inflight Promise

export default function UserStateManager({
  userId,
  canEdit,
  user,
  initialSelections = [],   // e.g. pass user.stateIndicators
}) {
  const [open, setOpen] = React.useState(false);

  // show pills immediately from props (if present)
  const [selections, setSelections] = React.useState(
    (Array.isArray(initialSelections) ? initialSelections : [])
      .map(s => (typeof s === "string" ? { key: s } : s))
  );

  const [catalog, setCatalog] = React.useState(catalogCache || []);
  const [loadingSel, setLoadingSel] = React.useState(false);
  const [loadingCat, setLoadingCat] = React.useState(false);
  const [error, setError] = React.useState("");

  const api = React.useMemo(() => {
    const token = localStorage.getItem("token");
    return axios.create({
      baseURL: `${API_BASE}/user-states`,
      headers: {
        "Content-Type": "application/json",
        Authorization: token, // keep your auth header scheme
      },
    });
  }, []);

  // --- 1) Prefetch assigned states ONCE per user at page load ----------------
  React.useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    // if cached, use it immediately
    if (selectionsCache.has(userId)) {
      setSelections(selectionsCache.get(userId));
      return;
    }

    // if another instance is fetching the same user, reuse the promise
    const inflight = selectionsPromiseCache.get(userId);
    if (inflight) {
      setLoadingSel(true);
      inflight
        .then(data => { if (!cancelled) setSelections(data); })
        .catch(() => { if (!cancelled) setError("Failed to load user state"); })
        .finally(() => { if (!cancelled) setLoadingSel(false); });
      return;
    }

    setLoadingSel(true);
    const p = api.get(`/users/${userId}/state-indicators`)
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

    p.then(sels => { if (!cancelled) setSelections(sels); })
     .catch(() => { if (!cancelled) setError("Failed to load user state"); })
     .finally(() => { if (!cancelled) setLoadingSel(false); });

    return () => { cancelled = true; };
  }, [api, userId]);

  // --- 2) Fetch catalog ONLY when the modal opens (with cache) ---------------
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadCatalog = async () => {
      if (catalogCache) return catalogCache;
      if (!catalogPromise) {
        catalogPromise = api.get("/catalog")
          .then(res => Array.isArray(res?.data?.items) ? res.data.items : [])
          .then(items => (catalogCache = items))
          .finally(() => { catalogPromise = null; });
      }
      return catalogPromise;
    };

    setLoadingCat(true);
    loadCatalog()
      .then(items => { if (!cancelled) setCatalog(items || []); })
      .catch(() => { if (!cancelled) setError("Failed to load catalog"); })
      .finally(() => { if (!cancelled) setLoadingCat(false); });

    return () => { cancelled = true; };
  }, [open, api]);

  return (
    <div>
      {/* Pills: always render from local state (prefilled from cache/prop) */}
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
            // keep caches in sync
            selectionsCache.set(userId, nextSelections);
            catalogCache = nextCatalog;
          }}
        />
      )}

      {(loadingSel || loadingCat) && (
        <div style={{ opacity: .7, marginTop: 6 }}>
          {loadingSel ? "(loading user state…)" : ""}
          {loadingCat ? " (loading catalog…)" : ""}
        </div>
      )}
      {!!error && !(loadingSel || loadingCat) && (
        <div style={{ color: "red", marginTop: 6 }}>— {error}</div>
      )}
    </div>
  );
}
