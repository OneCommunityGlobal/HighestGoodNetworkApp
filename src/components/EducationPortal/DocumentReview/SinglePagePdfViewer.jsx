import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import styles from './DocumentReviewPage.module.css';

const pdfjsVersion = '3.11.174';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;

const SinglePagePdfViewer = ({ fileUrl, currentPage, onPageChange, onDocumentLoad }) => {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        if (isMounted) {
          setPdfDoc(pdf);
          if (onDocumentLoad) {
            onDocumentLoad(pdf.numPages);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load PDF');
          setLoading(false);
          // eslint-disable-next-line no-console
          console.error('Error loading PDF:', err);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [fileUrl, onDocumentLoad]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const pageNum = currentPage + 1;
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const container = canvas.parentElement;
        const containerWidth = container.clientWidth - 64;

        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(containerWidth / viewport.width, 1.5);
        const scaledViewport = page.getViewport({ scale });

        const dpr = window.devicePixelRatio || 1;
        canvas.width = scaledViewport.width * dpr;
        canvas.height = scaledViewport.height * dpr;
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;

        context.scale(dpr, dpr);

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;

        if (onPageChange) {
          onPageChange(currentPage);
        }
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          // eslint-disable-next-line no-console
          console.error('Error rendering page:', err);
        }
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, onPageChange]);

  if (loading) {
    return (
      <div className={styles.pdfLoadingOverlay}>
        <div className={styles.spinner}></div>
        <p>Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.noDocument}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.singlePageContainer}>
      <canvas ref={canvasRef} className={styles.pdfCanvas} />
    </div>
  );
};

export default SinglePagePdfViewer;
