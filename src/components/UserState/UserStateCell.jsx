import React from "react";
import UserStateChip from "./UserStateChip";
import styles from "./userState.module.css";

export default function UserStateCell({
  catalog = [],
  userStates = [],
  onOpenModal,
  canEdit = true,
}) {
  const map = Object.fromEntries(
    catalog.map((c) => [c.key, { label: c.label, color: c.color }])
  );

  return (
    <div className={styles["state-container"]}>
      {userStates.map((s) => {
        const item = map[s.key];
        if (!item) return null;

        return (
          <UserStateChip
            key={s.key}
            label={item.label}
            color={item.color}
            editable={canEdit}
          />
        );
      })}

      {canEdit && (
        <div className={styles["add-chip"]} onClick={onOpenModal}>
          + Add
        </div>
      )}
    </div>
  );
}
