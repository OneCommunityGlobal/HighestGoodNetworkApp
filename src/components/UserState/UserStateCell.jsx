// src/components/UserState/UserStateCell.jsx
import React from "react";
import UserStateChip from "./UserStateChip";
import styles from "./userState.module.css";

/**
 * Props:
 * - userId
 * - catalog: [{ key, label, color }]
 * - userStates: [{ key, assignedAt }]
 * - onOpenModal: function
 * - canEdit: boolean (owner/admin only)
 */
export default function UserStateCell({
  catalog = [],
  userStates = [],
  onOpenModal,
  canEdit = true,
}) {
  // map keys to labels/colors
  const map = Object.fromEntries(
    catalog.map((c) => [c.key, { label: c.label, color: c.color }])
  );

  return (
    <div className={styles["state-container"]}>
      {/* Existing states */}
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

      {/* Add button only for Owner/Admin */}
      {canEdit && (
        <div className={styles["add-chip"]} onClick={onOpenModal}>
          + Add
        </div>
      )}
    </div>
  );
}
