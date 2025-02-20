import React from "react";
import { Provider } from "react-redux";
import configureStore from 'redux-mock-store';
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import BlueSquaresTable from "../BlueSquaresTable";
import thunk from "redux-thunk";
import mockAdminState from '__tests__/mockAdminState';
import EditableInfoModal from "components/UserProfile/EditableModal/EditableInfoModal";
import axios from "axios";

jest.mock('axios');

const mockHandleUserProfile = jest.fn();
const mockHandleBlueSquare = jest.fn();
const mockStore = configureStore([thunk]);

const initialState = {
  auth: {
    user: {
      permissions: {
        frontPermissions: ['addInfringements', 'editInfringements', 'deleteInfringements',  'infringementAuthorizer', 'putUserProfileImportantInfo'],
        backPermissions: [],
      },
      role: 'Volunteer',
    },
  },
  userProfile: {
    infringements: [
      { _id: '1', date: '2023-12-03T12:00:00.000+00:00', description: 'some reason' },
      { _id: '2', date: '2023-12-10T12:00:00.000+00:00', description: 'test reason' },
    ],
  },
  role: mockAdminState.role,
};
let store;

beforeEach(() => {
  store = mockStore(initialState);
  axios.get.mockResolvedValue({ data: 'mocked response' });
});
afterEach(() => {
  store.clearActions();
  jest.clearAllMocks();
});

describe("BlueSquaresTable component unit tests", () => {
  const renderComponent = (canEdit, isPrivate, darkMode = false,loading = true) => {
    return render(
      <Provider store={store}>
        <EditableInfoModal loading={loading} />
        <BlueSquaresTable
          userProfile={initialState.userProfile}
          canEdit={canEdit}
          isPrivate={isPrivate}
          handleUserProfile={mockHandleUserProfile}
          handleBlueSquare={mockHandleBlueSquare}
          darkMode={darkMode}
        />
      </Provider>
    );
  };
  it('renders BlueSquaresTable with editable toggle when canEdit is true', () => {
    renderComponent(true, false, false, true);
    expect(screen.getByTestId('blue-squares')).toBeInTheDocument();
    expect(screen.getByTestId('blue-switch')).toBeInTheDocument();
  });
  
  it('renders BlueSquaresTable without editable toggle when canEdit is false', () => {
    renderComponent(false, false, false, true);
    expect(screen.getByTestId('blue-squares')).toBeInTheDocument();
    expect(screen.queryByTestId('blue-switch')).not.toBeInTheDocument();
  });

  it('applies darkmode styling when darkmode is true', () => {
    const{container} = renderComponent(true, false, true,true);
    expect( container.querySelector('.user-profile-blue-square-div-header')).toHaveClass('bg-space-cadet');
  });

  it('calls handleUserProfile when toggleClass is clicked', () => {
    renderComponent(true, false, false, true);
    const toggleSwitch = screen.getByTestId('blue-switch');
    fireEvent.click(toggleSwitch);
    expect(mockHandleUserProfile).toHaveBeenCalled();
  });

  it('calls handleBlueSquare when BlueSquare button is clicked', () => {
    renderComponent(true, false);
    const blueSquareButton = screen.getAllByTestId('blueSquare')[0];
    fireEvent.click(blueSquareButton);
    expect(mockHandleBlueSquare).toHaveBeenCalled();
  });

});