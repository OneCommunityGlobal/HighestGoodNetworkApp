/* eslint-disable import/extensions */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
// eslint-disable-next-line import/no-unresolved
import { fetchPdfSummary } from '../actions/pdfSummaryActions';
import PDFDocument from './PDFDocument';
import ShareAsPDFButton from './ShareAsPDFButton';

function SomeComponent() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPdfSummary());
  }, [dispatch]);

  const handleShareAsPDF = () => {
    // Logic to handle sharing as PDF
  };

  return (
    <div>
      <PDFDocument />
      <ShareAsPDFButton onClick={handleShareAsPDF} />
    </div>
  );
}

export default SomeComponent;
