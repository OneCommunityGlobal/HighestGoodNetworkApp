import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { ENDPOINTS } from "../../../utils/URL";
import JobAnalyticsFilters from "./JobAnalyticsFilters";
import JobAnalyticsGraph from "./JobAnalyticsGraph";
import "./JobAnalyticsPage.css";

const JobAnalyticsCompetitiveRolesPage = () => {
  const darkMode = useSelector((state) => state.theme.darkMode);

  const [filters, setFilters] = useState({
    dateMode: "All",
    startDate: "",
    endDate: "",
    roles: "All",
    granularity: "totals",
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestUrl = useMemo(() => {
    const start = filters.dateMode === "Custom" ? filters.startDate : "";
    const end = filters.dateMode === "Custom" ? filters.endDate : "";
    const gran =
      filters.dateMode === "Custom" && filters.granularity !== "totals"
        ? filters.granularity
        : undefined;

    return ENDPOINTS.JOB_ANALYTICS(start, end, filters.roles, gran);
  }, [filters]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await axios.get(requestUrl);
        if (alive) setData(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        console.error("Error fetching job analytics:", e);
        if (alive) setData([]);
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [requestUrl]);

  return (
    <div
      className={`job-analytics-page ${darkMode ? "dark" : "light"}`}
    >
      <div className="job-analytics-filters">
        <JobAnalyticsFilters filters={filters} setFilters={setFilters} />
      </div>
      {loading ? <p>Loading…</p> : <JobAnalyticsGraph data={data} darkMode={darkMode} />}
    </div>
  );
};

export default JobAnalyticsCompetitiveRolesPage;
