import { updateBMLesson, deleteBMLesson } from '~/actions/bmdashboard/lessonsAction';
import { likeLessonAction } from '~/actions/bmdashboard/lessonLikesActions';
import LessonCard from './LessonCard';

function Lessons({ filteredLessons, dispatch }) {
  const onEditLessonSummary = (lessonId, updatedSummary) =>
    dispatch(updateBMLesson(lessonId, updatedSummary));

  const onDeliteLessonCard = async lessonId => {
    try {
      await dispatch(deleteBMLesson(lessonId));
    } catch {
      /* The action reports failure and leaves the current results intact. */
    }
  };

  const handleLike = async (lessonId, userId) => {
    try {
      await dispatch(likeLessonAction(lessonId, userId));
    } catch (error) {
      // console.error('Error updating like:', error);
    }
  };

  return (
    <LessonCard
      onEditLessonSummary={onEditLessonSummary}
      onDeliteLessonCard={onDeliteLessonCard}
      filteredLessons={filteredLessons}
      handleLike={handleLike}
    />
  );
}

export default Lessons;
