import React from "react";
import api from "~/api/client";
import UserState from "./UserState";
import UserStateEdit from "./UserStateEdit";
import styles from "./UserStateEdit.module.css";

export default function UserStateManager({
  userId,
  canEdit,
}) {
  const [open, setOpen] = React.useState(false);

  const [catalog, setCatalog]       = React.useState([]);
  const [selections, setSelections] = React.useState([]); // [{ key, assignedAt }]
  const [loading, setLoading]       = React.useState(true);
  const [error, setError]           = React.useState("");

  // initial load (catalog + selections)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");

        const [cataRes, selRes] = await Promise.all([
          api.get(`/catalog`),
          api.get(`/users/${userId}/state-indicators`)
        ]);

        const items = Array.isArray(cataRes?.data?.items) ? cataRes.data.items : [];
        const sels  = Array.isArray(selRes?.data?.selections) ? selRes.data.selections : [];

        if (!cancelled) {
          setCatalog(items);
          setSelections(sels);
        }
      } catch (e) {
        if (!cancelled) setError("Could not load user state");
        console.error("initial load failed", e?.response?.status, e?.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div>
      {loading ? (
        <span style={{opacity:.7}}>Loading…</span>
      ) : error ? (
        <span style={{color:"red"}}>{error}</span>
      ) : (
        <>
          <UserState selections={selections} catalog={catalog} />
          {canEdit && (
            <div style={{ marginTop: 6 }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setOpen(true)}
                title="Add user state"
              >
                Add
              </button>
            </div>
          )}
        </>
      )}

      <UserStateEdit
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        catalog={catalog}
        selections={selections}
        canEditCatalog={canEdit}
        onSaved={(nextSelections, nextCatalog) => {
          setSelections(nextSelections);
          setCatalog(nextCatalog);
        }}
      />
    </div>
  );
}
