import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import styles from './DistributionLaborHours.module.css';

const COLORS = ['#003f5c', '#2f4b7c', '#ffa600', '#ff6361', '#f3e5ab'];

const data = [
  { name: 'Stud Wall Construction', value: 25.9 },
  { name: 'Foundation Concreting', value: 18.5 },
  { name: 'Task 1', value: 22.2 },
  { name: 'Task 2', value: 18.5 },
  { name: 'Task 3', value: 14.8 },
];

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
