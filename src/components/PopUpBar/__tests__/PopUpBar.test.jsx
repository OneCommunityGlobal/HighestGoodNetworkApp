/* eslint-disable react/jsx-props-no-spreading */
import { render, screen, fireEvent } from '@testing-library/react';
import PopUpBar from '../PopUpBar';

// render Component
const renderComponent = (props = {}) => {
  render(<PopUpBar message="PopUpBar text message" {...props} />);
};

// Test Cases
describe('Test Suite for PopUpBar', () => {
  it('Test Case 1: Renders without crashing', () => {
    renderComponent();
    const actualText = screen.getByTestId('test-popup');
    expect(actualText).toBeInTheDocument();
  });

  it('Test Case 2: Renders with correct custom message', () => {
    renderComponent();
    const actualText = screen.getByText('PopUpBar text message');
    expect(actualText).toBeInTheDocument();
  });

  it('Test Case 2b: Renders with default template when no message is provided', () => {
    window.viewingUser = { firstName: 'Jane', lastName: 'Smith' };
    render(<PopUpBar message={undefined} />);

    const expectedText =
      'You are currently functioning as Jane Smith, you only have the permissions of Jane';
    const messageElement = screen.getByText(expectedText);
    expect(messageElement).toBeInTheDocument();

    delete window.viewingUser;
  });

  it('Test Case 3: Closes on button click', () => {
    const onClickClose = vi.fn();
    renderComponent({ onClickClose });

    const closeButton = screen.getByText('X');
    fireEvent.click(closeButton);

    expect(onClickClose).toHaveBeenCalled();
  });
});
