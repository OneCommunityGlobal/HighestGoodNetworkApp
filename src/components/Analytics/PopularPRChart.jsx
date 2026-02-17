import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const data = [
  { prNumber: "PR1234", reviews: 10 },
  { prNumber: "PR1235", reviews: 8 },
  { prNumber: "PR1236", reviews: 15 },
  { prNumber: "PR1237", reviews: 5 },
  { prNumber: "PR1238", reviews: 12 },
  { prNumber: "PR1231", reviews: 12 },
  { prNumber: "PR1256", reviews: 17 },
  { prNumber: "PR1255", reviews: 19 },
  { prNumber: "PR1254", reviews: 1 },
  { prNumber: "PR1253", reviews: 2 },
  { prNumber: "PR1252", reviews: 7 },
  { prNumber: "PR1251", reviews: 9 },
  { prNumber: "PR1250", reviews: 11 },
  { prNumber: "PR1249", reviews: 19 },
  { prNumber: "PR1248", reviews: 0 },
  { prNumber: "PR1242", reviews: 2 },
  { prNumber: "PR1241", reviews: 50 },
];

const PopularPRChart = ({ duration }) => {
  const filteredData = data;

  return (
    <div style={{ width: "100%", height: 500, overflowY: "auto" }}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={filteredData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 150, bottom: 40 }}
        >
          <XAxis
            type="number"
            label={{
              value: "Number of Reviews",
              position: "insideBottom",
              offset: -5,
            }}
          />

          <YAxis
            dataKey="prNumber"
            type="category"
            label={{
              value: "PR Numbers",
              angle: -90,
              position: "insideLeft",
            }}
            width={100}
          />

          <Tooltip />

          <Bar dataKey="reviews" fill="#052C65">
            <LabelList dataKey="reviews" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PopularPRChart;
