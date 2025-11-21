import { useParams } from 'react-router-dom';

export default function SubjectPage() {
  const { subjectId } = useParams();

  return (
    <div style={{ padding: 16 }}>
      <h1>Subject Details</h1>
      <div>Subject ID: {subjectId}</div>
      <p>Detailed subject view will be implemented here.</p>
    </div>
  );
}
