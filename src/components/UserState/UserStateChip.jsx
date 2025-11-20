// src/components/UserState/UserStateChip.jsx
import React from "react";
import styles from "./userState.module.css";

/**
 * Props:
 *  - label: string
 *  - color: string (hex color)
 *  - editable: boolean (owner/admin only)
 */
export default function UserStateChip({ label, color, editable }) {
  return (
    <div
      className={`${styles["state-chip"]} ${
        editable ? styles["state-chip-editable"] : ""
      }`}
      style={{
        backgroundColor: color || "#3498db",
      }}
    >
      {label}
    </div>
  );
}
