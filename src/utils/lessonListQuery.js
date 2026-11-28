export const MAX_LESSON_FILTER_TAGS = 20;

export const DATE_FILTERS = { '1': 'all', '2': 'thisYear', '3': 'thisMonth', '4': 'thisWeek' };
export const LESSON_SORTS = { '1': 'newest', '2': 'oldest', '3': 'likes', '4': 'tagFrequency' };

export function validateLessonFilterTags(tags = []) {
  if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string' || tag.length > 100)) {
    throw new TypeError('Filter tags must be strings of at most 100 characters.');
  }
  const selected = [...new Set(tags.filter(tag => tag.trim()))];
  if (selected.length > MAX_LESSON_FILTER_TAGS) {
    throw new RangeError(`Select at most ${MAX_LESSON_FILTER_TAGS} filter tags.`);
  }
  return selected;
}

export function serializeLessonQuery(query = {}) {
  const params = new URLSearchParams();
  validateLessonFilterTags(query.tags).forEach(tag => params.append('tags', tag));
  ['tagMatch', 'dateFilter', 'timeZone', 'sort', 'page', 'limit'].forEach(key => {
    if (query[key] !== undefined) params.set(key, String(query[key]));
  });
  return params.toString();
}

export function normalizeLessonResponse(body) {
  if (Array.isArray(body)) return { lessons: body, pagination: null };
  if (body && Array.isArray(body.data) && body.pagination) {
    return { lessons: body.data, pagination: body.pagination };
  }
  throw new Error('Invalid lesson-list response.');
}

export function readLessonTagSelection() {
  const empty = { tags: [], limitExceeded: false };
  try {
    const saved = JSON.parse(localStorage.getItem('lessonListSelectedTags') || '[]');
    if (!Array.isArray(saved)) return empty;
    const tags = [
      ...new Set(saved.filter(tag => typeof tag === 'string' && tag.trim() && tag.length <= 100)),
    ];
    return {
      tags: tags.slice(0, MAX_LESSON_FILTER_TAGS),
      limitExceeded: tags.length > MAX_LESSON_FILTER_TAGS,
    };
  } catch {
    return empty;
  }
}

export function readLessonTags() {
  return readLessonTagSelection().tags;
}

// Validate metadata independently of lesson results. Never fabricate frequencies on failure.
export function normalizeLessonTagCounts(body) {
  if (!Array.isArray(body)) throw new Error('Invalid tag-count response.');
  const counts = Object.create(null);
  const tags = [];
  body.forEach(entry => {
    if (
      !entry ||
      typeof entry.tag !== 'string' ||
      !Number.isSafeInteger(entry.count) ||
      entry.count < 0 ||
      Object.hasOwn(counts, entry.tag)
    ) {
      throw new Error('Invalid tag-count response.');
    }
    counts[entry.tag] = entry.count;
    if (entry.tag.trim() && entry.tag.length <= 100) tags.push(entry.tag);
  });
  return { tags, counts };
}
