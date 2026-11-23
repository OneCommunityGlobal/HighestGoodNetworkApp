import { useRef, useState } from 'react';
import { Button } from 'reactstrap';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FiCamera, FiSquare, FiX } from 'react-icons/fi';
import { BARCODE_FORMAT_ERROR, normalizeBarcode } from '../KIInventoryBarcode';
import { inventoryItemShape } from '../KIInventoryPropTypes';
import useBarcodeCamera from './useBarcodeCamera';
import styles from './KIScanBarcodeModal.module.css';

function BarcodeMatch({ item, categoryLabel, onUpdateItem, onReorderItem, darkMode }) {
  const expiry = item.expiryDate
    ? new Date(item.expiryDate).toLocaleDateString(undefined, { timeZone: 'UTC' })
    : '';

  return (
    <li className={styles.match}>
      <h3>{item.name}</h3>
      <dl className={styles.details}>
        <dt>Category</dt>
        <dd className={styles.category}>{categoryLabel}</dd>
        <dt>Location</dt>
        <dd>{item.location || 'Unspecified'}</dd>
        <dt>Stock</dt>
        <dd>
          {item.presentQuantity == null
            ? 'Unknown'
            : `${item.presentQuantity} ${item.unit || ''}`.trim()}
        </dd>
        {expiry && (
          <>
            <dt>Expiry</dt>
            <dd>{expiry}</dd>
          </>
        )}
      </dl>
      <div className={styles.actions}>
        <Button color={darkMode ? 'light' : 'secondary'} outline onClick={() => onUpdateItem(item)}>
          Update Item
        </Button>
        <Button color="primary" onClick={() => onReorderItem(item)}>
          Reorder
        </Button>
      </div>
    </li>
  );
}

BarcodeMatch.propTypes = {
  item: inventoryItemShape.isRequired,
  categoryLabel: PropTypes.string.isRequired,
  onUpdateItem: PropTypes.func.isRequired,
  onReorderItem: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

function KIScanBarcodeModal({
  items,
  categoryLabels,
  inventoryLoading,
  inventoryError = null,
  onRetry,
  onClose,
  onAddItem,
  onUpdateItem,
  onReorderItem,
  darkMode,
}) {
  const [input, setInput] = useState('');
  const [lookupBarcode, setLookupBarcode] = useState(null);
  const [inputError, setInputError] = useState('');
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const { cameraStatus, cameraError, startCamera, stopCamera } = useBarcodeCamera();
  const cameraActive = cameraStatus !== 'idle';
  const showResults = Boolean(lookupBarcode) && !inventoryLoading && !inventoryError;
  const matches = showResults
    ? items.filter(item => normalizeBarcode(item.barcode) === lookupBarcode)
    : [];

  const showBarcode = barcode => {
    setInput(barcode);
    setInputError('');
    setLookupBarcode(barcode);
  };

  const handleSubmit = event => {
    event.preventDefault();
    const barcode = normalizeBarcode(input);
    if (!barcode) {
      setInputError(BARCODE_FORMAT_ERROR);
      setLookupBarcode(null);
      return;
    }

    stopCamera();
    showBarcode(barcode);
  };

  const handleInputChange = event => {
    setInput(event.target.value);
    setInputError('');
    setLookupBarcode(null);
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      aria-labelledby="ki-scan-barcode-title"
      slotProps={{
        paper: { className: classnames(styles.content, darkMode && styles.dark) },
        transition: { onEntered: () => inputRef.current?.focus() },
      }}
    >
      <header className={styles.heading}>
        <DialogTitle id="ki-scan-barcode-title">Scan Barcode</DialogTitle>
        <IconButton aria-label="Close scan barcode" onClick={onClose} color="inherit" size="small">
          <FiX aria-hidden="true" />
        </IconButton>
      </header>
      <DialogContent className={styles.body}>
        <div className={styles.camera}>
          <Button
            type="button"
            color={darkMode ? 'light' : 'secondary'}
            outline
            className={styles.cameraButton}
            onClick={cameraActive ? stopCamera : () => startCamera(videoRef.current, showBarcode)}
          >
            {cameraActive ? <FiSquare aria-hidden="true" /> : <FiCamera aria-hidden="true" />}
            {cameraActive ? 'Stop Camera' : 'Start Camera'}
          </Button>
          {cameraStatus === 'starting' && <p role="status">Starting camera...</p>}
          <video
            ref={videoRef}
            muted
            playsInline
            hidden={!cameraActive}
            className={styles.video}
            aria-label="Barcode camera preview"
          />
          {cameraError && (
            <p className={styles.error} role="alert">
              {cameraError}
            </p>
          )}
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="ki-scan-barcode">Barcode</label>
          <div className={styles.entry}>
            <input
              id="ki-scan-barcode"
              ref={inputRef}
              className={classnames('form-control', styles.input)}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={input}
              onChange={handleInputChange}
              aria-invalid={Boolean(inputError)}
              aria-describedby={inputError ? 'ki-scan-barcode-error' : undefined}
            />
            <Button type="submit" color="primary">
              Find Item
            </Button>
          </div>
          {inputError && (
            <p id="ki-scan-barcode-error" className={styles.error} role="alert">
              {inputError}
            </p>
          )}
        </form>
        {lookupBarcode && inventoryLoading && <p role="status">Loading inventory...</p>}
        {lookupBarcode && !inventoryLoading && inventoryError && (
          <div className={styles.feedback}>
            <p className={styles.error} role="alert">
              {inventoryError}
            </p>
            <Button color={darkMode ? 'light' : 'secondary'} outline onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}
        {showResults && matches.length === 0 && (
          <div className={styles.feedback}>
            <p role="status">No inventory items match this barcode.</p>
            <Button color="primary" onClick={() => onAddItem(lookupBarcode)}>
              Add Item
            </Button>
          </div>
        )}
        {matches.length > 0 && (
          <>
            <p role="status">{matches.length === 1 ? '1 match' : `${matches.length} matches`}</p>
            <ul className={styles.matches} aria-label="Matching inventory items">
              {matches.map(item => (
                <BarcodeMatch
                  key={item._id || item.id}
                  item={item}
                  categoryLabel={categoryLabels[item.category] || item.category || 'Unspecified'}
                  onUpdateItem={onUpdateItem}
                  onReorderItem={onReorderItem}
                  darkMode={darkMode}
                />
              ))}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

KIScanBarcodeModal.propTypes = {
  items: PropTypes.arrayOf(inventoryItemShape).isRequired,
  categoryLabels: PropTypes.objectOf(PropTypes.string).isRequired,
  inventoryLoading: PropTypes.bool.isRequired,
  inventoryError: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onUpdateItem: PropTypes.func.isRequired,
  onReorderItem: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default KIScanBarcodeModal;
