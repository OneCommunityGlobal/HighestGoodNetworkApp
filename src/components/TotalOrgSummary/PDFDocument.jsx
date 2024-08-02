import { useSelector } from 'react-redux';

function PDFDocument() {
  const { data, loading, error } = useSelector(state => state.pdfSummary);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* Render your PDF content here */}
      <h1>PDF Summary</h1>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export default PDFDocument;
