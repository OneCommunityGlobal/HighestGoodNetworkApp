import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TangibleInfoModal from '../../TimeEntryForm/TangibleInfoModal';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';

describe('TangibleInfoModal Component', () => {
  const mockSetVisible = jest.fn();

  const baseProps = {
    visible: true,
    setVisible: mockSetVisible,
  };

  const initialState = {
    theme: themeMock,
  };
  const mockStore = configureStore([]);
  const store = mockStore(initialState);

  it('should render the modal when visible is true', () => {
    const { getByText } = render(
      <Provider store={store}>
        <TangibleInfoModal {...baseProps} />
      </Provider>
    );
    expect(getByText('Info')).toBeInTheDocument();
    expect(getByText(/Intangible time is time logged to items not related to your specific action items/i)).toBeInTheDocument();
  });

  it('should not render the modal when visible is false', () => {
    const { queryByText } = render(
      <Provider store={store}>
        <TangibleInfoModal {...{ ...baseProps, visible: false }} />
      </Provider>
    );
    expect(queryByText('Info')).not.toBeInTheDocument();
  });

  it('should render Close button and trigger setVisible on click', () => {
    const { getByText } = render(
      <Provider store={store}>
        <TangibleInfoModal {...baseProps} />
      </Provider>
    );
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });
});
