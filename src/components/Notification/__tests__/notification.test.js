import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import NotificationCard from '../NotificationCard';
import * as actions from '../../../actions/notificationAction';

const mockStore = configureStore([thunk]);

jest.mock('../../../actions/notificationAction');

describe('NotificationCard', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});

    store.dispatch = jest.fn();
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

    expect(screen.getByText(/You have a new notification from John Doe!/)).toBeInTheDocument();
    expect(
      screen.getByText((content, node) => {
        const hasText = node => node.textContent === 'This is a test message';
        const nodeHasText = hasText(node);
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

    // 打印出 dispatch 的所有调用
    console.log(store.dispatch.mock.calls);

    expect(store.dispatch).toHaveBeenCalledWith(mockAction);
  });
});
