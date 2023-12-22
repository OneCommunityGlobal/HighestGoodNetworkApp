import { render, screen } from '@testing-library/react';
import PopUpBar from '../PopUpBar';

// mock data
const userProfile = {};
let popUpText;
const message = 'You are currently viewing the dashboard for';

// render Component
const renderComponent = () => {
  render(<PopUpBar userProfile={userProfile} />);
};

// Test Cases
describe('Test Suite for PoUpBar', () => {
  it('Test Case 1: Renders without crashing', () => {
    renderComponent();
    const actualText = screen.getByTestId('test-popup');
    expect(actualText).toBeInTheDocument();
  });
  it('Test Case 2: Assert if popup renders with null parameters ', () => {
    renderComponent();
    popUpText = `${message} ${userProfile.firstName} ${userProfile.lastName}.`;
    const actualText = screen.getByText(popUpText);
    expect(actualText).toBeInTheDocument();
  });
  it('Test Case 3: Assert if popup renders with the expected text', () => {
    userProfile.firstName = 'TestUser';
    userProfile.lastName = 'LastName';
    popUpText = `${message} ${userProfile.firstName} ${userProfile.lastName}.`;

    renderComponent();

    const actualText = screen.getByText(popUpText);
    expect(actualText).toBeInTheDocument();
  });
});
