import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getQuestionnaireStatus } from '../services/questionnaireService';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');

describe('getQuestionnaireStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the questionnaire status API with the requested user ID', async () => {
    const viewedUserId = 'user456';

    axios.get.mockResolvedValue({
      data: { completed: false },
    });

    const result = await getQuestionnaireStatus(viewedUserId);

    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.QUESTIONNAIRE_STATUS, {
      params: { userId: viewedUserId },
    });

    expect(result).toEqual({ completed: false });
  });
});
