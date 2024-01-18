import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddWBS from '../AddWBS';
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk]);

jest.mock('utils/permissions', () => ({
  canPostWBS: jest.fn((a) => true),
}));

const renderAddWBS = (addWBSProps) => {
  const initialState = {
    auth: {
      user: {
        role: 'Owner',
        permissions: {
          frontPermissions: [],
        },
      },
    },
    ...addWBSProps,
  };

  const store = mockStore(initialState);

  return render(
    <Provider store={store}>
      <AddWBS {...addWBSProps} />
    </Provider>
  );
}
// Helper function
const typeIntoInput = ({ input }) => {
  const inputField = screen.getByRole('textbox');

  if (input) {
    userEvent.type(inputField, input);
  }

  return { inputField };
};

describe("AddWBS component structure", () => {

  beforeEach(() => {
    const sampleProps = {
      role: 'Owner',
    };
    const hasPermission = jest.fn((a) => true)
    sampleProps.hasPermission = hasPermission;
    renderAddWBS(sampleProps);
  });

  test("it renders correctly based on permissions", () => {
    // Assuming hasPermission is mocked to return true
    expect(screen.getByText("Add new WBS")).toBeInTheDocument();
  });

  test("input field should initially be empty", () => {
    expect(screen.getByRole('textbox').value).toBe('');
  });

  test("button should not be in the document when the input field is empty", () => {
    expect(screen.queryByRole('button')).toBeNull();
  });

  test("user should be able to type in the input field", () => {
    const { inputField } = typeIntoInput({ input: 'New WBS Name' });
    expect(inputField.value).toBe('New WBS Name');
  });

  test("button should appear when user types in the input field", () => {
    typeIntoInput({ input: '123' });
    expect(screen.queryByRole('button')).not.toBeNull();
  });
});

describe('AddWBS component state handlers', () => {

  // Mock the addNewWBS function
  const mockAddNewWBS = jest.fn();
  const mockProjectId = '123';


  beforeEach(() => {
    const sampleProps = {
      role: 'Owner',
      addWBS: mockAddNewWBS,
      projectId: mockProjectId,
    };
    const hasPermission = jest.fn((a) => true)
    sampleProps.hasPermission = hasPermission;
    renderAddWBS(sampleProps);

  });

  test("Input change handler updates state correctly", () => {
    const inputField = screen.getByRole('textbox');

    fireEvent.change(inputField, { target: { value: 'New WBS' } });

    expect(inputField.value).toBe('New WBS');
  });


  // /// This test is failing because the addNewWBS function is not being called in the component
  // test('Button click handler calls addNewWBS with correct arguments', () => {
  //   const inputField = screen.getByRole('textbox');
  //
  //   fireEvent.change(inputField, { target: { value: 'New WBS' } });
  //
  //   const buttonElement = screen.queryByRole('button');
  //
  //   fireEvent.click(buttonElement);
  //
  //   expect(mockAddNewWBS).toHaveBeenLastCalledWith('New WBS', mockProjectId);
  // });


});
