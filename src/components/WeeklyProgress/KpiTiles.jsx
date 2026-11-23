import React from 'react';
import styles from './WeeklyProgress.module.css';

const TILE_CONFIG = [
  {
    key: 'totalTasks',
    label: 'Total Tasks',
    tooltip: 'Count of all tasks created up to the end date (excluding deleted).',
  },
  {
    key: 'completedThisWeek',
    label: 'Tasks Completed This Week',
    tooltip: 'Tasks completed in the latest week of the selected window.',
  },
  {
    key: 'openTasks',
    label: 'Open Tasks',
    tooltip: 'Tasks that are not in a terminal status as of the end date.',
  },
  {
    key: 'averageCompletionTimeDays',
    label: 'Average Completion Time (days)',
    tooltip: 'Average time from task creation to completion within the selected window.',
    isFloat: true,
  },
];

const formatValue = (value, isFloat) => {
  if (value == null) return '–';
  if (isFloat) return value.toFixed(1);
  return value.toLocaleString();
};

const KpiTiles = ({ summary, loading }) => {
  return (
    <div className={styles.kpiGrid}>
      {TILE_CONFIG.map(tile => {
        const value = summary ? summary[tile.key] : null;

        return (
          <div key={tile.key} className={styles.kpiTile} title={tile.tooltip}>
            <div className={styles.kpiLabel}>{tile.label}</div>
            <div className={styles.kpiValue}>
              {loading && summary == null ? '…' : formatValue(value, tile.isFloat)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiTiles;
