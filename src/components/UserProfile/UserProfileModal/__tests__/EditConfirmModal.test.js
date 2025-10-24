import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { userProfileMock } from '../../../../__tests__/mockStates';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import EditConfirmModal from '../EditConfirmModal';

const closeModalMock = jest.fn();
describe('UserProfileModal', () => {
  const mockStore = configureStore([]);
  const initialState = {
    theme: { darkMode: false },
  };
  const store = mockStore(initialState);

  const props = {
    modalTitle: 'Success!',
    modalMessage: '',
    userProfile: userProfileMock,
    isOpen: true,
  };
  beforeEach(() => {
    render(
      <Provider store={store}>
        <EditConfirmModal {...props} closeModal={closeModalMock} />
      </Provider>,
    );
  });

  it('should render edit confirm modal', () => {
    expect(screen.getByText(/success!/i)).toBeInTheDocument();
  });

  it('should call closeModal function once the user clicks the close buttons', async () => {
    screen.getAllByRole('button', { name: /close/i }).forEach(button => fireEvent.click(button));
    expect(closeModalMock).toHaveBeenCalled();
  });
});
