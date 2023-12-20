// eslint-disable-next-line import/prefer-default-export,default-param-last
export const notificationsReducer = (notifications = null, action) => {
  if (action.type === 'GET_NOTIFICATIONS') {
    return action.payload;
  }

  return notifications;
};
