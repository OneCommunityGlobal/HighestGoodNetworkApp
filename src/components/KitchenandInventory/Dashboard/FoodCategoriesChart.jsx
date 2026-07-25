import { useState, useRef, useEffect } from 'react';
import styles from './FoodCategoriesChart.module.css';

const mockData = {
  All: {
    moneySpent: [35000, 25000, 20000, 12000, 8000],
    currentInventory: [350, 250, 200, 120, 80],
  },
  'Kitchen 1': {
    moneySpent: [12000, 8000, 7000, 4000, 3000],
    currentInventory: [120, 80, 70, 40, 30],
  },
  'Kitchen 2': {
    moneySpent: [11000, 9000, 7500, 4500, 2500],
    currentInventory: [110, 90, 75, 45, 25],
  },
  'Kitchen 3': {
    moneySpent: [12000, 8000, 5500, 3500, 2500],
    currentInventory: [120, 80, 55, 35, 25],
  },
};

const categories = ['Produce', 'Grains', 'Proteins', 'Dairy', 'Condiments'];
const colors = ['#6b8e23', '#c8a96e', '#8b3a2a', '#b8b0a0', '#d4c5b0'];

function FoodCategoriesChart() {
  const [metric, setMetric] = useState('currentInventory');
  const [kitchen, setKitchen] = useState('All');
  const [fromDate, setFromDate] = useState('2025-01-01');
  const [toDate, setToDate] = useState('2025-12-31');
  const canvasRef = useRef(null);

  const getTitle = () =>
    metric === 'moneySpent'
      ? 'Food Categories — By Money Spent'
      : 'Food Categories — Current Inventory';

  const getUnit = () => (metric === 'moneySpent' ? '$' : 'lbs');

  const selectedData = mockData[kitchen][metric];
  const total = selectedData.reduce((a, b) => a + b, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = -Math.PI / 2;
    selectedData.forEach((val, i) => {
      const sliceAngle = (val / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      const midAngle = startAngle + sliceAngle / 2;
      const labelX = cx + r * 0.65 * Math.cos(midAngle);
      const labelY = cy + r * 0.65 * Math.sin(midAngle);
      const pct = Math.round((val / total) * 100);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${pct}%`, labelX, labelY);

      startAngle = endAngle;
    });
  }, [metric, kitchen, selectedData, total]);

  return (
    <div className={styles.container}>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="kitchen-filter" className={styles.label}>
            Kitchen
          </label>
          <select
            id="kitchen-filter"
            className={styles.select}
            value={kitchen}
            onChange={e => setKitchen(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Kitchen 1">Kitchen 1</option>
            <option value="Kitchen 2">Kitchen 2</option>
            <option value="Kitchen 3">Kitchen 3</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="from-date-filter" className={styles.label}>
            From
          </label>
          <input
            id="from-date-filter"
            type="date"
            className={styles.dateInput}
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="to-date-filter" className={styles.label}>
            To
          </label>
          <input
            id="to-date-filter"
            type="date"
            className={styles.dateInput}
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="metric-filter" className={styles.label}>
            Metric
          </label>
          <select
            id="metric-filter"
            className={styles.select}
            value={metric}
            onChange={e => setMetric(e.target.value)}
          >
            <option value="currentInventory">Inventory</option>
            <option value="moneySpent">Money Spent</option>
          </select>
        </div>
      </div>

      {/* Title */}
      <h2 className={styles.title}>{getTitle()}</h2>

      {/* Canvas Pie Chart */}
      <div className={styles.chartWrapper}>
        <canvas ref={canvasRef} width={400} height={400} />
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {categories.map((cat, i) => {
          const pct = Math.round((selectedData[i] / total) * 100);
          return (
            <div key={cat} className={styles.legendItem}>
              <span className={styles.dot} style={{ backgroundColor: colors[i] }} />
              <span className={styles.legendText}>
                {cat} ({pct}%) — {getUnit()}
                {selectedData[i].toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FoodCategoriesChart;
