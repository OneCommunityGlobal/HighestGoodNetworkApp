import React from 'react';
import AddProject from '../AddProject';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("AddProject component", () => {
  let store;
  const initialState = {
    theme: { darkMode: false },
    projectMembers: { foundUsers: [] }
  };

  beforeEach(() => {
    store = mockStore(initialState);
    store.dispatch = vi.fn();
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <AddProject 
          hasPermission={() => true}
          {...props}
        />
      </Provider>
    );
  };

//helper function
const typeIntoInput = async ({ input }) => {
  const inputField = screen.getByRole('textbox');

  if (input) {
    await userEvent.type(inputField, input);
    await userEvent.type(inputField, input);
  }

  return {
    inputField,
  };
};

 
  test("it renders correctly", () => {    
    renderComponent();
    expect(screen.getByText("Add New Project")).toBeInTheDocument();
  })

  test("opens modal on button click", async () => {
    renderComponent();
    await userEvent.click(screen.getByText("Add New Project"));
    expect(screen.getByText("Add New Project", { selector: 'h5' })).toBeInTheDocument();
  });

  test("category select updates correctly", async () => {
    renderComponent();
    await userEvent.click(screen.getByText("Add New Project"));
    const select = screen.getByLabelText("Select Category");
    await userEvent.selectOptions(select, "Food");
    expect(select).toHaveValue("Food");
  });

  test("WBS input and list work correctly", async () => {
    renderComponent();
    await userEvent.click(screen.getByText("Add New Project"));
    const input = screen.getByPlaceholderText("Enter WBS name");
    await userEvent.type(input, "WBS 1");
    await userEvent.click(screen.getByText("Add WBS"));
    expect(screen.getByText("WBS 1")).toBeInTheDocument();
  });

  test("adds project on form submission", async () => {
    renderComponent();
    await userEvent.click(screen.getByText("Add New Project"));
    await userEvent.type(screen.getByLabelText("Project Name"), "Test Project");
    await userEvent.selectOptions(screen.getByLabelText("Select Category"), "Food");
    await userEvent.click(screen.getByText("Add Project"));
    
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });
})

// describe('AddProject component state handlers', () => {
  
//   //mock the onAddNewProject function

//   const mockAddNewProject = vi.fn();

//   beforeEach(() => {
//     render(<AddProject onAddNewProject={mockAddNewProject} />)
//   });

//   test("Input change handler updates state correctly", () => {
//     const inputField = screen.getByRole('textbox');

//     fireEvent.change(inputField, { target: { value: 'New Project' } });

//     expect(inputField.value).toBe('New Project');
//   })

//   test("Select change handler updates state correctly", () => {
//     const selectElement = screen.getByRole('combobox');
//     fireEvent.change(selectElement, { target: { value: 'Food' } });
//     expect(selectElement.value).toBe('Food');
//   })

//   test('Button click handler calls onAddNewProject with correct arguments', () => {
//     const inputField = screen.getByRole('textbox');
//     const selectElement = screen.getByRole('combobox');

//     fireEvent.change(inputField, { target: { value: 'New Project' } });
//     fireEvent.change(selectElement, { target: { value: 'Food' } });

//     const buttonElement = screen.queryByRole('button');
    
//     fireEvent.click(buttonElement);

//     expect(mockAddNewProject).toHaveBeenLastCalledWith('New Project', 'Food');    
//   })
// })

