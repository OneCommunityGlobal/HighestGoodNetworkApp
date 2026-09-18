import moment from 'moment';

export const MOCK_DB = [
  {
    project: 'Project Alpha',
    task: 'Deployment',
    cost: 25000,
    budget: 22000,
    date: moment()
      .subtract(1, 'days')
      .toISOString(),
  },
  {
    project: 'Project Alpha',
    task: 'Research',
    cost: 15000,
    budget: 18000,
    date: moment()
      .subtract(3, 'days')
      .toISOString(),
  },
  {
    project: 'Project Alpha',
    task: 'Design',
    cost: 12000,
    budget: 12000,
    date: moment()
      .subtract(5, 'days')
      .toISOString(),
  },
  {
    project: 'Project Alpha',
    task: 'Deployment',
    cost: 10000,
    budget: 12000,
    date: moment()
      .subtract(12, 'days')
      .toISOString(),
  },
  {
    project: 'Project Alpha',
    task: 'Testing',
    cost: 8500,
    budget: 8000,
    date: moment()
      .subtract(18, 'days')
      .toISOString(),
  },
  {
    project: 'Project Alpha',
    task: 'Research',
    cost: 14000,
    budget: 15000,
    date: moment()
      .subtract(25, 'days')
      .toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Deployment',
    cost: 31000,
    budget: 30000,
    date: moment().toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Research',
    cost: 36000,
    budget: 32000,
    date: moment()
      .subtract(7, 'days')
      .toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Testing',
    cost: 8000,
    budget: 10000,
    date: moment()
      .subtract(10, 'days')
      .toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Design',
    cost: 22000,
    budget: 20000,
    date: moment()
      .subtract(15, 'days')
      .toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Deployment',
    cost: 18000,
    budget: 20000,
    date: moment()
      .subtract(20, 'days')
      .toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Testing',
    cost: 9000,
    budget: 7500,
    date: moment()
      .subtract(28, 'days')
      .toISOString(),
  },
  {
    project: 'Project Gamma',
    task: 'Design',
    cost: 45000,
    budget: 40000,
    date: moment()
      .subtract(2, 'days')
      .toISOString(),
  },
  {
    project: 'Project Gamma',
    task: 'Research',
    cost: 12000,
    budget: 15000,
    date: moment()
      .subtract(14, 'days')
      .toISOString(),
  },
  {
    project: 'Project Gamma',
    task: 'Deployment',
    cost: 28000,
    budget: 30000,
    date: moment()
      .subtract(22, 'days')
      .toISOString(),
  },
];
