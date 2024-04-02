import MultiHorizontalBarChart from './MultiHorizontalBarChart';

export default function TasksProjectsStats() {
  const data = [
    { week: 'This Week', withTasks: 80, withoutTasks: 20 },
    { week: 'Last Week', withTasks: 70, withoutTasks: 30 },
  ];
  return (
    <div>
      TasksProjectsStats
      <MultiHorizontalBarChart data={data} />
    </div>
  );
}
