import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';
import KIScanBarcodeModal from '../KIScanBarcodeModal';

const { decodeFromVideoElement, createReader } = vi.hoisted(() => ({
  decodeFromVideoElement: vi.fn(),
  createReader: vi.fn(),
}));

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatOneDReader: function MockReader(hints) {
    createReader(hints);
    this.decodeFromVideoElement = decodeFromVideoElement;
  },
}));

const mediaDevices = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
const getUserMedia = vi.fn();
const stopTrack = vi.fn();
const stream = { getTracks: () => [{ stop: stopTrack }] };
const controls = { stop: vi.fn() };

const defaultProps = {
  items: [],
  categoryLabels: {},
  inventoryLoading: false,
  onRetry: vi.fn(),
  onClose: vi.fn(),
  onAddItem: vi.fn(),
  onUpdateItem: vi.fn(),
  onReorderItem: vi.fn(),
  darkMode: false,
};

const startCamera = () => fireEvent.click(screen.getByRole('button', { name: 'Start Camera' }));
const findBarcode = value => {
  fireEvent.change(screen.getByLabelText('Barcode'), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Find Item' }));
};

describe('KIScanBarcodeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });
    getUserMedia.mockResolvedValue(stream);
    decodeFromVideoElement.mockResolvedValue(controls);
  });

  afterEach(() => {
    if (mediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', mediaDevices);
    } else {
      Reflect.deleteProperty(navigator, 'mediaDevices');
    }
  });

  test('validates manual input before looking up inventory', () => {
    render(<KIScanBarcodeModal {...defaultProps} />);

    findBarcode('012345000059');
    expect(screen.getByLabelText('Barcode')).toBeInvalid();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a valid 12-digit UPC or 13-digit EAN',
    );
    expect(screen.queryByRole('button', { name: 'Add Item' })).not.toBeInTheDocument();
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  test('waits for inventory to finish loading before offering to add', () => {
    const { rerender } = render(<KIScanBarcodeModal {...defaultProps} inventoryLoading />);

    findBarcode('9521101530001');
    expect(screen.getByRole('status')).toHaveTextContent('Loading inventory');
    expect(screen.queryByRole('button', { name: 'Add Item' })).not.toBeInTheDocument();

    rerender(<KIScanBarcodeModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
    expect(screen.getByLabelText('Barcode')).toHaveValue('9521101530001');
  });

  test.each([
    ['NotAllowedError', 'Camera access was denied'],
    ['NotFoundError', 'No camera was found'],
  ])('keeps manual entry usable after %s', async (errorName, message) => {
    getUserMedia.mockRejectedValueOnce(new DOMException('Camera error', errorName));
    render(<KIScanBarcodeModal {...defaultProps} />);

    startCamera();
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    findBarcode('012345000058');
    expect(screen.getByLabelText('Barcode')).toHaveValue('0012345000058');
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  test('accepts the first valid camera result and releases the stream', async () => {
    render(<KIScanBarcodeModal {...defaultProps} />);

    startCamera();
    await waitFor(() => expect(decodeFromVideoElement).toHaveBeenCalledTimes(1));
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: { facingMode: { ideal: 'environment' } },
    });
    expect(createReader).toHaveBeenCalledWith(
      new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.UPC_A, BarcodeFormat.EAN_13]]]),
    );
    const [, receiveResult] = decodeFromVideoElement.mock.calls[0];

    act(() => receiveResult(undefined, new NotFoundException(), controls));
    expect(screen.getByRole('button', { name: 'Stop Camera' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    act(() => {
      receiveResult({ getText: () => '012345000058' }, undefined, controls);
      receiveResult({ getText: () => '9521101530001' }, undefined, controls);
    });
    expect(screen.getByLabelText('Barcode')).toHaveValue('0012345000058');
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
    expect(controls.stop).toHaveBeenCalledTimes(1);
    expect(stopTrack).toHaveBeenCalledTimes(1);
  });

  test('stops the reader and the camera when the modal unmounts', async () => {
    const { unmount } = render(<KIScanBarcodeModal {...defaultProps} />);

    startCamera();
    await waitFor(() => expect(decodeFromVideoElement).toHaveBeenCalledTimes(1));
    unmount();

    expect(controls.stop).toHaveBeenCalledTimes(1);
    expect(stopTrack).toHaveBeenCalledTimes(1);
  });

  test('releases a stream granted after the modal has closed', async () => {
    let grantAccess;
    getUserMedia.mockReturnValueOnce(
      new Promise(resolve => {
        grantAccess = resolve;
      }),
    );
    const { unmount } = render(<KIScanBarcodeModal {...defaultProps} />);

    startCamera();
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
    unmount();
    await act(async () => grantAccess(stream));

    expect(stopTrack).toHaveBeenCalledTimes(1);
    expect(decodeFromVideoElement).not.toHaveBeenCalled();
  });
});
