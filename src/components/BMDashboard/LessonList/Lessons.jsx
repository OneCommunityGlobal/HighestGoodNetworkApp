import { formatDateAndTime } from 'utils/formatDate';
import LessonCard from './LessonCard';

const DummyData = [
  {
    id: '12',
    firstName: 'Olena',
    lastName: 'Danykh',
    project: 'Project 1',
    lessonTitle: 'XYZ',
    lessonSummary: 'Stud wall construction',
    tags: ['Weather', 'Project1'],
    file: 'xxx.xls',
    date: formatDateAndTime('11/25/2020 11:35:12'),
  },
  {
    id: '13',
    firstName: 'Cailin',
    lastName: 'Colby',
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
    project: 'Project 3',
    lessonTitle: 'Title 1',
    lessonSummary: 'Summary.....',
    tags: ['Weather'],
    file: 'abc.xls',
    date: formatDateAndTime('01/12/2023 4:05:00'),
  },
];

function Lessons() {
  return <LessonCard dummyData={DummyData} />;
}

export default Lessons;
