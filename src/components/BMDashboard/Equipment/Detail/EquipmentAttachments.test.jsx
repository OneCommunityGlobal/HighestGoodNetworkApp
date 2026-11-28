import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import EquipmentAttachments from './EquipmentAttachments';

const attachment = {
  _id: 'file-id',
  name: 'invoice.pdf',
  category: 'Invoice',
  mimeType: 'application/pdf',
  size: 100,
  uploadedAt: '2026-11-27T12:00:00.000Z',
};

describe('EquipmentAttachments', () => {
  beforeEach(() => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: { files: [attachment], auditHistory: [{ field: 'Attachment uploaded' }] },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows file access and loads audit history for view-only users', async () => {
    const onAuditLoaded = vi.fn();
    render(<EquipmentAttachments equipmentId="equipment-id" onAuditLoaded={onAuditLoaded} />);
    expect(await screen.findByRole('button', { name: 'Preview invoice.pdf' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download invoice.pdf' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add attachment' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove invoice.pdf' })).not.toBeInTheDocument();
    expect(onAuditLoaded).toHaveBeenCalledWith({
      equipmentId: 'equipment-id',
      entries: [{ field: 'Attachment uploaded' }],
    });
  });

  it('submits a category change with the original category', async () => {
    const patch = vi.spyOn(axios, 'patch').mockResolvedValue({});
    render(<EquipmentAttachments equipmentId="equipment-id" canManage onAuditLoaded={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit category for invoice.pdf' }));
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Inspection report' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith(
        expect.stringContaining('/equipment-id/attachments/file-id'),
        { category: 'Inspection report', originalCategory: 'Invoice' },
      ),
    );
  });

  it('offers a download from the PDF preview even if the viewer stays blank', async () => {
    const createObjectURL = vi.fn(() => 'blob:invoice-preview');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    axios.get.mockResolvedValueOnce({
      data: { files: [attachment], auditHistory: [] },
    });
    axios.get.mockResolvedValueOnce({ data: blob });
    render(<EquipmentAttachments equipmentId="equipment-id" onAuditLoaded={vi.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Preview invoice.pdf' }));
    expect(await screen.findByTitle('invoice.pdf')).toBeInTheDocument();
    expect(
      screen.getByText('If the PDF preview is blank, download the file to open it.'),
    ).toBeInTheDocument();
    const download = screen.getByRole('link', { name: 'Download file' });
    expect(download).toHaveAttribute('href', 'blob:invoice-preview');
    expect(download).toHaveAttribute('download', 'invoice.pdf');
    expect(createObjectURL).toHaveBeenCalledExactlyOnceWith(blob);
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:invoice-preview');
  });
});
