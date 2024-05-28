import { render, screen, fireEvent } from '@testing-library/react';
import PopUpBar from '../PopUpBar';

const viewingUser = {
  firstName: 'TestUser',
  lastName: 'LastName',
};

// render Component
const renderComponent = (props = {}) => {
  render(<PopUpBar viewingUser={viewingUser} {...props} />);
};

// Test Cases
describe('Test Suite for PopUpBar', () => {
  it('Test Case 1: Renders without crashing', () => {
    renderComponent();
    const actualText = screen.getByTestId('test-popup');
    expect(actualText).toBeInTheDocument();
  });

  it('Test Case 2: Renders with correct text', () => {
    renderComponent();
    const expectedText = `You are currently viewing the header for ${viewingUser.firstName} ${viewingUser.lastName}`;
    const actualText = screen.getByText(expectedText);
    expect(actualText).toBeInTheDocument();
  });

  it('Test Case 3: Closes on button click', () => {
    const onClickClose = jest.fn();
    renderComponent({ onClickClose });

    const closeButton = screen.getByText('X');
    fireEvent.click(closeButton);

    // Ensure the onClickClose function is called
    expect(onClickClose).toHaveBeenCalled();
  });
});