// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FileUpload from '../FileUpload';

describe('FileUpload Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<FileUpload name="test-upload" label="Upload File" />);
    const label = container.querySelector('label[title="Upload File"]');
    expect(label).toBeInTheDocument();
  });

  it('displays an error message if provided', () => {
    const { getByText } = render(<FileUpload name="test-upload" error="File is too large" />);
    expect(getByText(/File is too large/)).toBeInTheDocument();
  });

  it('calls onUpload with error if uploaded file type is invalid', () => {
    const onUploadMock = jest.fn();
    const file = new File(['dummy content'], 'dummy.jpeg', { type: 'image/jpeg' });

    const { container } = render(
      <FileUpload name="test-upload" accept="image/png" onUpload={onUploadMock} />,
    );

    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUploadMock).toHaveBeenCalledWith(null, null, 'File type must be image/png.');
  });

  it('calls onUpload with error if file exceeds max size', () => {
    const onUploadMock = jest.fn();
    const file = new File(['a'.repeat(1025)], 'dummy.png', { type: 'image/png' });

    const { container } = render(
      <FileUpload name="test-upload" accept="image/png" maxSizeinKB={1} onUpload={onUploadMock} />,
    );

    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUploadMock).toHaveBeenCalledWith(
      null,
      null,
      'The file you are trying to upload exceeds the maximum size of 1KB.',
    );
  });

  it('calls onUpload prop with correct arguments', () => {
    const onUploadMock = jest.fn();
    const file = new File(['dummy content'], 'dummy.png', { type: 'image/png' });

    const { container } = render(
      <FileUpload name="test-upload" accept="image/png" onUpload={onUploadMock} />,
    );
    // Target the file input, not the label
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });
    expect(onUploadMock).toHaveBeenCalled();
  });

  it('calls onUpload with error when no file is selected', () => {
    const onUploadMock = jest.fn();

    const { container } = render(<FileUpload name="test-upload" onUpload={onUploadMock} />);

    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [] } });

    expect(onUploadMock).toHaveBeenCalledWith(null, null, 'Choose a valid file');
  });
});
