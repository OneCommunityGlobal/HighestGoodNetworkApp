// eslint-disable-next-line default-param-last
export const handleSuccessReducer = (status = null, action) => {
  if (action.type === 'REQUEST_SUCCEEDED') {
    return action.payload;
  }

  if (action.type === 'REQUEST_FAILED') {
    return action.error.response;
  }

  return status;
};

export default handleSuccessReducer;
