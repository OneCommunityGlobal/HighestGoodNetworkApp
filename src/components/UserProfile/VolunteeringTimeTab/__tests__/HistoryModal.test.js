import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import HistoryModal from '../HistoryModal';
import { themeMock } from '__tests__/mockStates';

const mockStore = configureMockStore();
const initialState = {
  theme: themeMock,
};
const store = mockStore(initialState);

describe('HistoryModal Component', () => {
  const mockToggle = jest.fn();
  const userName = 'John Doe';
  const userHistory = [
    { _id: '1', hours: 10, dateChanged: new Date(2021, 0, 1) },
    { _id: '2', hours: 8, dateChanged: new Date(2020, 5, 15) }
  ];

  test('renders modal when isOpen is true', () => {
    render(
      <Provider store={store}>
        <HistoryModal isOpen toggle={mockToggle} userName={userName} userHistory={userHistory} />
      </Provider>,
    );

    expect(screen.getByText('Past Promised Hours')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  test('does not render modal when isOpen is false', () => {
    render(
      <Provider store={store}>
        <HistoryModal
          isOpen={false}
          toggle={mockToggle}
          userName={userName}
          userHistory={userHistory}
        />
      </Provider>,
    );

    expect(screen.queryByText('Past Promised Hours')).not.toBeInTheDocument();
  });

  test('shows message when there is no user history', () => {
    render(<Provider store={store}><HistoryModal isOpen toggle={mockToggle} userName={userName} userHistory={[]} /></Provider>);

    expect(
      screen.getByText(`${userName} has never made any changes to the promised hours.`),
    ).toBeInTheDocument();
  });

  test('toggle button closes the modal', () => {
    render(
      <Provider store={store}><HistoryModal isOpen toggle={mockToggle} userName={userName} userHistory={userHistory} /></Provider>,
    );

    // Use a regular expression to match the button text more flexibly
    fireEvent.click(screen.getByText(/ok/i));
    expect(mockToggle).toHaveBeenCalled();
  });
});
