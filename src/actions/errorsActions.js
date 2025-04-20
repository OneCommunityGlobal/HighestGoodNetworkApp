import { CLEAR_ERRORS } from '../constants/errors';

export const clearErrors = () => {
  return {
    type: CLEAR_ERRORS,
  };
};
