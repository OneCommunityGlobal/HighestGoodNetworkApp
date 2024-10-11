import { CLEAR_ERRORS } from '../constants/errors';

const clearErrors = () => {
  return {
    type: CLEAR_ERRORS,
  };
};

export default clearErrors;