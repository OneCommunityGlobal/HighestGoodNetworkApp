import { act, render, screen } from '@testing-library/react';
import useAppUpdateCheck, { VERSION_URL } from '../useAppUpdateCheck';

const respondWith = buildId =>
  vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ buildId }) });

function Probe(props) {
  const { updateAvailable, latestBuildId } = useAppUpdateCheck(props);
  return (
    <div
      data-testid="probe"
      data-update={String(updateAvailable)}
      data-latest={latestBuildId ?? ''}
    />
  );
}

const expectProbe = ({ update, latest }) => {
  const probe = screen.getByTestId('probe');
  expect(probe).toHaveAttribute('data-update', update);
  if (latest !== undefined) expect(probe).toHaveAttribute('data-latest', latest);
};

// Let pending promises (fetch, json) settle inside act.
const flush = () => act(() => Promise.resolve());

describe('useAppUpdateCheck', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not check on mount', () => {
    const fetchImpl = respondWith('new');
    render(<Probe currentBuildId="old" fetchImpl={fetchImpl} />);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('reports an update found on the background interval', async () => {
    const fetchImpl = respondWith('new');
    render(<Probe currentBuildId="old" fetchImpl={fetchImpl} intervalMs={1000} />);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flush();

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toMatch(new RegExp(`^${VERSION_URL}\\?t=\\d+$`));
    expect(fetchImpl.mock.calls[0][1]).toEqual({ cache: 'no-store' });
    expectProbe({ update: 'true', latest: 'new' });
  });

  it('checks when the window regains focus', async () => {
    const fetchImpl = respondWith('new');
    render(<Probe currentBuildId="old" fetchImpl={fetchImpl} />);

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    await flush();

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expectProbe({ update: 'true' });
  });

  it('reports no update when the build IDs match', async () => {
    const fetchImpl = respondWith('same');
    render(<Probe currentBuildId="same" fetchImpl={fetchImpl} />);

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    await flush();

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expectProbe({ update: 'false', latest: '' });
  });

  it('stops checking once an update has been found', async () => {
    const fetchImpl = respondWith('new');
    render(<Probe currentBuildId="old" fetchImpl={fetchImpl} intervalMs={1000} />);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flush();
    await act(async () => {
      vi.advanceTimersByTime(5000);
      window.dispatchEvent(new Event('focus'));
    });
    await flush();

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does nothing without a current build ID (dev server and tests)', async () => {
    const fetchImpl = respondWith('new');
    render(<Probe currentBuildId="" fetchImpl={fetchImpl} intervalMs={1000} />);

    await act(async () => {
      vi.advanceTimersByTime(5000);
      window.dispatchEvent(new Event('focus'));
    });

    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('ignores failed requests and bad responses', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.reject(new Error('bad json')) });
    render(<Probe currentBuildId="old" fetchImpl={fetchImpl} />);

    for (let i = 0; i < 3; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        window.dispatchEvent(new Event('focus'));
      });
      // eslint-disable-next-line no-await-in-loop
      await flush();
    }

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expectProbe({ update: 'false' });
  });

  it('skips checks while the tab is hidden', async () => {
    const fetchImpl = respondWith('new');
    const spy = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    render(<Probe currentBuildId="old" fetchImpl={fetchImpl} intervalMs={1000} />);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(fetchImpl).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
