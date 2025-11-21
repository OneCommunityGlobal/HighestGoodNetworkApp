import { useParams } from 'react-router-dom';

export default function UnitPage() {
  const { unitId } = useParams();

  return (
    <div style={{ padding: 16 }}>
      <h1>Unit Details</h1>
      <div>Unit ID: {unitId}</div>
      <p>Detailed unit view will be implemented here.</p>
    </div>
  );
}
