const express = require('express');

const router = express.Router();
const moment = require('moment');

// Sample injury data for testing
const sampleInjuries = [
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
];

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

    res.json(filteredInjuries);
  } catch (error) {
    console.error('Error fetching injuries:', error);
    res.status(500).json({ message: 'Server error while fetching injuries' });
  }
});

module.exports = router;
