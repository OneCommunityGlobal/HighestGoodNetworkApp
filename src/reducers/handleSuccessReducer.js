// eslint-disable-next-line import/prefer-default-export,default-param-last
export const handleSuccessReducer = (status = null, action) => {
  if (action.type === 'REQUEST_SUCCEEDED') {
    return action.payload;
  }

  if (action.type === 'REQUEST_FAILED') {
    return action.error.response;
  }

  return status;
};
