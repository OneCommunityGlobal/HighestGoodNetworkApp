import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listPineconeDocuments,
  uploadPineconeDocument,
  reindexPineconeDocumentByHash,
} from '../../services/pineconeDocumentService';
import styles from './DocumentUploadPage.module.css';

async function calculateSHA256(file) {
  if (!window.crypto?.subtle) {
    throw new Error('File hash is not supported in this browser.');
  }

  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value < 0) return '-';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

const DocumentUploadPage = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [namespace, setNamespace] = useState('');
  const [reindexHash, setReindexHash] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const hasDocuments = useMemo(() => documents.length > 0, [documents]);

  const loadDocuments = useCallback(async () => {
    setIsLoadingDocuments(true);
    setError('');

    try {
      const response = await listPineconeDocuments(namespace.trim());
      setDocuments(Array.isArray(response?.documents) ? response.documents : []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Unable to load indexed documents. Please try again.',
      );
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [namespace]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const onUpload = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedFile) {
      setError('Select a document before uploading.');
      return;
    }

    try {
      setIsUploading(true);
      const fileHash = await calculateSHA256(selectedFile);
      const response = await uploadPineconeDocument({
        file: selectedFile,
        fileHash,
        namespace: namespace.trim(),
      });

      setSuccessMessage(
        response?.message || `Uploaded successfully. File hash: ${fileHash.slice(0, 12)}...`,
      );
      setReindexHash(fileHash);
      setSelectedFile(null);
      await loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Upload failed. Please verify the file and retry.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onManualReindex = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const hash = reindexHash.trim().toLowerCase();
    if (!hash) {
      setError('Provide a file hash to reindex.');
      return;
    }

    try {
      setIsReindexing(true);
      const response = await reindexPineconeDocumentByHash({ hash, namespace: namespace.trim() });
      setSuccessMessage(response?.message || 'Reindex queued successfully.');
      await loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Reindex failed. Please verify the hash and retry.',
      );
    } finally {
      setIsReindexing(false);
    }
  };

  const onRowReindex = async hash => {
    setError('');
    setSuccessMessage('');

    try {
      setIsReindexing(true);
      const response = await reindexPineconeDocumentByHash({
        hash,
        namespace: namespace.trim(),
      });
      setSuccessMessage(response?.message || `Reindex queued for ${hash.slice(0, 12)}...`);
      setReindexHash(hash);
      await loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || 'Could not reindex this document right now.',
      );
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Pinecone Document Console</h1>
        <p className={styles.subtitle}>
          Upload source files, keep a deterministic file hash, and trigger reindexing into Pinecone
          whenever content changes.
        </p>
      </div>

      <div className={styles.controlRow}>
        <label htmlFor="namespace" className={styles.label}>
          Namespace
        </label>
        <input
          id="namespace"
          className="form-control"
          value={namespace}
          onChange={e => setNamespace(e.target.value)}
          placeholder="Default namespace if empty"
        />
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={loadDocuments}
          disabled={isLoadingDocuments}
        >
          {isLoadingDocuments ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Upload New Document</h2>
          <form onSubmit={onUpload}>
            <div className="form-group">
              <label htmlFor="document-file">Document File</label>
              <input
                id="document-file"
                type="file"
                className="form-control"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.txt,.md,.doc,.docx,.csv"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload & Index'}
            </button>
          </form>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Reindex by File Hash</h2>
          <form onSubmit={onManualReindex}>
            <div className="form-group">
              <label htmlFor="file-hash">SHA-256 Hash</label>
              <input
                id="file-hash"
                type="text"
                className="form-control"
                value={reindexHash}
                onChange={e => setReindexHash(e.target.value)}
                placeholder="Paste file hash"
              />
            </div>
            <button type="submit" className="btn btn-warning" disabled={isReindexing}>
              {isReindexing ? 'Reindexing...' : 'Reindex'}
            </button>
          </form>
        </section>
      </div>

      <section className={styles.tableCard}>
        <div className={styles.tableHead}>
          <h2 className={styles.cardTitle}>Indexed Documents</h2>
          <span className={styles.countBadge}>{documents.length} records</span>
        </div>

        {!hasDocuments && !isLoadingDocuments && (
          <p className={styles.emptyState}>No indexed documents found for this namespace.</p>
        )}

        {hasDocuments && (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>File Hash</th>
                  <th>Size</th>
                  <th>Updated</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => {
                  const hash = doc.fileHash || doc.hash || '';
                  return (
                    <tr key={hash || doc.filename}>
                      <td>{doc.filename || '-'}</td>
                      <td className={styles.hashCell}>{hash || '-'}</td>
                      <td>{formatBytes(doc.size)}</td>
                      <td>{formatDate(doc.updatedAt || doc.createdAt)}</td>
                      <td>{doc.status || 'indexed'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => onRowReindex(hash)}
                          disabled={isReindexing || !hash}
                        >
                          Reindex
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DocumentUploadPage;
