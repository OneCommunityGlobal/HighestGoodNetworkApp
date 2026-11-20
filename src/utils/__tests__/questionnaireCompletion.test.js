import { vi } from 'vitest';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../URL';
import { fetchCompletedQuestionnaireUserIds } from '../questionnaireCompletion';

vi.mock('../../services/httpService', () => ({
  default: { get: vi.fn() },
}));

describe('fetchCompletedQuestionnaireUserIds', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns the set of user ids that submitted the questionnaire', async () => {
    httpService.get.mockResolvedValue({
      data: [{ userId: 'u1' }, { userId: 'u2' }, { userId: null }, {}],
    });

    const result = await fetchCompletedQuestionnaireUserIds();

    expect(httpService.get).toHaveBeenCalledWith(ENDPOINTS.HGN_FORM_RANKED);
    expect([...result]).toEqual(['u1', 'u2']);
  });

  it('returns an empty set when the response is not an array', async () => {
    httpService.get.mockResolvedValue({ data: { error: 'x' } });
    const result = await fetchCompletedQuestionnaireUserIds();
    expect(result.size).toBe(0);
  });
});
