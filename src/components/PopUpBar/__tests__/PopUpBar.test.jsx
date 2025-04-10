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

  it('Test Case 2: Renders with correct text', () => {
    renderComponent();
    const expectedText = `PopUpBar text message`;
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