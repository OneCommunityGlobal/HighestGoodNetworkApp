export const notificationsReducer = (notifications = null, action) => {
  if (action.type === 'GET_NOTIFICATIONS') {
    return action.payload;
  }

  return notifications;
};
