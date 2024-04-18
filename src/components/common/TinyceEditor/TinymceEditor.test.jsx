import { render, screen, waitFor } from '@testing-library/react';
import TinyMCEEditor from './tinymceEditor';

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

  it('should render the component with empty props', () => {
    const mockProps = {
      label: '',
      name: '',
      className: '',
      error: '',
      value: '',
    };
    render(<TinyMCEEditor {...mockProps} />);
  });

  it('should render the component with long label or name props', () => {
    const mockProps = {
      label: 'This is a long label that might be longer than expected',
      name: 'ThisIsALongNameThatMightBeLongerThanExpected',
      className: 'custom-class',
      error: '',
      value: '',
    };
  
    render(<TinyMCEEditor {...mockProps} />);
  
    expect(screen.getByLabelText(mockProps.label)).toBeInTheDocument();
    expect(screen.getByLabelText(mockProps.label)).toHaveAttribute('id', mockProps.name);
  });

  it('should render the component with different config props', () => {
    const mockProps = {
      label: 'Test Label',
      name: 'testName',
      className: 'custom-class',
      error: '',
      value: '',
    };
  
    const config = {
      plugins: 'autolink link image lists print preview',
      toolbar: 'undo redo | bold italic | alignleft aligncenter alignright',
    };
  
    render(<TinyMCEEditor {...mockProps} config={config} />);
    
    const editorTextarea = document.getElementById(mockProps.name);
    expect(editorTextarea).toBeInTheDocument();
    expect(screen.getByLabelText(mockProps.label)).toBeInTheDocument();
    expect(editorTextarea).toBeInTheDocument();
  });
});
