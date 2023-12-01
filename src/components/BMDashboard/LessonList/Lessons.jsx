import { useState } from 'react';
import { formatDateAndTime } from 'utils/formatDate';
import LessonCard from './LessonCard';

const DummyData = [
  {
    id: '12',
    firstName: 'Olena',
    lastName: 'Danykh',
    userid: '651483422cdd3e63f9a745d1',
    project: 'Project 1',
    lessonTitle:
      'Stud Wall Installation: Robust framework, easy customization, and efficient insulation for durable and versatile construction.',
    lessonSummary:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
    tags: [
      'Weather',
      'Safety',
      'Construction',
      'WallInstalattion',
      'Customization',
      'Sunny',
      'StudWall',
      'Lesson',
      'Project-1',
      'BuildingTips',
      'DIYTips',
      'Renovation',
      'HomeImprovement',
      'BuildingProjects',
      'DesignIdeas',
    ],
    file: 'xxx.xls',
    date: formatDateAndTime('11/25/2020 11:35:12'),
  },
  {
    id: '13',
    firstName: 'Cailin',
    lastName: 'Colby',
    userid: '651483422cdd3e63f9a745d2',
    project: 'Project 2',
    lessonTitle: 'Concrete',
    lessonSummary: 'Foundation concreting',
    tags: ['Project 2'],
    file: 'xyz.xls',
    date: formatDateAndTime('08/31/2022 2:25:01'),
  },
  {
    id: '14',
    firstName: 'Jae',
    lastName: 'Member',
    userid: '651483422cdd3e63f9a745d5',
    project: 'Project 3',
    lessonTitle: 'Title 1',
    lessonSummary: 'Summary.....',
    tags: ['Weather'],
    file: 'abc.xls',
    date: formatDateAndTime('01/12/2023 4:05:00'),
  },
];

function Lessons() {
  const [dummyData, setDummyData] = useState(DummyData);

  const onEditLessonSummary = (lessonId, updatedSummary) => {
    // Update the DummyData in the state
    const updatedData = dummyData.map(lesson => {
      if (lesson.id === lessonId) {
        return {
          ...lesson,
          lessonSummary: updatedSummary,
        };
      }
      return lesson;
    });

    setDummyData(updatedData);
  };

  const onDeliteLessonCard = lessonId => {
    // Filter out the lesson with the specified lessonId
    const updatedData = dummyData.filter(lesson => lesson.id !== lessonId);

    // Update the state with the new data
    setDummyData(updatedData);
  };
  return (
    <LessonCard
      dummyData={dummyData}
      onEditLessonSummary={onEditLessonSummary}
      onDeliteLessonCard={onDeliteLessonCard}
    />
  );
}

export default Lessons;
