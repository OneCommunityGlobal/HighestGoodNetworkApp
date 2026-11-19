import { describe, it, expect, vi, beforeEach } from 'vitest';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';
import { fetchEmails, resendEmail, EMAIL_OUTBOX_ACTIONS } from '../emailOutboxActions';

vi.mock('../../services/httpService', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const API = ENDPOINTS.APIEndpoint();

describe('emailOutboxActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Regression: these requests used relative /api/... URLs, which fell back to
  // localhost:4500 on production and failed with "Network Error"
  describe('outbox endpoints', () => {
    it('are built from the shared API endpoint, not relative /api paths', () => {
      const urls = [
        ENDPOINTS.EMAIL_OUTBOX,
        ENDPOINTS.EMAIL_OUTBOX_BY_ID('email1'),
        ENDPOINTS.RESEND_EMAIL,
        ENDPOINTS.RETRY_EMAIL('email1'),
        ENDPOINTS.PROCESS_PENDING_AND_STUCK_EMAILS,
      ];

      urls.forEach(url => {
        expect(url.startsWith(API)).toBe(true);
        expect(url.startsWith('/api')).toBe(false);
      });
      expect(ENDPOINTS.EMAIL_OUTBOX_BY_ID('email1')).toContain('email1');
      expect(ENDPOINTS.RETRY_EMAIL('email1')).toContain('email1');
    });
  });

  describe('fetchEmails', () => {
    it('requests ENDPOINTS.EMAIL_OUTBOX and stores the emails', async () => {
      const emails = [{ _id: 'email1', subject: 'Weekly Update' }];
      httpService.get.mockResolvedValue({ data: { success: true, data: emails } });
      const dispatch = vi.fn();

      const result = await fetchEmails()(dispatch);

      expect(httpService.get).toHaveBeenCalledWith(ENDPOINTS.EMAIL_OUTBOX);
      expect(dispatch).toHaveBeenCalledWith({ type: EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_START });
      expect(dispatch).toHaveBeenCalledWith({
        type: EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_SUCCESS,
        payload: emails,
      });
      expect(result).toEqual(emails);
    });
  });

  describe('resendEmail', () => {
    it('posts to ENDPOINTS.RESEND_EMAIL with the recipient option and requestor', async () => {
      httpService.post.mockResolvedValue({ data: { success: true, data: { emailId: 'email2' } } });
      httpService.get.mockResolvedValue({ data: { success: true, data: [] } });
      const dispatch = vi.fn(action => (typeof action === 'function' ? action(dispatch) : action));
      const getState = () => ({
        auth: { user: { userid: 'user1', email: 'admin@example.com', role: 'Owner' } },
      });

      await resendEmail('email1', 'specific', ['test@example.com'])(dispatch, getState);

      expect(httpService.post).toHaveBeenCalledWith(ENDPOINTS.RESEND_EMAIL, {
        emailId: 'email1',
        recipientOption: 'specific',
        specificRecipients: ['test@example.com'],
        requestor: { requestorId: 'user1', email: 'admin@example.com', role: 'Owner' },
      });
      // The outbox list is refreshed from the same shared endpoint
      expect(httpService.get).toHaveBeenCalledWith(ENDPOINTS.EMAIL_OUTBOX);
    });
  });
});