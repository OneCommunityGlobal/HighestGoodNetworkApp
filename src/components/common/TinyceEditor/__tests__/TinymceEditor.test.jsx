import { render, screen, waitFor } from '@testing-library/react';
import TinyMCEEditor from '../tinymceEditor';

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
    const input = await screen.findByLabelText(mockProps.label);
    expect(input).toBeInTheDocument();
  });

  it('displays an error message when error prop is provided', async () => {
    render(<TinyMCEEditor {...mockProps} error="Error Message" />);

    expect(await screen.findByText('Error Message')).toBeInTheDocument();
  });

  it('applies custom class name to the wrapper', async () => {
    render(<TinyMCEEditor {...mockProps} />);
    const wrapper = await screen.findByLabelText(mockProps.label);
    // eslint-disable-next-line testing-library/no-node-access
    expect(wrapper.closest(`.${mockProps.className}`)).toBeInTheDocument();
  });

  it('should render the component with empty props', () => {
    const emptyProps = {
      label: '',
      name: '',
      className: '',
      error: '',
      value: '',
    };
    render(<TinyMCEEditor {...emptyProps} />);
  });

  it('should render the component with long label or name props', async () => {
    const longProps = {
      label: 'This is a long label that might be longer than expected',
      name: 'ThisIsALongNameThatMightBeLongerThanExpected',
      className: 'custom-class',
      error: 'Error Message',
      value: '',
    };

    render(<TinyMCEEditor {...longProps} />);
    expect(await screen.findByText('Error Message')).toBeInTheDocument();
    expect(screen.getByLabelText(longProps.label)).toHaveAttribute('id', longProps.name);
  });

  it('should render the component with different config props', async () => {
    const config = {
      plugins: 'autolink link image lists print preview',
      toolbar: 'undo redo | bold italic | alignleft aligncenter alignright',
    };

    render(<TinyMCEEditor {...mockProps} config={config} />);
    const editorInput = await screen.findByLabelText(mockProps.label);
    expect(editorInput).toBeInTheDocument();
  });
});
