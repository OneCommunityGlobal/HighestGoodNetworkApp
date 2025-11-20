// src/components/UserState/UserStateModal.jsx
import React, { useEffect, useState } from "react";
import {
  fetchCatalog,
  updateUserStates,
  createNewState,
} from "./userState.api";
import styles from "./userState.module.css";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

/**
 * Props:
 * - isOpen
 * - toggle
 * - userId
 * - existingStates: [{key, assignedAt}]
 * - onUpdated (callback to parent)
 */
export default function UserStateModal({
  isOpen,
  toggle,
  userId,
  existingStates = [],
  onUpdated,
}) {
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loadingSave, setLoadingSave] = useState(false);

  // New state creation
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#3498db");

  /* ---------------------------------------------------------
     Load catalog + initial selections
  ----------------------------------------------------------*/
  useEffect(() => {
    if (!isOpen) return;

    async function load() {
      const items = await fetchCatalog();
      setCatalog(items);

      const existingKeys = existingStates.map((s) => s.key);
      setSelected(new Set(existingKeys));
    }

    load();
  }, [isOpen, existingStates]);

  /* ---------------------------------------------------------
     Toggle selection
  ----------------------------------------------------------*/
  const toggleSelect = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  /* ---------------------------------------------------------
     Save new state to catalog
  ----------------------------------------------------------*/
  const handleCreateState = async () => {
    if (!newLabel.trim()) return;

    const created = await createNewState(newLabel.trim(), newColor);

    // Add to catalog list
    const updatedCatalog = await fetchCatalog();
    setCatalog(updatedCatalog);

    // Auto-select this new state
    setSelected((prev) => new Set(prev).add(created.key));

    // Reset new state input
    setNewLabel("");
    setNewColor("#3498db");
  };

  /* ---------------------------------------------------------
     Save user selections
  ----------------------------------------------------------*/
  const handleSave = async () => {
    setLoadingSave(true);

    const selectedKeys = [...selected];

    const newValues = await updateUserStates(userId, selectedKeys);

    setLoadingSave(false);
    toggle(); // close modal

    if (onUpdated) onUpdated(newValues);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Manage User States</ModalHeader>

      <ModalBody>
        {/* State selection list */}
        <h6>Available States</h6>

        {catalog.map((c) => {
          const isSelected = selected.has(c.key);
          return (
            <div
              key={c.key}
              className={`${styles["state-list-item"]} ${
                isSelected ? styles["state-selected"] : ""
              }`}
              onClick={() => toggleSelect(c.key)}
            >
              <span
                style={{
                  color: c.color,
                  fontWeight: 600,
                }}
              >
                {c.label}
              </span>
              {isSelected && <span>✓</span>}
            </div>
          );
        })}

        <hr />

        {/* New state creation */}
        <h6>Create New State</h6>

        <input
          className={styles["new-state-input"]}
          placeholder="State label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />

        <label style={{ marginTop: "6px", fontSize: "12px" }}>
          Color:
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            style={{ marginLeft: "6px", cursor: "pointer" }}
          />
        </label>

        <button className={styles["save-btn"]} onClick={handleCreateState}>
          + Add to Catalog
        </button>
      </ModalBody>

      <ModalFooter>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loadingSave}
        >
          {loadingSave ? "Saving..." : "Save"}
        </button>

        <button className="btn btn-secondary" onClick={toggle}>
          Cancel
        </button>
      </ModalFooter>
    </Modal>
  );
}
