// Viewing a lesson does not grant permission to change its tags.
export const canEditLesson = (lesson, user) => {
  if (!user?.userid) return false;
  if (['Owner', 'Administrator', 'Admin'].includes(user.role)) return true;
  const authorId = lesson.author?.id || lesson.author?._id || lesson.author;
  return Boolean(authorId) && String(authorId) === String(user.userid);
};
