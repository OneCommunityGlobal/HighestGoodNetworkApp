export const DATE_FILTERS = { '1': 'all', '2': 'thisYear', '3': 'thisMonth', '4': 'thisWeek' };
export const LESSON_SORTS = { '1': 'newest', '2': 'oldest', '3': 'likes', '4': 'tagFrequency' };

export function serializeLessonQuery(query = {}) {
  const params = new URLSearchParams();
  (query.tags || []).forEach(tag => {
    if (typeof tag === 'string' && tag.trim()) params.append('tags', tag);
  });
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

export function readLessonTags() {
  try {
    const saved = JSON.parse(localStorage.getItem('lessonListSelectedTags') || '[]');
    if (!Array.isArray(saved)) return [];
    const seen = new Set();
    return saved
      .filter(tag => {
        if (
          typeof tag !== 'string' ||
          !tag.trim() ||
          tag.length > 100 ||
          seen.has(tag.toLowerCase())
        )
          return false;
        seen.add(tag.toLowerCase());
        return true;
      })
      .slice(0, 50);
  } catch {
    return [];
  }
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
      Object.prototype.hasOwnProperty.call(counts, entry.tag)
    ) {
      throw new Error('Invalid tag-count response.');
    }
    counts[entry.tag] = entry.count;
    if (entry.tag.trim() && entry.tag.length <= 100) tags.push(entry.tag);
  });
  return { tags, counts };
}
