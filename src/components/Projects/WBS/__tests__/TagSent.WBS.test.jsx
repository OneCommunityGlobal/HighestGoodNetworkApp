import { render, screen, fireEvent } from '@testing-library/react';
import TagSent from '../WBSDetail/components/TagSent';
import '@testing-library/jest-dom/extend-expect';

// Mock FontAwesomeIcon
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="mock-icon" />,
}));

describe('TagSent component', () => {
  // expected functioning
  it('should render a <li> element with the correct className', () => {
    const elm = { userID: 1, name: 'John' };
    const removeResource = vi.fn();
    render(<TagSent elm={elm} removeResource={removeResource} />);

    const liElement = screen.getByRole('listitem');
    expect(liElement).toHaveClass('rounded-pill badge bg-primary text-wrap');
  });

  it('should call removeResource function with correct argument when onClick event is triggered', () => {
    const elm = { userID: 1, name: 'John' };
    const removeResource = vi.fn();
    render(<TagSent elm={elm} removeResource={removeResource} />);

    const liElement = screen.getByRole('listitem');
    fireEvent.click(liElement);

    expect(removeResource).toHaveBeenCalledWith(elm.userID);
  });

  it('should render a FontAwesomeIcon', () => {
    const elm = { userID: 1, name: 'John' };
    const removeResource = vi.fn();
    render(<TagSent elm={elm} removeResource={removeResource} />);

    const iconElement = screen.getByTestId('mock-icon');
    expect(iconElement).toBeInTheDocument();
  });

  // edge cases
  it('should render elm name correctly', () => {
    const elm = { userID: 1, name: 'John' };
    const removeResource = vi.fn();
    render(<TagSent elm={elm} removeResource={removeResource} />);

    const smallElement = screen.getByText('John');
    expect(smallElement).toBeInTheDocument();
    expect(smallElement).toHaveClass('fs-6 mr-1');
  });

  it('should handle when userID and name properties have incorrect types', () => {
    const elm = { userID: 'abc', name: 123 };
    const removeResource = vi.fn();
    render(<TagSent elm={elm} removeResource={removeResource} />);

    // It should convert the name to a string
    const smallElement = screen.getByText('123');
    expect(smallElement).toBeInTheDocument();

    // Click should still work with string userID
    const liElement = screen.getByRole('listitem');
    fireEvent.click(liElement);
    expect(removeResource).toHaveBeenCalledWith('abc');
  });

  it('should render text correctly in the small element', () => {
    const elm = { userID: 1, name: 'John' };
    const removeResource = vi.fn();
    render(<TagSent elm={elm} removeResource={removeResource} />);

    const smallElement = screen.getByText('John');
    expect(smallElement).toBeInTheDocument();
  });
});
