import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { ENDPOINTS } from "../../../utils/URL";
import styles from "./JobAnalyticsPage.module.css";

const GRANULARITY_OPTS = [
  { value: "totals", label: "Totals" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

function FilterField({ label, children }) {
  return (
    <label className={styles.filterLabel}>
      <span>{label}</span>
      {children}
    </label>
  );
}

FilterField.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function JobAnalyticsFilters({ filters, setFilters }) {
  const [roleOptions, setRoleOptions] = useState(["All"]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadRoles() {
      setLoadingRoles(true);
      try {
        const resp = await axios.get(ENDPOINTS.JOB_ANALYTICS_ROLES);
        const roles = Array.isArray(resp.data) ? resp.data : [];

        const sorted = [
          "All",
          ...Array.from(new Set(roles)).sort((a, b) =>
            a.localeCompare(b)
          ),
        ];

        if (alive) {
          setRoleOptions(sorted);
          if (!sorted.includes(filters.roles)) {
            setFilters((prev) => ({ ...prev, roles: "All" }));
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load roles:", err);
        if (alive) setRoleOptions(["All"]);
      } finally {
        if (alive) setLoadingRoles(false);
      }
    }

    loadRoles();
    return () => {
      alive = false;
    };
  }, [filters.roles, setFilters]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "dateMode") {
      if (value === "All") {
        setFilters((prev) => ({
          ...prev,
          dateMode: "All",
          startDate: "",
          endDate: "",
          granularity: "totals",
        }));
        return;
      }
      setFilters((prev) => ({ ...prev, dateMode: "Custom" }));
      return;
    }

    if (name === "granularity" && filters.dateMode === "All") {
      setFilters((prev) => ({ ...prev, granularity: "totals" }));
      return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const nonTotalsDisabled = filters.dateMode !== "Custom";

  return (
    <div className={styles.jobAnalyticsFilters}>
      <FilterField label="Dates">
        <select
          name="dateMode"
          value={filters.dateMode}
          onChange={onChange}
          className={styles.filterInput}
        >
          <option value="All">All</option>
          <option value="Custom">Custom</option>
        </select>
      </FilterField>

      {filters.dateMode === "Custom" && (
        <>
          <FilterField label="Start Date">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={onChange}
              className={styles.filterInput}
            />
          </FilterField>

          <FilterField label="End Date">
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={onChange}
              className={styles.filterInput}
            />
          </FilterField>
        </>
      )}

      <FilterField label="Role">
        <select
          name="roles"
          value={filters.roles}
          onChange={onChange}
          disabled={loadingRoles}
          className={styles.filterInput}
        >
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Granularity">
        <select
          name="granularity"
          value={filters.granularity}
          onChange={onChange}
          className={styles.filterInput}
        >
          {GRANULARITY_OPTS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.value !== "totals" && nonTotalsDisabled}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </FilterField>
    </div>
  );
}

JobAnalyticsFilters.propTypes = {
  filters: PropTypes.shape({
    dateMode: PropTypes.string.isRequired,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    roles: PropTypes.string,
    granularity: PropTypes.string,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
};

export default JobAnalyticsFilters;
