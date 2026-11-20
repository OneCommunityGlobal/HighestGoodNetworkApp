import { render, screen } from '@testing-library/react';
import axios from 'axios';
import { vi } from 'vitest';
import MaterialUsageChart from '../MaterialUsageChart';

vi.mock('axios');

describe('MaterialUsageChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a message and skips the request when the material has no project', () => {
    render(<MaterialUsageChart projectId={null} toggle={vi.fn()} />);

    expect(screen.getByText('No usage record available.')).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('shows the empty message when the project has no usage data', async () => {
    axios.get.mockResolvedValue({
      data: { availableMaterials: 0, usedMaterials: 0, wastedMaterials: 0 },
    });

    render(<MaterialUsageChart projectId="507f1f77bcf86cd799439011" toggle={vi.fn()} />);

    expect(await screen.findByText('No usage record available.')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/507f1f77bcf86cd799439011'),
      expect.anything(),
    );
  });
});
