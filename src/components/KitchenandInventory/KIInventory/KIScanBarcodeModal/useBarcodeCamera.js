import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeBarcode } from '../KIInventoryBarcode';

const stopTracks = stream => stream?.getTracks().forEach(track => track.stop());

function getCameraError(error) {
  if (error?.name === 'NotAllowedError') {
    return 'Camera access was denied. You can still enter a barcode.';
  }
  if (error?.name === 'NotFoundError') {
    return 'No camera was found. You can still enter a barcode.';
  }
  return 'Could not start the camera. Try again or enter a barcode.';
}

export default function useBarcodeCamera() {
  const sessionRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [cameraError, setCameraError] = useState('');

  const releaseCamera = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    if (!session) return;

    session.controls?.stop();
    stopTracks(session.stream);
    if (session.video.srcObject === session.stream) {
      session.video.srcObject = null;
    }
  }, []);

  useEffect(() => releaseCamera, [releaseCamera]);

  const stopCamera = () => {
    releaseCamera();
    setCameraStatus('idle');
  };

  const startCamera = async (video, onBarcode) => {
    if (sessionRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is unavailable. You can still enter a barcode.');
      return;
    }

    const session = { video, stream: null, controls: null };
    sessionRef.current = session;
    setCameraError('');
    setCameraStatus('starting');

    try {
      const [
        { BrowserMultiFormatOneDReader },
        { BarcodeFormat, DecodeHintType, ChecksumException, FormatException, NotFoundException },
      ] = await Promise.all([import('@zxing/browser'), import('@zxing/library')]);
      if (sessionRef.current !== session) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      // Permission can arrive after the user stops scanning or closes the modal.
      if (sessionRef.current !== session) {
        stopTracks(stream);
        return;
      }

      session.stream = stream;
      video.srcObject = stream;
      const hints = new Map([
        [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.UPC_A, BarcodeFormat.EAN_13]],
      ]);
      const reader = new BrowserMultiFormatOneDReader(hints);
      const controls = await reader.decodeFromVideoElement(video, (result, error, scanControls) => {
        if (sessionRef.current !== session) return;

        if (
          error &&
          !(
            error instanceof NotFoundException ||
            error instanceof ChecksumException ||
            error instanceof FormatException
          )
        ) {
          session.controls = scanControls;
          stopCamera();
          setCameraError(getCameraError(error));
          return;
        }

        const barcode = normalizeBarcode(result?.getText());
        if (barcode) {
          session.controls = scanControls;
          stopCamera();
          onBarcode(barcode);
        }
      });

      if (sessionRef.current !== session) {
        if (controls !== session.controls) controls.stop();
        return;
      }

      session.controls = controls;
      setCameraStatus('scanning');
    } catch (error) {
      if (sessionRef.current !== session) return;
      stopCamera();
      setCameraError(getCameraError(error));
    }
  };

  return { cameraStatus, cameraError, startCamera, stopCamera };
}
