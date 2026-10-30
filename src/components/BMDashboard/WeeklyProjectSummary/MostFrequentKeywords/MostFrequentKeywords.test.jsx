import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import axios from 'axios';
import MostFrequentKeywords from './MostFrequentKeywords';

vi.mock('react-redux', () => ({ useSelector: () => false }));
vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('react-select', () => ({
  default: ({ options, onChange }) => (
    <button
      type="button"
      onClick={() =>
        onChange(options.flatMap(group => group.options).find(option => option.type === 'project'))
      }
    >
      Choose project
    </button>
  ),
  components: { DropdownIndicator: () => null },
}));

describe('MostFrequentKeywords insights', () => {
  it('uses API frequencies and exports the displayed project summary', async () => {
    axios.get.mockImplementation(url =>
      Promise.resolve({
        data: url.endsWith('/projects')
          ? [{ _id: 'project-1', projectName: 'Construction A' }]
          : { data: [{ tag: 'Delay', frequency: 42 }] },
      }),
    );
    const createUrl = vi.fn(() => 'blob:summary');
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<MostFrequentKeywords />);
    expect(screen.getByText('Export summary (CSV)').disabled).toBe(true);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    fireEvent.click(screen.getByText('Choose project'));
    await screen.findByText('42');
    expect(screen.getByText('Delay')).toBeTruthy();
    expect(screen.getAllByText('Unspecified').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Export summary (CSV)'));
    expect(createUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });
});
