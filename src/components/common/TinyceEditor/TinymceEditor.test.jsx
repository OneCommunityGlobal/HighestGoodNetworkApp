import { render, screen, waitFor } from '@testing-library/react';
import TinyMCEEditor from './TinyMCEEditor';

describe('TinyMCEEditor Component', () => {
  const mockProps = {
    label: 'Test Label',
    name: 'testName',
    className: 'custom-class',
    error: '',
    value: '',
  };

  it('renders without crashing', async () => {
    render(<TinyMCEEditor {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByLabelText(mockProps.label)).toBeInTheDocument();
    });
  });

  it('displays the correct label', async () => {
    render(<TinyMCEEditor {...mockProps} />);
    expect(await screen.findByText(mockProps.label)).toBeInTheDocument();
  });

  it('renders the TinyMCE editor', async () => {
    render(<TinyMCEEditor {...mockProps} />);
    await waitFor(() => {
      const editorTextarea = document.getElementById(mockProps.name);
      expect(editorTextarea).toBeInTheDocument();
    });
  });

  it('displays an error message when error prop is provided', async () => {
    render(<TinyMCEEditor {...mockProps} error="Error message" />);
    expect(await screen.findByText("Error message")).toBeInTheDocument();
  });

  it('applies custom class name to the wrapper', async () => {
    render(<TinyMCEEditor {...mockProps} />);
    await waitFor(() => {
      const wrapper = document.querySelector(`.${mockProps.className}`);
      expect(wrapper).toBeInTheDocument();
    });
  });
});
