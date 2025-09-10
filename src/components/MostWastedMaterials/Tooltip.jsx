// Custom Tooltip Component
export default function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '12px',
        }}
      >
        <p style={{ fontWeight: '500', color: '#111827', margin: '0 0 4px 0' }}>{label}</p>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Waste: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
}
