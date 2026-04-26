
import { clearErrors } from '../errorsActions';
import { CLEAR_ERRORS } from '../../constants/errors';

describe('clearErrors action creator', () => {
  it('should create an action to clear errors', () => {
    const expectedAction = {
      type: CLEAR_ERRORS,
    };

   
    const action = clearErrors();

   
    expect(action).toEqual(expectedAction);
  });
});
