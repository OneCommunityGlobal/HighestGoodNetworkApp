import React from 'react';
import styles from './issueGraph.module.css';

function IssueGraph() {
  const tiles = [
    { title: 'Total Issues', value: 120 },
    { title: 'Open', value: 45 },
    { title: 'In Progress', value: 30 },
    { title: 'Resolved', value: 45 },
  ];

  return (
    <div className={styles.issueChartEventContainer}>
      {/* Tiles Row */}
      <div className={styles.tileRow}>
        {tiles.map((tile, index) => (
          <div key={index} className={styles.tile}>
            <h3>{tile.title}</h3>
            <p>{tile.value}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className={styles.chartWrapper}>
        <h2>Issue Graph</h2>
        <div
          style={{
            height: '400px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#888',
          }}
        >
          Graph section
        </div>
      </div>
    </div>
  );
}

export default IssueGraph;
