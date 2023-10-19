// eslint-disable-next-line default-param-last,import/prefer-default-export
export const actionItemsReducer = (actionItems = null, action) => {
  if (action.type === 'GET_ACTION_ITEMS') {
    return action.payload;
  }

  return actionItems;
};
