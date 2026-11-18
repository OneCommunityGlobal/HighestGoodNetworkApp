import {
  serializeLessonQuery,
  normalizeLessonResponse,
  readLessonTags,
  normalizeLessonTagCounts,
} from '../lessonListQuery';
beforeEach(() => localStorage.clear());
describe('lesson query contract', () => {
  it('preserves no-argument requests', () => expect(serializeLessonQuery()).toBe(''));
  it('serializes repeated literal tags, timezone, combined filters, and pagination', () => {
    const params = new URLSearchParams(
      serializeLessonQuery({
        tags: ['A&B', 'x/y', 'Tag With Spaces', ' '],
        tagMatch: 'any',
        dateFilter: 'thisWeek',
        timeZone: 'America/Los_Angeles',
        sort: 'tagFrequency',
        page: 2,
        limit: 25,
      }),
    );
    expect(params.getAll('tags')).toEqual(['A&B', 'x/y', 'Tag With Spaces']);
    expect(Object.fromEntries([...params].filter(([key]) => key !== 'tags'))).toEqual({
      tagMatch: 'any',
      dateFilter: 'thisWeek',
      timeZone: 'America/Los_Angeles',
      sort: 'tagFrequency',
      page: '2',
      limit: '25',
    });
  });
  it('does not send invented/custom query parameters', () =>
    expect(serializeLessonQuery({ startDate: '2026-01-01', unknown: 'x' })).toBe(''));
  it('accepts legacy arrays and paginated envelopes', () => {
    expect(normalizeLessonResponse([{ _id: '1' }])).toEqual({
      lessons: [{ _id: '1' }],
      pagination: null,
    });
    const pagination = { page: 2, limit: 25, total: 101, totalPages: 5, hasNextPage: true };
    expect(normalizeLessonResponse({ data: [], pagination })).toEqual({ lessons: [], pagination });
  });
  it.each([null, {}, { data: [] }, 'bad'])('rejects malformed response %j', body =>
    expect(() => normalizeLessonResponse(body)).toThrow(),
  );
  it('sanitizes malformed saved tags and duplicates without changing canonical spelling', () => {
    localStorage.setItem(
      'lessonListSelectedTags',
      JSON.stringify(['Safety', 'safety', null, '', ' ', ' a ', 'x'.repeat(101)]),
    );
    expect(readLessonTags()).toEqual(['Safety', ' a ']);
    localStorage.setItem('lessonListSelectedTags', '{bad');
    expect(readLessonTags()).toEqual([]);
  });
  it('limits restored selections to 50', () => {
    localStorage.setItem(
      'lessonListSelectedTags',
      JSON.stringify(Array.from({ length: 60 }, (_, i) => `t${i}`)),
    );
    expect(readLessonTags()).toHaveLength(50);
  });
});

describe('global tag-count contract', () => {
  it('keeps exact tag identity, occurrence counts and server tie ordering', () => {
    const metadata = normalizeLessonTagCounts([
      { tag: 'Safety', count: 42 },
      { tag: 'safety', count: 3 },
      { tag: ' a ', count: 1 },
      { tag: '__proto__', count: 1 },
    ]);
    expect(metadata.tags).toEqual(['Safety', 'safety', ' a ', '__proto__']);
    expect(metadata.counts.Safety).toBe(42);
    expect(metadata.counts.safety).toBe(3);
    expect(metadata.counts.__proto__).toBe(1);
  });
  it('accepts an empty collection and does not suggest blank or unsupported-length tags', () => {
    expect(normalizeLessonTagCounts([]).tags).toEqual([]);
    expect(
      normalizeLessonTagCounts([
        { tag: '', count: 2 },
        { tag: ' ', count: 1 },
        { tag: 'x'.repeat(101), count: 1 },
      ]).tags,
    ).toEqual([]);
  });
  it.each([
    null,
    {},
    [{ tag: 'x', count: '1' }],
    [{ tag: 'x', count: -1 }],
    [{ tag: null, count: 1 }],
    [{ tag: 'x', count: 1.5 }],
    [
      { tag: 'x', count: 1 },
      { tag: 'x', count: 2 },
    ],
  ])('rejects malformed global counts %j', body =>
    expect(() => normalizeLessonTagCounts(body)).toThrow('Invalid tag-count response.'),
  );
});
