import { render, screen } from '@testing-library/react';
import TinyMCEEditor from './TinyMCEEditor';

describe('TinyMCEEditor Component', () => {
  const mockProps = {
    label: 'Test Label',
    name: 'testName',
    className: 'custom-class',
    error: '',
    value: '',
  };

  it('renders without crashing', () => {
    render(<TinyMCEEditor {...mockProps} />);
    expect(screen.getByLabelText(mockProps.label)).toBeInTheDocument();
  });

  it('displays the correct label', () => {
    render(<TinyMCEEditor {...mockProps} />);
    expect(screen.getByText(mockProps.label)).toBeInTheDocument();
  });

  it('renders the TinyMCE editor', () => {
    render(<TinyMCEEditor {...mockProps} />);
    const editorTextarea = document.getElementById(mockProps.name);
    expect(editorTextarea).toBeInTheDocument();
  });

  it('displays an error message when error prop is provided', () => {
    render(<TinyMCEEditor {...mockProps} error="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it('applies custom class name to the wrapper', () => {
    render(<TinyMCEEditor {...mockProps} />);
    const wrapper = document.querySelector(`.${mockProps.className}`);
    expect(wrapper).toBeInTheDocument();
  });
});
