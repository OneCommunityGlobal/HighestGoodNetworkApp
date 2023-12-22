import { updateBMLesson, deleteBMLesson } from 'actions/bmdashboard/lessonsAction';
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
  return (
    <LessonCard
      onEditLessonSummary={onEditLessonSummary}
      onDeliteLessonCard={onDeliteLessonCard}
      filteredLessons={filteredLessons}
      setFilteredLessons={setFilteredLessons}
    />
  );
}

export default Lessons;
