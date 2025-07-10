// src/components/BitlyGenerator/BitlyGenerator.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLink,
  faQrcode,
  faSpinner,
  faPlus,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import './BitlyGenerator.css';

axios.defaults.baseURL = 'http://localhost:4500';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default function BitlyGenerator({ onDisconnect = () => {} }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [longUrl, setLongUrl] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [qrSrc, setQrSrc] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  const [bitlinkForQr, setBitlinkForQr] = useState('');

  // 1) Check if we already have a Bitly token
  async function checkConnection() {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/bitly/status');
      setIsConnected(res.data.connected);
    } catch {
      toast.error('Failed to check Bitly connection');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkConnection();
  }, []);

  // 2) Start OAuth flow
  async function handleConnect() {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/bitly/auth-url');
      window.location.href = res.data.url;
    } catch {
      toast.error('Failed to get auth URL');
    } finally {
      setIsLoading(false);
    }
  }

  // 3) Shorten the URL
  async function handleShorten() {
    if (!longUrl.trim()) {
      toast.error('Please enter a URL to shorten');
      return;
    }

    try {
      const { data: quota } = await axios.get('/api/bitly/quota');
      if (quota.shortLinks.remaining === 0) {
        toast.error('Your Bitly “Shortened URLs” quota is exhausted.');
        return;
      }
    } catch {
      /* fall through – we’ll still attempt the API; network failure handled below */
    }

    try {
      setIsWorking(true);
      const res = await axios.post('/api/bitly/shorten', { longUrl });
      setShortLink(res.data.link || res.data.id);
      setQrSrc(null);
      toast.success('Link shortened!');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.message.includes('encodes') ? 'Short-link quota exhausted' : err.message);
      toast.error(`${msg}`);
    } finally {
      setIsWorking(false);
    }
  }

  // 4) Generate QR code for the Bitlink
  async function handleGenerateQr() {
    const bitlink = (bitlinkForQr || shortLink).trim();
    if (!bitlink) {
      toast.error('Enter a Bitlink or shorten one first');
      return;
    }
    try {
      const { data: quota } = await axios.get('/api/bitly/quota');
      if (quota.qrCodes.remaining === 0) {
        toast.error('Your Bitly QR-code quota is exhausted.');
        return;
      }
    } catch {
      /* ignore – we’ll rely on server error below */
    }
    try {
      setIsWorking(true);
      const res = await axios.post('/api/bitly/qr', {
        bitlinkId: bitlink.replace(/^https?:\/\//, ''),
      });
      const blobUrl = res.data.imageData;
      setQrSrc(blobUrl);
      toast.success('QR code generated!');
      setBitlinkForQr('');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.message.includes('QR-code quota') ? 'QR-code quota exhausted' : err.message);
      toast.error(`${msg}`);
    } finally {
      setIsWorking(false);
    }
  }

  // 5) Disconnect (clears in-memory tokens on the server)
  async function handleDisconnect() {
    try {
      await axios.get('/api/bitly/logout');
      setIsConnected(false);
      onDisconnect();
      setLongUrl('');
      setShortLink('');
      setQrSrc(null);
      toast.info('Disconnected from Bitly');
    } catch {
      toast.error('Failed to disconnect');
    }
  }

  return (
    <div className="bitly-container">
      <h2>
        <FontAwesomeIcon icon={faLink} /> Bitly Link &amp; QR Generator
      </h2>

      {isLoading && <FontAwesomeIcon icon={faSpinner} spin />}

      {!isLoading && !isConnected && (
        <button type="button" className="connect-btn" onClick={handleConnect} disabled={isLoading}>
          <FontAwesomeIcon icon={faPlus} /> Connect to Bitly
        </button>
      )}

      {!isLoading && isConnected && (
        <div className="connected">
          <FontAwesomeIcon icon={faCheck} /> Connected
          <button
            type="button"
            className="disconnect-btn"
            onClick={handleDisconnect}
            aria-label="Disconnect from Bitly"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {isConnected && (
        <div className="actions">
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter a long URL"
              value={longUrl}
              onChange={e => setLongUrl(e.target.value)}
            />
            <button type="button" onClick={handleShorten} disabled={isWorking}>
              {isWorking ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Shorten'}
            </button>
          </div>

          {shortLink && (
            <div className="short-link">
              <a href={shortLink} target="_blank" rel="noopener noreferrer">
                {shortLink}
              </a>
            </div>
          )}

          <div className="input-group">
            <input
              type="text"
              placeholder="Bitlink for QR"
              value={bitlinkForQr}
              onChange={e => setBitlinkForQr(e.target.value)}
            />

            <button
              type="button"
              className="qr-btn"
              onClick={handleGenerateQr}
              disabled={isWorking}
              aria-label="Generate QR code"
            >
              {isWorking ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faQrcode} />
              )}{' '}
              Generate QR
            </button>
          </div>

          {qrSrc && (
            <div className="qr-code">
              <img src={qrSrc} alt="QR" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
