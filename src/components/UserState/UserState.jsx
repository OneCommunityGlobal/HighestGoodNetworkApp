import React from "react";
import styles from "./UserState.module.css";

const UserState = ({ states = [], catalog = [] }) => {
  if (!states || states.length === 0) return null;

  const selected = catalog.filter((opt) => states.includes(opt.key));

  return (
    <div
      className={styles.container}
      title="This is the user’s state. Ask an Admin to change it for you if you feel it is not accurate."
    >
      {selected.map((opt) => (
        <span key={opt.key} className={`${styles.pill} ${styles[opt.color] || ""}`}>
          {opt.label}
        </span>
      ))}
    </div>
  );
};

export default UserState;
