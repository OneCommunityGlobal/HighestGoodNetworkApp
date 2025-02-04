import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import httpService from '../../services/httpService';
import { loginUser } from '../authActions';
import { SET_CURRENT_USER, GET_ERRORS } from '../../constants/auth';
import jwtDecode from 'jwt-decode';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('jwt-decode', () => jest.fn());

jest.mock('../../services/httpService');

describe('authActions', () => {
  it('creates SET_CURRENT_USER when loginUser is successful', async () => {
    const store = mockStore({});
    const credentials = { email: 'test@example.com', password: 'password' };
    const token = 'fake-jwt-token';
    const decodedToken = { id: '123' };
    httpService.post.mockResolvedValue({ data: { token } });
    jwtDecode.mockReturnValue(decodedToken);

    const expectedActions = [
      { type: SET_CURRENT_USER, payload: decodedToken },
    ];

    await store.dispatch(loginUser(credentials));
    expect(store.getActions()).toEqual(expectedActions);
  });

});
