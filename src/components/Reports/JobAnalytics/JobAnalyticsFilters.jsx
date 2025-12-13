import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { ENDPOINTS } from "../../../utils/URL";

const GRANULARITY_OPTS = [
  { value: "totals", label: "Totals" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

function getLabelStyle(isDark) {
  return {
    color: isDark ? "#e0e0e0" : "#111111",
    display: "flex",
    flexDirection: "column",
    fontSize: "0.9rem",
  };
}

function getInputStyle(isDark) {
  return {
    backgroundColor: isDark ? "#1b2a41" : "#ffffff",
    color: isDark ? "#e0e0e0" : "#111111",
    border: `1px solid ${isDark ? "#555" : "#ccc"}`,
    borderRadius: "4px",
    padding: "0.25rem",
  };
}

function FilterField({ label, children, isDark }) {
  return (
    <label style={getLabelStyle(isDark)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

FilterField.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isDark: PropTypes.bool.isRequired,
};

function JobAnalyticsFilters({ filters, setFilters }) {
  const [roleOptions, setRoleOptions] = useState(["All"]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" &&
      document.body.classList.contains("dark-mode")
  );

  useEffect(() => {
    if (typeof document === "undefined") return;

    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains("dark-mode"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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
  const inputStyle = getInputStyle(isDark);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
      <FilterField label="Dates" isDark={isDark}>
        <select
          name="dateMode"
          value={filters.dateMode}
          onChange={onChange}
          style={inputStyle}
        >
          <option value="All">All</option>
          <option value="Custom">Custom</option>
        </select>
      </FilterField>

      {filters.dateMode === "Custom" && (
        <>
          <FilterField label="Start Date" isDark={isDark}>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={onChange}
              style={inputStyle}
            />
          </FilterField>

          <FilterField label="End Date" isDark={isDark}>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={onChange}
              style={inputStyle}
            />
          </FilterField>
        </>
      )}

      <FilterField label="Role" isDark={isDark}>
        <select
          name="roles"
          value={filters.roles}
          onChange={onChange}
          disabled={loadingRoles}
          style={inputStyle}
        >
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Granularity" isDark={isDark}>
        <select
          name="granularity"
          value={filters.granularity}
          onChange={onChange}
          style={inputStyle}
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
