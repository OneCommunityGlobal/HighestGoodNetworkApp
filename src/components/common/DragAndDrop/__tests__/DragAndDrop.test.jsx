import { fireEvent, render, screen } from '@testing-library/react';
import DragAndDrop from '../DragAndDrop';

vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: false } }),
}));

describe('DragAndDrop multiple selection', () => {
  it('preserves multiple-file selection by default', () => {
    const updateUploadedFiles = vi.fn();
    render(<DragAndDrop updateUploadedFiles={updateUploadedFiles} />);

    const input = screen.getByLabelText('Upload image files');
    expect(input).toHaveAttribute('multiple');

    const files = [
      new File(['first'], 'first.png', { type: 'image/png' }),
      new File(['second'], 'second.png', { type: 'image/png' }),
    ];
    fireEvent.change(input, { target: { files } });

    expect(updateUploadedFiles).toHaveBeenCalledWith(files);
  });

  it('limits selection to one file when multiple is disabled', () => {
    const updateUploadedFiles = vi.fn();
    render(<DragAndDrop updateUploadedFiles={updateUploadedFiles} multiple={false} />);

    const input = screen.getByLabelText('Upload image files');
    expect(input).not.toHaveAttribute('multiple');

    const files = [
      new File(['first'], 'first.png', { type: 'image/png' }),
      new File(['second'], 'second.png', { type: 'image/png' }),
    ];
    fireEvent.change(input, { target: { files } });

    expect(updateUploadedFiles).toHaveBeenCalledWith([files[0]]);
  });
});
