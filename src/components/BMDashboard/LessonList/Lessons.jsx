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

  const onDeliteLessonCard = lessonId => {
    dispatch(deleteBMLesson(lessonId));
  };

  const handleLike = async (lessonId, userId) => {
    await dispatch(likeLessonAction(lessonId, userId));
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
