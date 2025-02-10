import { updateBMLesson, deleteBMLesson } from 'actions/bmdashboard/lessonsAction';
import { likeLessonAction } from 'actions/bmdashboard/lessonLikesActions';
import LessonCard from './LessonCard';

function Lessons({ filteredLessons, setFilteredLessons, dispatch }) {
  const onEditLessonSummary = (lessonId, updatedSummary) => {
    const updatedData = filteredLessons.map(lesson => {
      if (lesson._id === lessonId) {
        return {
          ...lesson,
          content: updatedSummary,
        };
      }
      return lesson;
    });

    dispatch(updateBMLesson(lessonId, updatedSummary));
    setFilteredLessons(updatedData);
  };

  const onDeliteLessonCard = async lessonId => {
    try {
      await dispatch(deleteBMLesson(lessonId));

      // Update filtered lessons
      setFilteredLessons(prevLessons => prevLessons.filter(lesson => lesson._id !== lessonId));
    } catch (error) {
      // console.error('Error deleting lesson:', error);
    }
  };

  const handleLike = async (lessonId, userId) => {
    try {
      setFilteredLessons(prevLessons =>
        prevLessons.map(lesson => {
          if (lesson._id === lessonId) {
            const isLiked = lesson.likes?.includes(userId);
            return {
              ...lesson,
              totalLikes: isLiked ? lesson.totalLikes - 1 : lesson.totalLikes + 1,
              likes: isLiked
                ? lesson.likes.filter(id => id !== userId)
                : [...(lesson.likes || []), userId],
            };
          }
          return lesson;
        }),
      );
      await dispatch(likeLessonAction(lessonId, userId));
    } catch (error) {
      // console.error('Error updating like:', error);
      setFilteredLessons(Lessons);
    }
  };

  return (
    <LessonCard
      onEditLessonSummary={onEditLessonSummary}
      onDeliteLessonCard={onDeliteLessonCard}
      filteredLessons={filteredLessons}
      setFilteredLessons={setFilteredLessons}
      handleLike={handleLike}
    />
  );
}

export default Lessons;
