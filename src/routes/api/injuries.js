// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express');

const router = express.Router();
const moment = require('moment');

// Sample injury data for testing
const sampleInjuries = [
  // 2023 data
  {
    _id: '10',
    projectId: 'project1',
    projectName: 'Building 2',
    date: '2023-11-15',
    severity: 'major',
    department: 'Construction',
    count: 1,
  },
  {
    _id: '11',
    projectId: 'project1',
    projectName: 'Building 2',
    date: '2023-12-01',
    severity: 'moderate',
    department: 'Construction',
    count: 2,
  },
  {
    _id: '12',
    projectId: 'project2',
    projectName: 'Building 3',
    date: '2023-11-20',
    severity: 'minor',
    department: 'Construction',
    count: 1,
  },
  {
    _id: '13',
    projectId: 'project2',
    projectName: 'Building 3',
    date: '2023-12-10',
    severity: 'major',
    department: 'Construction',
    count: 1,
  },
  // 2024 data
  {
    _id: '1',
    projectId: 'project1',
    projectName: 'Building 2',
    date: '2024-01-15',
    severity: 'major',
    department: 'Construction',
    count: 1,
  },
  {
    _id: '2',
    projectId: 'project1',
    projectName: 'Building 2',
    date: '2024-02-01',
    severity: 'moderate',
    department: 'Construction',
    count: 2,
  },
  {
    _id: '3',
    projectId: 'project1',
    projectName: 'Building 2',
    date: '2024-03-10',
    severity: 'minor',
    department: 'Construction',
    count: 3,
  },
  {
    _id: '4',
    projectId: 'project1',
    projectName: 'Building 2',
    date: '2024-04-05',
    severity: 'major',
    department: 'Construction',
    count: 1,
  },
  {
    _id: '5',
    projectId: 'project1',
    projectName: 'Building 2',
    date: '2024-05-12',
    severity: 'minor',
    department: 'Construction',
    count: 2,
  },
  {
    _id: '6',
    projectId: 'project1',
    projectName: 'Building 2',
    date: '2024-06-20',
    severity: 'moderate',
    department: 'Construction',
    count: 1,
  },
  {
    _id: '7',
    projectId: 'project2',
    projectName: 'Building 3',
    date: '2024-01-20',
    severity: 'minor',
    department: 'Construction',
    count: 1,
  },
  {
    _id: '8',
    projectId: 'project2',
    projectName: 'Building 3',
    date: '2024-02-15',
    severity: 'major',
    department: 'Construction',
    count: 1,
  },
  {
    _id: '9',
    projectId: 'project2',
    projectName: 'Building 3',
    date: '2024-03-25',
    severity: 'moderate',
    department: 'Construction',
    count: 2,
  },
  // 2025 data for future testing
  {
    _id: '14',
    projectId: 'project1',
    projectName: 'Building 2',
    date: '2025-01-10',
    severity: 'minor',
    department: 'Construction',
    count: 1,
  },
  {
    _id: '15',
    projectId: 'project2',
    projectName: 'Building 3',
    date: '2025-02-15',
    severity: 'moderate',
    department: 'Construction',
    count: 2,
  },
];

// Helper function to aggregate injuries by month
const aggregateInjuriesByMonth = (injuries, startDate, endDate) => {
  const monthlyData = {};

  // Parse dates and ensure they are valid
  const startMoment = moment(startDate);
  const endMoment = moment(endDate);

  if (!startMoment.isValid() || !endMoment.isValid()) {
    // Fallback to default range if dates are invalid
    const defaultStart = moment()
      .subtract(6, 'months')
      .startOf('month');
    const defaultEnd = moment().endOf('month');

    // Initialize all months in the default date range
    const currentDate = defaultStart.clone();

    while (currentDate.isSameOrBefore(defaultEnd)) {
      const monthKey = currentDate.format('YYYY-MM');
      const monthLabel = currentDate.format('MMM YYYY');

      monthlyData[monthKey] = {
        month: monthLabel,
        serious: 0,
        medium: 0,
        low: 0,
      };

      currentDate.add(1, 'month');
    }
  } else {
    // Initialize all months in the specified date range
    const currentDate = startMoment.clone().startOf('month');
    const endMonth = endMoment.clone().endOf('month');

    while (currentDate.isSameOrBefore(endMonth)) {
      const monthKey = currentDate.format('YYYY-MM');
      const monthLabel = currentDate.format('MMM YYYY');

      monthlyData[monthKey] = {
        month: monthLabel,
        serious: 0,
        medium: 0,
        low: 0,
      };

      currentDate.add(1, 'month');
    }
  }

  // Aggregate injuries by month and severity
  injuries.forEach(injury => {
    const injuryDate = moment(injury.date);
    const monthKey = injuryDate.format('YYYY-MM');

    if (monthlyData[monthKey]) {
      switch (injury.severity) {
        case 'major':
          monthlyData[monthKey].serious += injury.count;
          break;
        case 'moderate':
          monthlyData[monthKey].medium += injury.count;
          break;
        case 'minor':
          monthlyData[monthKey].low += injury.count;
          break;
        default:
          break;
      }
    }
  });

  // Convert to arrays format expected by the frontend
  const months = [];
  const serious = [];
  const medium = [];
  const low = [];

  Object.keys(monthlyData)
    .sort()
    .forEach(monthKey => {
      const data = monthlyData[monthKey];
      months.push(data.month);
      serious.push(data.serious);
      medium.push(data.medium);
      low.push(data.low);
    });

  return { months, serious, medium, low };
};

// @route   GET api/injuries
// @desc    Get injuries with optional filtering
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;

    // Filter injuries based on query parameters
    let filteredInjuries = [...sampleInjuries];

    if (projectId && projectId !== 'all') {
      filteredInjuries = filteredInjuries.filter(injury => injury.projectId === projectId);
    }

    if (startDate) {
      filteredInjuries = filteredInjuries.filter(injury =>
        moment(injury.date).isSameOrAfter(moment(startDate)),
      );
    }

    if (endDate) {
      filteredInjuries = filteredInjuries.filter(injury =>
        moment(injury.date).isSameOrBefore(moment(endDate)),
      );
    }

    // Aggregate the filtered data by month
    const aggregatedData = aggregateInjuriesByMonth(
      filteredInjuries,
      startDate || '2024-01-01',
      endDate || '2024-12-31',
    );

    res.json(aggregatedData);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching injuries' });
  }
});

module.exports = router;
