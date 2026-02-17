import React, { useState } from "react";
import ReviewersRequirementChart from "./ReviewersRequirementChart";
import PopularPRChart from "./PopularPRChart";

const durationOptions = [
  { label: "Last Week", value: "lastWeek" },
  { label: "Last 2 weeks", value: "last2weeks" },
  { label: "Last Month", value: "lastMonth" },
  { label: "All Time", value: "allTime" },
];

const AnalyticsDashboard = () => {
  const [duration, setDuration] = useState("lastWeek");

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <label htmlFor="duration">Duration: </label>

        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          {durationOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>
          Reviewers Ranked by Requirement Satisfied
        </h2>
        <ReviewersRequirementChart duration={duration} />
      </div>

      {/*
      <div>
        <h2 style={{ marginBottom: "1rem" }}>20 Most Popular PRs</h2>
        <PopularPRChart duration={duration} />
      </div>
      */}
    </div>
  );
};

export default AnalyticsDashboard;
