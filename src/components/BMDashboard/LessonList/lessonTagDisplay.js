// Format labels only; API requests and stored tags keep their exact original values.
export const formatLessonTag = tag => `#${String(tag).replace(/^#+/, '')}`;
