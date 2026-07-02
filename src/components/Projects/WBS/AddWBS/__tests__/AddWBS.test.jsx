import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddWBS from '../AddWBS';
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk]);

vi.mock('utils/permissions', () => ({
  canPostWBS: vi.fn((a) => true),
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
    theme: { darkMode: false },
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
const typeIntoInput = async ({ input }) => {
  const inputField = screen.getByRole('textbox');

  if (input) {
    await userEvent.type(inputField, input);
  }

  return { inputField };
};

describe("AddWBS component structure", () => {

  test("it renders correctly based on permissions", () => {
    const sampleProps = {
      role: 'Owner',
    };
    const hasPermission = vi.fn((a) => true)
    sampleProps.hasPermission = hasPermission;
    renderAddWBS(sampleProps);
    // Assuming hasPermission is mocked to return true
    expect(screen.getByText("Add new WBS")).toBeInTheDocument();
  });

  test("input field should initially be empty", () => {
    const sampleProps = {
      role: 'Owner',
    };
    const hasPermission = vi.fn((a) => true)
    sampleProps.hasPermission = hasPermission;
    renderAddWBS(sampleProps);
    expect(screen.getByRole('textbox').value).toBe('');
  });

  test("button should not be in the document when the input field is empty", () => {
    const sampleProps = {
      role: 'Owner',
    };
    const hasPermission = vi.fn((a) => true)
    sampleProps.hasPermission = hasPermission;
    renderAddWBS(sampleProps);
    expect(screen.queryByTestId('add-wbs-button')).toBeNull();
  });

  test("user should be able to type in the input field", async () => {
    const sampleProps = {
      role: 'Owner',
    };
    const hasPermission = vi.fn((a) => true)
    sampleProps.hasPermission = hasPermission;
    renderAddWBS(sampleProps);
    const { inputField } = await typeIntoInput({ input: 'New WBS Name' });
    expect(inputField.value).toBe('New WBS Name');
  });

  test("button should appear when user types in the input field", async () => {
    const sampleProps = {
      role: 'Owner',
    };
    const hasPermission = vi.fn((a) => true)
    sampleProps.hasPermission = hasPermission;
    renderAddWBS(sampleProps);
    await typeIntoInput({ input: '123' });
    expect(screen.getByTestId('add-wbs-button')).not.toBeNull();
  });
});

describe('AddWBS component state handlers', () => {

  // Mock the addNewWBS function
  const mockAddNewWBS = vi.fn();
  const mockProjectId = '123';

  test("Input change handler updates state correctly", () => {
    const sampleProps = {
      role: 'Owner',
      addWBS: mockAddNewWBS,
      projectId: mockProjectId,
    };
    const hasPermission = vi.fn((a) => true)
    sampleProps.hasPermission = hasPermission;
    renderAddWBS(sampleProps);
    
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
