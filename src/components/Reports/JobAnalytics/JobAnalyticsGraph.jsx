import React, { useMemo, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export default function JobAnalyticsGraph({ data }) {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.querySelector('.dark-mode') !== null
  );

  // Watch for dark mode toggle changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const targetNode = document.body;
    const observer = new MutationObserver(() => {
      const darkActive = document.querySelector('.dark-mode') !== null;
      setIsDark(darkActive);
    });

    observer.observe(targetNode, { attributes: true, subtree: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Collapse duplicates and sort by applications desc
  const rows = useMemo(() => {
    if (!data || data.length === 0) return [];
    const byRole = new Map();
    for (const d of data) {
      const r = d.role;
      const prev = byRole.get(r) || { role: r, views: 0, applications: 0 };
      prev.views += Number(d.views || 0);
      prev.applications += Number(d.applications || 0);
      byRole.set(r, prev);
    }
    return Array.from(byRole.values()).sort(
      (a, b) => b.applications - a.applications || a.role.localeCompare(b.role)
    );
  }, [data]);

  if (!rows || rows.length === 0) {
    return <p>No data available for selected filters.</p>;
  }

  const labels = rows.map(r => r.role);
  const applications = rows.map(r => r.applications);

  const isTiny =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(max-width: 430px)').matches;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Applications',
        data: applications,
        backgroundColor: isDark ? '#4ade80' : 'rgba(54, 162, 235, 0.7)',
        borderWidth: 0,
        categoryPercentage: isTiny ? 0.7 : 0.8,
        barPercentage: isTiny ? 0.8 : 0.9,
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: isTiny ? 360 : 520, backgroundColor: isDark ? '#1a1a1a' : '#fff' }}>
      <h1
        style={{
          textAlign: 'center',
          margin: '0 0 .75rem 0',
          fontSize: 28,
          color: isDark ? '#eee' : '#2b2b2b',
        }}
      >
        Most Competitive Roles
      </h1>
      <Bar
        data={chartData}
        plugins={[ChartDataLabels]}
        options={{
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { right: 16, left: 8, bottom: 30 },
          },
          plugins: {
            legend: { display: false },
            datalabels: {
              display: true,
              anchor: 'end',
              align: 'right',
              clip: true,
              formatter: v => v,
              font: { weight: 'bold', size: isTiny ? 10 : 12 },
              color: isDark ? '#eee' : '#000',
            },
            tooltip: {
              backgroundColor: isDark ? '#333' : '#fff',
              titleColor: isDark ? '#eee' : '#111',
              bodyColor: isDark ? '#eee' : '#111',
              callbacks: {
                label: ctx => `Applications: ${ctx.raw}`,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Number of Applications',
                color: isDark ? '#ccc' : '#2b2b2b',
                padding: { top: 12 },
                font: { size: isTiny ? 11 : 13, weight: '500' },
              },
              ticks: {
                precision: 0,
                color: isDark ? '#ccc' : '#2b2b2b',
                font: { size: isTiny ? 10 : 12 },
              },
              grid: { drawBorder: false },
            },
            y: {
              title: {
                display: true,
                text: 'Role',
                color: isDark ? '#ccc' : '#2b2b2b',
                padding: { bottom: 4 },
                font: { size: isTiny ? 11 : 13, weight: '500' },
              },
              ticks: {
                autoSkip: false,
                color: isDark ? '#ccc' : '#2b2b2b',
                font: { size: isTiny ? 10 : 12 },
              },
              grid: { drawBorder: false },
            },
          },
        }}
      />
    </div>
  );
}
