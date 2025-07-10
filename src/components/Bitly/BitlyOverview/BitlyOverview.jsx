import { useState, useEffect } from 'react';
import axios from 'axios';
import './BitlyOverview.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import EditableTitle from '../EditTitle/EditTitle';

// API calls
const deleteBitlink = id => axios.delete(`/api/bitly/bitlink/${encodeURIComponent(id)}`);
const deleteQr = id => axios.delete(`/api/bitly/qrcode/${encodeURIComponent(id)}`);

function confirmToast(message) {
  return new Promise(resolve => {
    const toastId = toast(
      () => (
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 8 }}>{message}</p>
          <button
            type="button"
            className="icon-btn primary"
            aria-label="Confirm action"
            onClick={() => {
              resolve(true);
              toast.dismiss(toastId);
            }}
          >
            Yes
          </button>{' '}
          <button
            type="button"
            className="icon-btn"
            aria-label="Cancel action"
            onClick={() => {
              resolve(false);
              toast.dismiss(toastId);
            }}
          >
            No
          </button>
        </div>
      ),
      {
        position: toast.POSITION.TOP_RIGHT,
        closeButton: false,
        autoClose: false,
        draggable: false,
        className: 'confirm-toast', // <-- wrapper
        bodyClassName: 'confirm-toast-body', // <-- inner div (auto-added by lib)
      },
    );
  });
}

/* ---------- component ---------- */

export default function BitlyOverview() {
  const [overview, setOverview] = useState(null);
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // fetch overview + quota in parallel
    Promise.all([axios.get('/api/bitly/overview'), axios.get('/api/bitly/quota')])
      .then(([ovrRes, qRes]) => {
        setOverview(ovrRes.data);
        setQuota(qRes.data);
      })
      .catch(err => setError(err.response?.data?.error || err.message || 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading Bitly info…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  /* ---------- JSX ---------- */

  return (
    <div className="bitly-overview">
      <h2>Bitly Usage &amp; Quota</h2>

      {/* Quota Section */}
      {quota && (
        <div className="bitly-quota">
          <h3>Your Plan Quotas</h3>
          <ul>
            <li>
              <strong>Shortened URLs:</strong> {quota.shortLinks.used} / {quota.shortLinks.total}{' '}
              used&nbsp;(<em>{quota.shortLinks.remaining} remaining</em>)
            </li>
            <li>
              <strong>QR Codes:</strong> {quota.qrCodes.used} / {quota.qrCodes.total} used&nbsp;(
              <em>{quota.qrCodes.remaining} remaining</em>)
            </li>
          </ul>
        </div>
      )}

      {/* Overview Section */}
      {overview && (
        <>
          <br />
          <h3>Usage Overview</h3>
          <h4>Shortened Links</h4>
          <table>
            <thead>
              <tr>
                <th>Bitlink</th>
                <th>Title</th>
                <th>Original URL</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {overview.bitlinks.map(b => (
                <tr key={b.id}>
                  <td>
                    <a href={b.link} target="_blank" rel="noopener noreferrer">
                      {b.id}
                    </a>
                  </td>
                  <td>
                    <EditableTitle
                      bitlinkId={b.id}
                      initial={b.title}
                      onSave={newTitle =>
                        setOverview(o => ({
                          ...o,
                          bitlinks: o.bitlinks.map(x =>
                            x.id === b.id ? { ...x, title: newTitle } : x,
                          ),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <a href={b.long_url} target="_blank" rel="noopener noreferrer">
                      {b.long_url}
                    </a>
                  </td>
                  <td>{new Date(b.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      className="icon-btn delete-icon"
                      aria-label="Delete Bitlink"
                      onClick={async () => {
                        const ok = await confirmToast('Delete this Bitlink?');
                        if (!ok) return;

                        deleteBitlink(b.id)
                          .then(() =>
                            setOverview(o => ({
                              ...o,
                              bitlinks: o.bitlinks.filter(x => x.id !== b.id),
                              totalShortened: o.totalShortened - 1,
                            })),
                          )
                          .catch(() => toast.error('Failed to delete Bitlink'));
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* QR Codes Table */}
          <h4>QR Codes</h4>
          <table>
            <thead>
              <tr>
                <th>QR Image</th>
                <th>QR ID</th>
                <th>Bitlink</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {overview.qrCodes.map(q => (
                <tr key={q.qrCodeId}>
                  <td className="qr-cell">
                    <img src={q.imageData} alt="QR" width="80" height="80" />
                    <a
                      href={q.imageData}
                      download={`${q.qrCodeId}.png`}
                      className="download-link"
                      aria-label="Download QR code"
                      title="Download PNG"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </a>
                  </td>
                  <td>{q.qrCodeId}</td>
                  <td>
                    <a href={`https://${q.bitlinkId}`} target="_blank" rel="noopener noreferrer">
                      {q.bitlinkId}
                    </a>
                  </td>
                  <td>{new Date(q.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      className="icon-btn delete-icon"
                      aria-label="Delete QR code"
                      onClick={async () => {
                        const ok = await confirmToast('Delete this QR code?');
                        if (!ok) return;

                        deleteQr(q.qrCodeId)
                          .then(() =>
                            setOverview(o => ({
                              ...o,
                              qrCodes: o.qrCodes.filter(x => x.qrCodeId !== q.qrCodeId),
                              totalQrCodes: o.totalQrCodes - 1,
                            })),
                          )
                          .catch(() => toast.error('Failed to delete QR code'));
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
