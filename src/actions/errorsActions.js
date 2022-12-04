/* eslint-disable import/prefer-default-export */
import { CLEAR_ERRORS } from '../constants/errors';

export const clearErrors = () => ({
  type: CLEAR_ERRORS,
});
