// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import NotificationCard from '../notificationCard';
import * as actions from '../../../actions/notificationAction';

const mockStore = configureStore([thunk]);

vi.mock('../../../actions/notificationAction');

describe('NotificationCard', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});

    store.dispatch = vi.fn();
  });

  const notification = {
    _id: '123',
    message: 'This is a <a href="#">test</a> message',
    sender: { firstName: 'John', lastName: 'Doe' },
    isSystemGenerated: false,
    createdTimeStamps: '2024-06-07T12:34:56Z',
  };

  it('should render correctly', () => {
    render(
      <Provider store={store}>
        <NotificationCard notification={notification} />
      </Provider>,
    );

    expect(screen.getByText(/You have a new notification!/)).toBeInTheDocument();
    expect(
      screen.getByText((content, node) => {
        const hasText = thisnode => thisnode.textContent === 'This is a test message';
        const nodeHasText = hasText(node);
        // eslint-disable-next-line testing-library/no-node-access
        const childrenDontHaveText = Array.from(node.children).every(child => !hasText(child));
        return nodeHasText && childrenDontHaveText;
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Date: Jun-07-24/)).toBeInTheDocument();
  });

  it('should dispatch markNotificationAsRead action on button click', () => {
    const mockAction = { type: 'MARK_NOTIFICATION_AS_READ', payload: '123' };
    actions.markNotificationAsRead.mockReturnValue(mockAction);

    render(
      <Provider store={store}>
        <NotificationCard notification={notification} />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Mark as Read'));

    // // Print all dispatch calls
    // console.log(store.dispatch.mock.calls);

    expect(store.dispatch).toHaveBeenCalledWith(mockAction);
  });
});
