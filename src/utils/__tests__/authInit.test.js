import { vi } from 'vitest';
import initAuth from '../authInit';
import jwtDecode from 'jwt-decode';
import httpService from '../../services/httpService';
import { store } from '../../store';
import { logoutUser, setCurrentUser } from '../../actions/authActions';
import config from '../../config.json';

vi.mock('jwt-decode');
vi.mock('../../services/httpService', () => ({ default: { setjwt: vi.fn() } }));
vi.mock('../../store', () => ({ __esModule: true, store: { dispatch: vi.fn() } }));
vi.mock('../../actions/authActions', () => ({
    __esModule: true,
    logoutUser: vi.fn(() => ({ type: 'LOGOUT_USER' })),
    setCurrentUser: vi.fn(u => ({ type: 'SET_CURRENT_USER', payload: u })),
}));

describe('initAuth()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('logs out expired token', () => {
        jwtDecode.mockReturnValue({ expiryTimestamp: Date.now() - 10_000 });
        localStorage.setItem(config.tokenKey, 'expiredToken');

        initAuth();

        expect(store.dispatch).toHaveBeenCalledWith(logoutUser());
        expect(httpService.setjwt).not.toHaveBeenCalled();
    });

    it('sets user when token is valid', () => {
        const futureMs = Date.now() + 5 * 86400 * 1000;
        const payload = { expiryTimestamp: futureMs, user: 'foo' };
        jwtDecode.mockReturnValue(payload);
        localStorage.setItem(config.tokenKey, 'validToken');

        initAuth();

        expect(httpService.setjwt).toHaveBeenCalledWith('validToken');
        expect(store.dispatch).toHaveBeenCalledWith(setCurrentUser(payload));
    });

    it('does nothing if no token in storage', () => {
        initAuth();
        expect(store.dispatch).not.toHaveBeenCalled();
        expect(httpService.setjwt).not.toHaveBeenCalled();
    });
});