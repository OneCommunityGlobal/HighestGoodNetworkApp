import { loadAnnouncementFeed, normalizeAnnouncement } from '../announcementService';

vi.mock('../httpService', () => ({ default: {} }));

const record = id => ({
  _id: id,
  title: `Announcement ${id}`,
  body: 'Message',
  audience: 'students',
  groupId: 'group',
  user_id: 'author',
  creatorInfo: { firstName: 'Ada', lastName: 'Lovelace' },
  created_at: '2026-01-01T00:00:00Z',
});
const page = (data, totalPages) => ({ data, pagination: { totalPages } });

test.each([0, 1])('empty feed with %s pages only requests page one', async totalPages => {
  const getPage = vi.fn().mockResolvedValue(page([], totalPages));
  expect(await loadAnnouncementFeed(getPage)).toEqual([]);
  expect(getPage).toHaveBeenCalledExactlyOnceWith({ page: 1, limit: 100 });
});

test('single page preserves normalization and record order', async () => {
  const data = [record('a'), record('b')];
  const getPage = vi.fn().mockResolvedValue(page(data, 1));
  expect(await loadAnnouncementFeed(getPage)).toEqual(data.map(normalizeAnnouncement));
  expect(getPage).toHaveBeenCalledTimes(1);
});

test('waits for page one, then fetches remaining pages concurrently in page order', async () => {
  const resolvers = [];
  const getPage = vi.fn().mockImplementation(() => new Promise(resolve => resolvers.push(resolve)));
  const result = loadAnnouncementFeed(getPage);
  expect(getPage.mock.calls).toEqual([[{ page: 1, limit: 100 }]]);
  resolvers[0](page([record('a')], 3));
  await Promise.resolve();
  expect(getPage.mock.calls).toEqual([
    [{ page: 1, limit: 100 }],
    [{ page: 2, limit: 100 }],
    [{ page: 3, limit: 100 }],
  ]);
  resolvers[2](page([record('d')], 3));
  resolvers[1](page([record('b'), record('c')], 3));
  expect(await result).toEqual(['a', 'b', 'c', 'd'].map(id => normalizeAnnouncement(record(id))));
});

test.each([1, 2])('propagates the original error from page %s', async failedPage => {
  const error = new Error('Request failed');
  const getPage = vi
    .fn()
    .mockImplementation(({ page: number }) =>
      number === failedPage ? Promise.reject(error) : Promise.resolve(page([record('a')], 2)),
    );
  await expect(loadAnnouncementFeed(getPage)).rejects.toBe(error);
  expect(getPage).toHaveBeenCalledTimes(failedPage);
});
