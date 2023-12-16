// eslint-disable-next-line import/prefer-default-export,default-param-last
export const actionItemsReducer = (actionItems = null, action) => {
  if (action.type === 'GET_ACTION_ITEMS') {
    return action.payload;
  }

  return actionItems;
};
