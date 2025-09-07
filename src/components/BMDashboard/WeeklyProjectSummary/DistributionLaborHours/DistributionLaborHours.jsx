import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import styles from './DistributionLaborHours.module.css';

const COLORS = ['#f9f3e3', '#2a647c', '#2e8ea3', '#ffab91', '#ffccbb', '#bbbbbbff'];

const originalData = [
  { name: 'Stud Wall Construction', value: 25.9 },
  { name: 'Foundation Concreting', value: 18.5 },
  { name: 'Task 1', value: 22.2 },
  { name: 'Task 2', value: 18.5 },
  { name: 'Task 3', value: 14.8 },
  { name: 'Electrical', value: 10 },
  { name: 'Welding', value: 8 },
];

const processData = data => {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const topFive = sorted.slice(0, 5);
  const others = sorted.slice(5);
  const othersTotal = others.reduce((sum, item) => sum + item.value, 0);

  if (others.length > 0) {
    topFive.push({ name: 'Others', value: othersTotal });
  }

  return topFive;
};

const data = processData(originalData);

export default function DistributionLaborHours() {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Distribution of Labor Hours</h3>
      <div className={styles.chartWrapper}>
        <PieChart width={350} height={300}>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}
