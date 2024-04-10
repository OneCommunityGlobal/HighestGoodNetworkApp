import { render, screen } from '@testing-library/react';
import PopUpBar from '../PopUpBar';

// mock data
const userProfile = {};
let popUpText;
const componentName = 'dashboard';
const generateMessage = component => `You are currently viewing the ${component} for`;

// render Component
const renderComponent = () => {
  render(<PopUpBar userProfile={userProfile} component={componentName} />);
};

// Test Cases
describe('Test Suite for PopUpBar', () => {
  it('Test Case 1: Renders without crashing', () => {
    renderComponent();
    const actualText = screen.getByTestId('test-popup');
    expect(actualText).toBeInTheDocument();
  });
  it('Test Case 2: Assert if popup renders with null parameters ', () => {
    renderComponent();
    popUpText = `${generateMessage(componentName)} ${userProfile.firstName} ${
      userProfile.lastName
    }.`;
    const actualText = screen.getByText(popUpText);
    expect(actualText).toBeInTheDocument();
  });
  it('Test Case 3: Assert if popup renders with the expected text', () => {
    userProfile.firstName = 'TestUser';
    userProfile.lastName = 'LastName';
    popUpText = `${generateMessage(componentName)} ${userProfile.firstName} ${
      userProfile.lastName
    }.`;

    renderComponent();

    const actualText = screen.getByText(popUpText);
    expect(actualText).toBeInTheDocument();
  });
});
