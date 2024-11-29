import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import ModalExample from './Modal';

const mockStore = configureStore([]);
const initialState = {
  theme: { darkMode: false },
};
const store = mockStore(initialState);

describe('ModalExample Component', () => {
  it('renders when isOpen is true', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ModalExample isOpen modalTitle="Test Modal" />
      </Provider>,
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    const closeModalMock = jest.fn();
    render(
      <Provider store={store}>
        <ModalExample isOpen closeModal={closeModalMock} modalTitle="Test Modal" />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Close'));
    expect(closeModalMock).toHaveBeenCalledTimes(1);
  });

  it('displays input fields when type is input', () => {
    render(
      <Provider store={store}>
        <ModalExample isOpen type="input" />
      </Provider>,
    );

    expect(screen.getByPlaceholderText('Name of the link')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('URL of the link')).toBeInTheDocument();
  });

  it('updates state when input fields are typed into', () => {
    render(
      <Provider store={store}>
        <ModalExample isOpen type="input" />
      </Provider>,
    );

    fireEvent.change(screen.getByPlaceholderText('Name of the link'), {
      target: { value: 'Test Link Name' },
    });
    fireEvent.change(screen.getByPlaceholderText('URL of the link'), {
      target: { value: 'https://testurl.com' },
    });
    expect(screen.getByPlaceholderText('Name of the link')).toHaveValue('Test Link Name');
    expect(screen.getByPlaceholderText('URL of the link')).toHaveValue('https://testurl.com');
  });

  it('disables confirm button when input fields are empty', () => {
    render(
      <Provider store={store}>
        <ModalExample isOpen type="input" />
      </Provider>,
    );

    expect(screen.getByText('Add')).toBeDisabled();
  });

  it('calls setInactiveModal when "Set inactive" button is clicked', () => {
    const setInactiveModalMock = jest.fn();
    render(
      <Provider store={store}>
        <ModalExample
          isOpen
          closeModal={() => {}}
          setInactiveModal={setInactiveModalMock}
          modalTitle="Test Modal"
        />
      </Provider>,
    );

    fireEvent.click(screen.getByText(/set inactive/i));
    expect(setInactiveModalMock).toHaveBeenCalled();
  });

  it('calls confirmModal when confirm button is clicked', () => {
    const confirmModalMock = jest.fn();
    render(
      <Provider store={store}>
        <ModalExample
          isOpen
          type="input"
          confirmModal={confirmModalMock}
          linkType="Test Link Type"
        />
      </Provider>,
    );

    fireEvent.change(screen.getByPlaceholderText('Name of the link'), {
      target: { value: 'Test Link Name' },
    });
    fireEvent.change(screen.getByPlaceholderText('URL of the link'), {
      target: { value: 'https://testurl.com' },
    });
    fireEvent.click(screen.getByText('Add'));
    expect(confirmModalMock).toHaveBeenCalledWith(
      'Test Link Name',
      'https://testurl.com',
      'Test Link Type',
    );
  });
});
