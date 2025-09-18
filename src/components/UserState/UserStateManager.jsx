import React, { useMemo, useState } from "react";
import UserState from "./UserState";
import UserStateEdit from "./UserStateEdit";
import styles from "./UserStateEdit.module.css";

export default function UserStateManager({
  initialCatalog,
  initialSelected,
  canEdit,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState(initialCatalog);
  const [selected, setSelected] = useState(initialSelected || []);

  const selectedSafe = useMemo(() => {
    // filter keys that still exist in catalog
    const keys = new Set(catalog.map(c => c.key));
    return (selected || []).filter(k => keys.has(k));
  }, [catalog, selected]);

  const handleSave = (nextSelectedKeys, nextCatalog) => {
    setSelected(nextSelectedKeys);
    setCatalog(nextCatalog);
    onChange && onChange(nextSelectedKeys, nextCatalog);
  };

  return (
    <div>
      <UserState states={selectedSafe} catalog={catalog} />
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

      <UserStateEdit
        open={open}
        onClose={() => setOpen(false)}
        catalog={catalog}
        selectedKeys={selectedSafe}
        onSave={handleSave}
        canEditCatalog={true}
      />
    </div>
  );
}
