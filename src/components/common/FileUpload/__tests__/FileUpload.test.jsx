import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import FileUpload from '../FileUpload';

describe('FileUpload Component', () => {
  it('renders without crashing', () => {
    render(<FileUpload name="test-upload" label="Upload File" />);
    const label = screen.getByTitle('Upload File');
    expect(label).toBeInTheDocument();
  });

  it('displays an error message if provided', () => {
    render(<FileUpload name="test-upload" error="File is too large" />);
    expect(screen.getByText(/File is too large/)).toBeInTheDocument();
  });

  it('calls onUpload with error if uploaded file type is invalid', () => {
    const onUploadMock = vi.fn();
    const file = new File(['dummy content'], 'dummy.jpeg', { type: 'image/jpeg' });

    render(<FileUpload name="test-upload" accept="image/png" onUpload={onUploadMock} />);

    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUploadMock).toHaveBeenCalledWith(null, null, 'File type must be image/png.');
  });

  it('calls onUpload with error if file exceeds max size', () => {
    const onUploadMock = vi.fn();
    const file = new File(['a'.repeat(1025)], 'dummy.png', { type: 'image/png' });

    render(
      <FileUpload name="test-upload" accept="image/png" maxSizeinKB={1} onUpload={onUploadMock} />,
    );

    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUploadMock).toHaveBeenCalledWith(
      null,
      null,
      'The file you are trying to upload exceeds the maximum size of 1KB.',
    );
  });

  it('calls onUpload prop with correct arguments', () => {
    const onUploadMock = vi.fn();
    const file = new File(['dummy content'], 'dummy.png', { type: 'image/png' });

    render(<FileUpload name="test-upload" accept="image/png" onUpload={onUploadMock} />);

    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUploadMock).toHaveBeenCalled();
  });

  it('calls onUpload with error when no file is selected', () => {
    const onUploadMock = vi.fn();

    render(<FileUpload name="test-upload" onUpload={onUploadMock} />);

    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [] } });

    expect(onUploadMock).toHaveBeenCalledWith(null, null, 'Choose a valid file');
  });
});
