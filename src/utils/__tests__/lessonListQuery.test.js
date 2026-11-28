import {
  serializeLessonQuery,
  normalizeLessonResponse,
  readLessonTags,
  normalizeLessonTagCounts,
  MAX_LESSON_FILTER_TAGS,
  validateLessonFilterTags,
  readLessonTagSelection,
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
    expect(readLessonTags()).toEqual(['Safety', 'safety', ' a ']);
    localStorage.setItem('lessonListSelectedTags', '{bad');
    expect(readLessonTags()).toEqual([]);
  });
  it('limits restored selections to 20 and exposes the saved-filter migration', () => {
    localStorage.setItem(
      'lessonListSelectedTags',
      JSON.stringify(Array.from({ length: 60 }, (_, i) => `t${i}`)),
    );
    expect(readLessonTags()).toHaveLength(MAX_LESSON_FILTER_TAGS);
    expect(readLessonTagSelection().limitExceeded).toBe(true);
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

describe('twenty-tag filter boundary and exact identity', () => {
  const tags = length => Array.from({ length }, (_, index) => `Tag${index}`);
  it.each([19, 20])('serializes all %i tags as repeated parameters without truncation', length => {
    const values = tags(length);
    const params = new URLSearchParams(
      serializeLessonQuery({ tags: values, tagMatch: 'all', sort: 'likes' }),
    );
    expect(params.getAll('tags')).toEqual(values);
    expect(validateLessonFilterTags(values)).toEqual(values);
    expect(values).toHaveLength(length);
  });
  it('rejects 21 distinct tags instead of silently reducing the query', () => {
    const values = tags(21);
    expect(MAX_LESSON_FILTER_TAGS).toBe(20);
    expect(() => serializeLessonQuery({ tags: values })).toThrow('Select at most 20 filter tags.');
    expect(values).toHaveLength(21);
  });
  it.each(['Safety', null, [null], [1], ['x'.repeat(101)]])(
    'rejects malformed filter tags %j',
    value => expect(() => validateLessonFilterTags(value)).toThrow('Filter tags must be strings'),
  );
  it('deduplicates exact tags without merging distinct casing or trimming identities', () => {
    expect(
      new URLSearchParams(
        serializeLessonQuery({ tags: ['Safety', 'safety', 'Safety', ' a ', ' '] }),
      ).getAll('tags'),
    ).toEqual(['Safety', 'safety', ' a ']);
    localStorage.setItem('lessonListSelectedTags', JSON.stringify(['Safety', 'safety', 'Safety']));
    expect(readLessonTagSelection()).toEqual({ tags: ['Safety', 'safety'], limitExceeded: false });
  });
});
