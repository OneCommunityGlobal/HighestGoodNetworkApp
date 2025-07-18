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
    render(
      <TinyMCEEditor
        label="Test Label"
        name="testName"
        className="custom-class"
        error=""
        value=""
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(mockProps.label)).toBeInTheDocument();
    });
  });

  it('displays the correct label', async () => {
    render(
      <TinyMCEEditor
        label="Test Label"
        name="testName"
        className="custom-class"
        error=""
        value=""
      />,
    );

    expect(await screen.findByText(mockProps.label)).toBeInTheDocument();
  });

  it('renders the TinyMCE editor', async () => {
    render(
      <TinyMCEEditor
        label="Test Label"
        name="testName"
        className="custom-class"
        error=""
        value=""
      />,
    );

    await waitFor(() => {
      // eslint-disable-next-line testing-library/no-node-access
      const editorTextarea = document.getElementById(mockProps.name);
      expect(editorTextarea).toBeInTheDocument();
    });
  });

  it('displays an error message when error prop is provided', async () => {
    render(
      <TinyMCEEditor
        label="Test Label"
        name="testName"
        className="custom-class"
        error="Error Message"
        value=""
      />,
    );

    expect(await screen.findByText('Error Message')).toBeInTheDocument();
  });

  it('applies custom class name to the wrapper', async () => {
    render(
      <TinyMCEEditor
        label="Test Label"
        name="testName"
        className="custom-class"
        error=""
        value=""
      />,
    );

    await waitFor(() => {
      // eslint-disable-next-line testing-library/no-node-access
      const wrapper = document.querySelector(`.${mockProps.className}`);
      expect(wrapper).toBeInTheDocument();
    });
  });

  it('should render the component with empty props', () => {
    const thismockProps = {
      label: '',
      name: '',
      className: '',
      error: '',
      value: '',
    };
    render(
      <TinyMCEEditor
        label={thismockProps.label}
        name={thismockProps.name}
        className={thismockProps.className}
        error={thismockProps.error}
        value={thismockProps.value}
      />,
    );
  });

  it('should render the component with long label or name props', async () => {
    const longlabelmockProps = {
      label: 'This is a long label that might be longer than expected',
      name: 'ThisIsALongNameThatMightBeLongerThanExpected',
      className: 'custom-class',
      error: 'Error Message',
      value: '',
    };

    render(
      <TinyMCEEditor
        label={longlabelmockProps.label}
        name={longlabelmockProps.name}
        className={longlabelmockProps.className}
        error={longlabelmockProps.error}
        value={longlabelmockProps.value}
      />,
    );

    expect(await screen.findByText('Error Message')).toBeInTheDocument();
    expect(screen.getByLabelText(longlabelmockProps.label)).toHaveAttribute(
      'id',
      longlabelmockProps.name,
    );
  });

  it('should render the component with different config props', () => {
    const differebtmockProps = {
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

    render(
      <TinyMCEEditor
        label={differebtmockProps.label}
        name={differebtmockProps.name}
        className={differebtmockProps.className}
        error={differebtmockProps.error}
        value={differebtmockProps.value}
        config={config}
      />,
    );
    // eslint-disable-next-line testing-library/no-node-access
    const editorTextarea = document.getElementById(mockProps.name);
    expect(editorTextarea).toBeInTheDocument();
    expect(screen.getByLabelText(mockProps.label)).toBeInTheDocument();
    expect(editorTextarea).toBeInTheDocument();
  });
});
