import axios from 'axios';
import { toast } from 'react-toastify';
import { vi } from 'vitest';

import { approveToolPurchase, rejectToolPurchase } from './toolActions';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('tool purchase actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  it('posts approval data and refreshes tools after success', async () => {
    const response = { status: 200, data: 'approved' };
    axios.post.mockResolvedValue(response);
    const dispatch = vi.fn();

    const result = await approveToolPurchase('purchase-1', 2)(dispatch);

    expect(result).toBe(response);
    expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.BM_UPDATE_TOOL_STATUS, {
      purchaseId: 'purchase-1',
      status: 'Approved',
      quantity: 2,
    });
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(toast.success).toHaveBeenCalledWith('Tool purchase approved.', {
      toastId: 'toolApproveSuccess',
    });
  });

  it('posts rejection data without a quantity and reports failures', async () => {
    const error = new Error('request failed');
    axios.post.mockRejectedValue(error);
    const dispatch = vi.fn();

    const result = await rejectToolPurchase('purchase-1')(dispatch);

    expect(result).toBeNull();
    expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.BM_UPDATE_TOOL_STATUS, {
      purchaseId: 'purchase-1',
      status: 'Rejected',
    });
    expect(dispatch).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Failed to reject tool purchase.', {
      toastId: 'toolRejectError',
    });
  });

  it('posts rejection data and refreshes tools after success', async () => {
    const response = { status: 200, data: 'rejected' };
    axios.post.mockResolvedValue(response);
    const dispatch = vi.fn();

    const result = await rejectToolPurchase('purchase-1')(dispatch);

    expect(result).toBe(response);
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(toast.success).toHaveBeenCalledWith('Tool purchase rejected.', {
      toastId: 'toolRejectSuccess',
    });
  });

  it('reports approval failures without refreshing tools', async () => {
    axios.post.mockRejectedValue(new Error('request failed'));
    const dispatch = vi.fn();

    const result = await approveToolPurchase('purchase-1', 2)(dispatch);

    expect(result).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Failed to approve tool purchase.', {
      toastId: 'toolApproveError',
    });
  });
});
