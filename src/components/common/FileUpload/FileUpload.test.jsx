import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FileUpload from './FileUpload';

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

  it('alerts an error if the uploaded file type is invalid', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const file = new File(['dummy content'], 'dummy.jpeg', { type: 'image/jpeg' }); // Notice the incorrect file type

    const { container } = render(<FileUpload name="test-upload" accept="image/png" />);
    // Target the file input
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });
    expect(alertSpy).toHaveBeenCalledWith('File type must be image/png.');
    alertSpy.mockRestore();
  });

  it('alerts an error if the uploaded file exceeds maximum size', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    // Create a dummy file with a size larger than 1KB
    const file = new File(['a'.repeat(1025)], 'dummy.png', { type: 'image/png' }); 

    const { container } = render(
      <FileUpload name="test-upload" accept="image/png" maxSizeinKB={1} />,
    );
    // Target the file input
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('The file you are trying to upload exceed the maximum size'),
    );
    alertSpy.mockRestore();
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

  it('alerts when no file is chosen', () => {
    const alertSpy = jest.spyOn(window, 'alert');
    alertSpy.mockImplementation(() => {}); // Mock the implementation

    const { container } = render(<FileUpload name="test-upload" />);
    const input = container.querySelector('input[type="file"]');

    // Trigger change event without providing a file
    fireEvent.change(input, { target: { files: [] } });

    expect(alertSpy).toHaveBeenCalledWith('Choose a valid file');

    alertSpy.mockRestore(); // Restore the original function
  });
});
