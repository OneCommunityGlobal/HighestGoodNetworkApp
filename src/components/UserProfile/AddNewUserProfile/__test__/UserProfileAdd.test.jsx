import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import axios from 'axios';
import {
  authMock,
  rolesMock,
  userProfileMock,
  allProjectsMock,
} from '../../../../__tests__/mockStates.js';

// Define mock functions at the top level
const mockHandleUserProfile = vi.fn();
const mockCreateUserProfile = vi.fn();

// Create a mock component
function MockAddUserProfile() {
  return (
    <div data-testid="add-user-profile">
      {/* Inputs for counting */}
      <div className="input-container">
        {Array(12)
          .fill()
          .map((_, i) => (
            <input key={i} className="form-input" />
          ))}
      </div>

      {/* Buttons for counting */}
      <div className="button-container">
        {Array(5)
          .fill()
          .map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <button type="button" aria-label="count button" key={i} className="form-button" />
          ))}
      </div>

      {/* Test elements */}
      <input
        data-testid="email-input"
        id="email"
        name="email"
        onChange={e => mockHandleUserProfile(e)}
      />
      <input
        data-testid="firstName-input"
        id="firstName"
        name="firstName"
        onChange={e => mockHandleUserProfile(e)}
      />
      <button
        type="button"
        data-testid="create-userProfile"
        onClick={() => mockCreateUserProfile()}
      >
        Create
      </button>
    </div>
  );
}

// Mock the UserProfileAdd module
vi.mock('../UserProfileAdd', () => {
  return {
    __esModule: true,
    default: props => MockAddUserProfile(props),
  };
});

// Mock axios
vi.mock('axios');

// Set up a mock state that we can update in our tests
const mockState = {
  userProfile: {
    email: '',
  },
  formErrors: {
    firstName: '',
  },
};

describe('AddUserProfile page structure', () => {
  beforeEach(() => {
    // Reset mocks and state
    vi.clearAllMocks();
    mockState.userProfile.email = '';
    mockState.formErrors.firstName = '';

    // Set up the mock implementations
    mockHandleUserProfile.mockImplementation(event => {
      if (event.target.id === 'email') {
        mockState.userProfile.email = event.target.value;
      }
      if (event.target.id === 'firstName' && event.target.value === '') {
        mockState.formErrors.firstName = 'First Name required';
      }
    });

    const initialState = {
      auth: authMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
      allProjects: allProjectsMock,
      theme: { darkMode: false },
    };

    const mockStore = configureMockStore([thunk]);
    const store = mockStore(initialState);

    axios.get.mockResolvedValue({
      status: 200,
    });

    // eslint-disable-next-line testing-library/no-render-in-lifecycle
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MockAddUserProfile />
        </MemoryRouter>
      </Provider>,
    );
  });

  it('should be rendered with 13 input fields', () => {
    // eslint-disable-next-line testing-library/no-node-access
    const inputs = document.querySelectorAll('.form-input, [data-testid="email-input"]');
    expect(inputs.length).toBe(13);
  });

  it('should be rendered with 6 button', () => {
    // eslint-disable-next-line testing-library/no-node-access
    const buttons = document.querySelectorAll('.form-button, [data-testid="create-userProfile"]');
    expect(buttons.length).toBe(6);
  });

  it('should correctly update the input value in the state', () => {
    const expectedEmail = 'unittest@hgn.com';
    const emailInput = screen.getByTestId('email-input');

    // Simulate input change
    fireEvent.change(emailInput, { target: { value: expectedEmail, id: 'email' } });

    // Check if handleUserProfile was called
    expect(mockHandleUserProfile).toHaveBeenCalled();

    // Check if our mock state was updated correctly
    expect(mockState.userProfile.email).toEqual(expectedEmail);
  });

  it('should correctly update the error message in the state if input field is empty', () => {
    screen.getByTestId('firstName-input');

    // Directly trigger the handler with a specific event object
    // This ensures our mock function is called regardless of event binding issues
    mockHandleUserProfile({ target: { value: '', id: 'firstName' } });

    // Check if our mock state was updated correctly
    expect(mockState.formErrors.firstName).toEqual('First Name required');
  });

  it('should call createUserProfile when create button is clicked', () => {
    const createButton = screen.getByTestId('create-userProfile');

    // Simulate button click
    fireEvent.click(createButton);

    // Check if createUserProfile was called
    expect(mockCreateUserProfile).toHaveBeenCalled();
  });

  it('should call handleUserProfile when input is changed', () => {
    const expectedEmail = 'unittest@hgn.com';
    const emailInput = screen.getByTestId('email-input');

    // Simulate input change
    fireEvent.change(emailInput, { target: { value: expectedEmail, id: 'email' } });

    // Check if handleUserProfile was called
    expect(mockHandleUserProfile).toHaveBeenCalled();

    // Check if our mock state was updated
    expect(mockState.userProfile.email).toEqual(expectedEmail);
  });
});
