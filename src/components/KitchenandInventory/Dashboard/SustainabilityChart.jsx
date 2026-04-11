import { useRef, useEffect } from 'react';
import styles from './SustainabilityChart.module.css';

const stockData = [
  { name: 'Vegetables', level: 85, status: 'good' },
  { name: 'Grains & Legumes', level: 45, status: 'warning' },
  { name: 'Dairy Products', level: 92, status: 'good' },
  { name: 'Oils & Condiments', level: 18, status: 'critical' },
  { name: 'Preserved Foods', level: 68, status: 'good' },
];

const onsiteGrown = 89;
const purchased = 158;
const total = onsiteGrown + purchased;
const onsitePct = Math.round((onsiteGrown / total) * 100);
const purchasedPct = 100 - onsitePct;

function SustainabilityChart() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const onsiteAngle = (onsitePct / 100) * 2 * Math.PI;
    const startAngle = -Math.PI / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle + onsiteAngle, startAngle + 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = '#8b9dc3';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + onsiteAngle);
    ctx.closePath();
    ctx.fillStyle = '#6b8e23';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    const onsiteMid = startAngle + onsiteAngle / 2;
    const oLx = cx + r * 0.55 * Math.cos(onsiteMid);
    const oLy = cy + r * 0.55 * Math.sin(onsiteMid);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Onsite Grown: ${onsitePct}%`, oLx, oLy);

    const purchMid = startAngle + onsiteAngle + (2 * Math.PI - onsiteAngle) / 2;
    const pLx = cx + r * 0.55 * Math.cos(purchMid);
    const pLy = cy + r * 0.55 * Math.sin(purchMid);
    ctx.fillStyle = '#fff';
    ctx.fillText(`Purchased: ${purchasedPct}%`, pLx, pLy);
  }, []);

  const getStatusIcon = status => {
    if (status === 'good') return '✅';
    if (status === 'warning') return '⚠️';
    return '🔴';
  };

  const getBarColor = status => {
    if (status === 'good') return '#6b8e23';
    if (status === 'warning') return '#d4a017';
    return '#c0392b';
  };

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🌿</span>
            <div>
              <h3 className={styles.cardTitle}>Sustainability Score</h3>
              <p className={styles.cardSubtitle}>
                Percentage of ingredients grown onsite vs. purchased
              </p>
            </div>
          </div>
          <div className={styles.scoreRow}>
            <span className={styles.scorePct}>{onsitePct}%</span>
            <span className={styles.excellentBadge}>Excellent</span>
          </div>
          <div className={styles.chartWrapper}>
            <canvas ref={canvasRef} width={280} height={280} />
          </div>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#6b8e23' }} />
              <span>Onsite Grown</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#8b9dc3' }} />
              <span>Purchased</span>
            </div>
          </div>
          <div className={styles.countRow}>
            <div>
              <p className={styles.countLabel}>Onsite Grown</p>
              <p className={styles.countValue}>{onsiteGrown} items</p>
            </div>
            <div>
              <p className={styles.countLabel}>Purchased</p>
              <p className={styles.countValue}>{purchased} items</p>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>📊</span>
            <div>
              <h3 className={styles.cardTitle}>Stock Health Overview</h3>
              <p className={styles.cardSubtitle}>Current inventory levels by category</p>
            </div>
          </div>
          <div className={styles.stockList}>
            {stockData.map(item => (
              <div key={item.name} className={styles.stockItem}>
                <div className={styles.stockTop}>
                  <span className={styles.stockName}>{item.name}</span>
                  <span className={styles.stockLevel}>
                    {item.level}% {getStatusIcon(item.status)}
                  </span>
                </div>
                <div className={styles.barBg}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${item.level}%`, backgroundColor: getBarColor(item.status) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SustainabilityChart;
