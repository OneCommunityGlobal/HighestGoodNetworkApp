import { CLEAR_ERRORS } from '../constants/errors';

// eslint-disable-next-line import/prefer-default-export
export const clearErrors = () => {
  return {
    type: CLEAR_ERRORS,
  };
};
