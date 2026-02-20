/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

const ReviewersRequirementChart = ({ duration }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAPIData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:4500/api/analytics/github-reviews?duration=${duration}&sort=asc`,
          {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message);
        }

        const result = await res.json();

        const processed = result.map((item) => ({
          ...item,
          total:
            (item.Exceptional || 0) +
            (item.Sufficient || 0) +
            (item.NeedsChanges || 0) +
            (item.DidNotReview || 0),
        }));

        setData(processed);
      } catch (err) {
        // If your lint blocks console, keep it silent or wire to your logger/toast
      }
    };

    fetchAPIData();
  }, [duration]);

  const sortedData = [...data]
    .map((item) => ({
      ...item,
      ...item.counts,
      total: Object.values(item.counts || {}).reduce(
        (acc, val) => acc + val,
        0
      ),
    }))
    .sort((a, b) => b.total - a.total);

  const barHeight = 15;
  const chartHeight = sortedData.length * barHeight;

  return (
    <div style={{ width: "100%", height: chartHeight + 100 }}>
      <div style={{ height: "400px", overflowY: "auto" }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 20, right: 30, left: 100, bottom: 40 }}
          >
            <XAxis type="number" />
            <YAxis dataKey="reviewer" type="category" />
            <Tooltip />
            <Legend />

            <Bar dataKey="Exceptional" stackId="a" fill="#052C65" />
            <Bar dataKey="Sufficient" stackId="a" fill="#4682B4" />
            <Bar dataKey="NeedsChanges" stackId="a" fill="#FF8C00" />
            <Bar dataKey="DidNotReview" stackId="a" fill="#A9A9A9">
              <LabelList
                dataKey="total"
                position="right"
                style={{ fill: "black", fontSize: 12, fontWeight: "bold" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReviewersRequirementChart;
