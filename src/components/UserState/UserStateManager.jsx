// src/components/UserState/UserStateManager.jsx
import React from "react";
import axios from "axios";
import UserState from "./UserState";
import UserStateEdit from "./UserStateEdit";
import styles from "./UserStateEdit.module.css";

const API_BASE = process.env.REACT_APP_APIENDPOINT;

export default function UserStateManager({ userId, canEdit, user}) {
  const [open, setOpen] = React.useState(false);

  const [catalog, setCatalog]       = React.useState([]);  
  const [selections, setSelections] = React.useState([]);  
  const [loading, setLoading]       = React.useState(true);
  const [error, setError]           = React.useState("");

  const api = React.useMemo(() => {
    const token = localStorage.getItem("token");
    return axios.create({
      baseURL: `${API_BASE}/user-states`,
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
  }, [API_BASE]);

  React.useEffect(() => {
    console.log(user);
  },[open])

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [cataRes, selRes] = await Promise.allSettled([
          api.get("/catalog"),
          api.get(`/users/${userId}/state-indicators`),
        ]);

        if (!cancelled) {
          // catalog
          if (cataRes.status === "fulfilled") {
            const items = Array.isArray(cataRes.value?.data?.items) ? cataRes.value.data.items : [];
            console.log(items);
            setCatalog(items);
          } else {
            setCatalog([]);
            setError("Could not load catalog");
            console.error("GET /catalog failed", cataRes.reason?.response?.status, cataRes.reason?.message);
          }

          if (selRes.status === "fulfilled") {
            const data = selRes.value?.data;
            const sels = Array.isArray(data?.selections)
              ? data.selections
              : Array.isArray(data?.stateIndicators)
                ? data.stateIndicators.map(k => ({ key: k, assignedAt: null }))
                : [];
            setSelections(sels);
          } else {
            setSelections([]);
            setError(prev => prev || "Could not load user state");
            console.error("GET /users/:id/state-indicators failed", selRes.reason?.response?.status, selRes.reason?.message);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [api, userId]);

  return (
    <div>
      {loading && <div style={{ opacity: .7, marginBottom: 6 }}>Loading…</div>}
      {!!error && !loading && <div style={{ color: "red", marginBottom: 6 }}>{error}</div>}

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
        }}
      />
    </div>
  );
}
