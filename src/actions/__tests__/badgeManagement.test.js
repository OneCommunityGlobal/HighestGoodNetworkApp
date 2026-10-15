import axios from 'axios';
import { changeBadgesByUserID } from '../badgeManagement';
import { ENDPOINTS } from '~/utils/URL';
import { GET_MESSAGE, CLOSE_ALERT } from '~/constants/badge';

describe('changeBadgesByUserID save contract', () => {
  test('sends badge IDs and resolves true while preserving success alerts', async () => {
    const dispatch = vi.fn(action => (typeof action === 'function' ? action(dispatch) : action));
    const badges = [{ badge: 'badge-id', featured: true, count: 1 }];
    axios.put.mockResolvedValueOnce({ status: 200 });
    await expect(changeBadgesByUserID('user-id', badges)(dispatch)).resolves.toBe(true);
    expect(axios.put).toHaveBeenCalledWith(ENDPOINTS.BADGE_ASSIGN('user-id'), {
      badgeCollection: badges,
      newBadges: 0,
    });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: GET_MESSAGE, color: 'success' }),
    );
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: CLOSE_ALERT }));
  });

  test('resolves false on a rejected save while preserving failure alerts', async () => {
    const dispatch = vi.fn(action => (typeof action === 'function' ? action(dispatch) : action));
    axios.put.mockRejectedValueOnce(new Error('Save failed'));
    await expect(changeBadgesByUserID('user-id', [])(dispatch)).resolves.toBe(false);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: GET_MESSAGE, color: 'danger' }),
    );
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: CLOSE_ALERT }));
  });
});
