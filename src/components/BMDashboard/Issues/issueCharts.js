// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { fetchIssues, fetchIssueTypesAndYears } from '../../../actions/bmdashboard/issueChartActions';

// function IssueChart() {
//   const [filters, setFilters] = useState({ issueType: '', year: '' });
//   const dispatch = useDispatch();

//   const { loading, issues, error, issueTypes, years } = useSelector(state => state.bmissuechart);

//   useEffect(() => {
//     dispatch(fetchIssues(filters));
//   }, [dispatch, filters]);

//   useEffect(() => {
//     dispatch(fetchIssueTypesAndYears());
//   }, [dispatch]);

//   const handleFilterChange = e => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const processData = () => {
//     if (!issues || issues.length === 0) return [{ issueType: 'No Data' }];

//     const groupedData = {};
//     issues.forEach(({ _id, count }) => {
//       const { issueType, issueYear } = _id;
//       if (!groupedData[issueType]) {
//         groupedData[issueType] = { issueType };
//       }
//       groupedData[issueType][issueYear] = count;
//     });

//     return Object.values(groupedData);
//   };

//   return (
//     <div className="event-container">
//       <h2 className="event-title">Issues Chart</h2>

//       <div className="chart-wrapper">
//         {/* Dropdown for Issue Type */}
//         <label>Issue Type:</label>
//         <select name="issueType" onChange={handleFilterChange} value={filters.issueType}>
//           <option value="">All</option>
//           {issueTypes &&
//             issueTypes.map(type => (
//               <option key={type} value={type}>
//                 {type}
//               </option>
//             ))}
//         </select>

//         {/* Dropdown for Year */}
//         <label>Year:</label>
//         <select name="year" onChange={handleFilterChange} value={filters.year}>
//           <option value="">All</option>
//           {years &&
//             years.map(year => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//         </select>
//       </div>

//       {/* Render based on state */}
//       {loading && <p>Loading...</p>}
//       {error && <p>Error: {error}</p>}
//       {!loading && !error && (
//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart data={processData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//             <XAxis dataKey="issueType" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             {issues.length > 0 &&
//               years &&
//               years.map((year, index) => (
//                 <Bar key={year} dataKey={year} fill={`hsl(${index * 60}, 70%, 50%)`} />
//               ))}
//           </BarChart>
//         </ResponsiveContainer>
//       )}
//     </div>
//   );
// }

// export default IssueChart;

// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { fetchIssues } from '../../../actions/bmdashboard/issueChartActions';
// import './issueChart.css';

// function IssueChart() {
//   const [filters, setFilters] = useState({ issueType: '', year: '' });
//   const dispatch = useDispatch();

//   const { loading, issues, error } = useSelector(state => state.bmissuechart);

//   useEffect(() => {
//     dispatch(fetchIssues());
//   }, [dispatch]);

//   const handleFilterChange = e => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const processData = () => {
//     if (!issues || issues.length === 0) return [{ issueType: 'No Data' }];

//     // Apply filters first if they exist
//     const filteredIssues = issues.filter(issue => {
//       const { issueType, issueYear } = issue._id;
//       const matchesIssueType = filters.issueType ? issueType === filters.issueType : true;
//       const matchesYear = filters.year ? issueYear === parseInt(filters.year, 10) : true;
//       return matchesIssueType && matchesYear;
//     });

//     const groupedData = {};

//     filteredIssues.forEach(({ _id, count }) => {
//       const { issueType, issueYear } = _id;
//       if (!groupedData[issueType]) {
//         groupedData[issueType] = { issueType };
//       }
//       // Aggregate the count for each issueType and year
//       groupedData[issueType][issueYear] = (groupedData[issueType][issueYear] || 0) + count;
//     });

//     // Add missing years and issue types with 0 count
//     const allIssueTypes = [...new Set(issues.map(issue => issue._id.issueType))];
//     const allYears = [...new Set(issues.map(issue => issue._id.issueYear))];

//     allIssueTypes.forEach(issueType => {
//       allYears.forEach(year => {
//         if (!groupedData[issueType]) {
//           groupedData[issueType] = { issueType };
//         }
//         if (!groupedData[issueType][year]) {
//           groupedData[issueType][year] = 0; // Set count to 0 if no data for the year
//         }
//       });
//     });

//     return Object.values(groupedData);
//   };

//   const extractDropdownOptions = () => {
//     const issueTypes = [...new Set(issues.map(issue => issue._id.issueType))];
//     const years = [...new Set(issues.map(issue => issue._id.issueYear))];
//     return { issueTypes, years };
//   };

//   const { issueTypes, years } = extractDropdownOptions();

//   return (
//     <div className="event-container">
//       <h2 className="event-title">Issues Chart</h2>

//       <div className="chart-wrapper">
//         {/* Dropdown for Issue Type */}
//         <label>Issue Type:</label>
//         <select name="issueType" onChange={handleFilterChange} value={filters.issueType}>
//           <option value="">All</option>
//           {issueTypes.map(type => (
//             <option key={type} value={type}>
//               {type}
//             </option>
//           ))}
//         </select>

//         {/* Dropdown for Year */}
//         <label>Year:</label>
//         <select name="year" onChange={handleFilterChange} value={filters.year}>
//           <option value="">All</option>
//           {years.map(year => (
//             <option key={year} value={year}>
//               {year}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Render based on state */}
//       {loading && <p>Loading...</p>}
//       {error && <p>Error: {error}</p>}
//       {!loading && !error && (
//         <div className="chart-wrapper">
//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart data={processData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//             <XAxis dataKey="issueType" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             {years.map((year, index) => (
//               <Bar key={year} dataKey={year} fill={`hsl(${index * 60}, 70%, 50%)`} />
//             ))}
//           </BarChart>
//         </ResponsiveContainer>
//         </div>
//       )}
//     </div>
//   );
// }

// export default IssueChart;

// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { fetchIssues } from '../../../actions/bmdashboard/issueChartActions';
// import './issueChart.css';

// function IssueChart() {
//   const [filters, setFilters] = useState({ issueType: '', year: '' });
//   const dispatch = useDispatch();

//   const { loading, issues, error } = useSelector(state => state.bmissuechart);

//   useEffect(() => {
//     dispatch(fetchIssues());
//   }, [dispatch]);

//   const handleFilterChange = e => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const processData = () => {
//     if (!issues || issues.length === 0) return [{ issueType: 'No Data' }];

//     // Apply filters first if they exist
//     const filteredIssues = issues.filter(issue => {
//       const { issueType, issueYear } = issue._id;
//       const matchesIssueType = filters.issueType ? issueType === filters.issueType : true;
//       const matchesYear = filters.year ? issueYear === parseInt(filters.year, 10) : true;
//       return matchesIssueType && matchesYear;
//     });

//     const groupedData = {};

//     filteredIssues.forEach(({ _id, count }) => {
//       const { issueType, issueYear } = _id;
//       if (!groupedData[issueType]) {
//         groupedData[issueType] = { issueType };
//       }
//       // Aggregate the count for each issueType and year
//       groupedData[issueType][issueYear] = (groupedData[issueType][issueYear] || 0) + count;
//     });

//     return Object.values(groupedData);
//   };

//   const extractDropdownOptions = () => {
//     const issueTypes = [...new Set(issues.map(issue => issue._id.issueType))];
//     const years = [...new Set(issues.map(issue => issue._id.issueYear))];
//     return { issueTypes, years };
//   };

//   const { issueTypes, years } = extractDropdownOptions();

//   return (
//     <div className="event-container">
//       <h2 className="event-title">Issues Chart</h2>

//       <div >
//         {/* Dropdown for Issue Type */}
//         <label>Issue Type:</label>
//         <select name="issueType" onChange={handleFilterChange} value={filters.issueType}>
//           <option value="">All</option>
//           {issueTypes.map(type => (
//             <option key={type} value={type}>
//               {type}
//             </option>
//           ))}
//         </select>

//         {/* Dropdown for Year */}
//         <label>Year:</label>
//         <select name="year" onChange={handleFilterChange} value={filters.year}>
//           <option value="">All</option>
//           {years.map(year => (
//             <option key={year} value={year}>
//               {year}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Render based on state */}
//       {loading && <p>Loading...</p>}
//       {error && <p>Error: {error}</p>}
//       {!loading && !error && (
//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart
//             data={processData()}
//             margin={{ top: 60, right: 30, left: 20, bottom: 5 }}
//           >
//             <XAxis dataKey="issueType" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             {/* Render bars only for the selected year */}
//             {filters.year
//               ? years
//                   .filter(year => year === parseInt(filters.year, 10)) // Only show the selected year
//                   .map((year, index) => (
//                     <Bar
//                       key={year}
//                       dataKey={year}
//                       fill={`hsl(${index * 60}, 70%, 50%)`}
//                     />
//                   ))
//               : // If no year filter is selected, show all years
//                 years.map((year, index) => (
//                   <Bar key={year} dataKey={year} fill={`hsl(${index * 60}, 70%, 50%)`} />
//                 ))}
//           </BarChart>
//         </ResponsiveContainer>
//       )}
//     </div>
//   );
// }

// export default IssueChart;

// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { fetchIssues } from '../../../actions/bmdashboard/issueChartActions';
// import './issueChart.css';

// function IssueChart() {
//   const [filters, setFilters] = useState({ issueType: '', year: '' });
//   const dispatch = useDispatch();

//   const { loading, issues, error } = useSelector(state => state.bmissuechart);

//   useEffect(() => {
//     dispatch(fetchIssues());
//   }, [dispatch]);

//   const handleFilterChange = e => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const processData = () => {
//     if (!issues || Object.keys(issues).length === 0) return [{ issueType: 'No Data' }];

//     const groupedData = {};

//     // Get all unique years from the issues data
//     const allYears = [
//       ...new Set(
//         Object.values(issues)
//           .flatMap(issueData => Object.keys(issueData))
//           .map(year => parseInt(year))
//       ),
//     ];

//     // Filter issue types based on selected filter
//     const filteredIssueTypes = filters.issueType
//       ? [filters.issueType] // If a specific issueType is selected, use only that
//       : Object.keys(issues); // Otherwise, include all issue types

//     filteredIssueTypes.forEach(issueType => {
//       if (!issues[issueType]) return;

//       const issueData = issues[issueType];
//       groupedData[issueType] = { issueType };

//       // Initialize counts for all years
//       allYears.forEach(year => {
//         groupedData[issueType][year] = 0;
//       });

//       // Update counts based on the selected year filter
//       Object.keys(issueData).forEach(year => {
//         const yearNum = parseInt(year);

//         if (!filters.year || yearNum === parseInt(filters.year)) {
//           groupedData[issueType][yearNum] = issueData[year] || 0;
//         }
//       });
//     });

//     return Object.values(groupedData);
//   };

//   const extractDropdownOptions = () => {
//     const issueTypes = [...new Set(Object.keys(issues))];
//     const years = [
//       ...new Set(
//         Object.values(issues)
//           .flatMap(issueData => Object.keys(issueData))
//           .map(year => parseInt(year))
//       ),
//     ];
//     return { issueTypes, years };
//   };

//   const { issueTypes, years } = extractDropdownOptions();

//   return (
//     <div className="event-container">
//       <h2 className="event-title">Issues Chart</h2>

//       <div>
//         {/* Dropdown for Issue Type */}
//         <label>Issue Type:</label>
//         <select name="issueType" onChange={handleFilterChange} value={filters.issueType}>
//           <option value="">All</option>
//           {issueTypes.map(type => (
//             <option key={type} value={type}>
//               {type}
//             </option>
//           ))}
//         </select>

//         {/* Dropdown for Year */}
//         <label>Year:</label>
//         <select name="year" onChange={handleFilterChange} value={filters.year}>
//           <option value="">All</option>
//           {years.map(year => (
//             <option key={year} value={year}>
//               {year}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Render based on state */}
//       {loading && <p>Loading...</p>}
//       {error && <p>Error: {error}</p>}
//       {!loading && !error && (
//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart
//             data={processData()}
//             margin={{ top: 60, right: 30, left: 20, bottom: 5 }}
//           >
//             <XAxis dataKey="issueType" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             {/* Render bars based on selected year or all years */}
//             {(filters.year ? [parseInt(filters.year, 10)] : years).map((year, index) => (
//               <Bar key={year} dataKey={year} fill={`hsl(${index * 60}, 70%, 50%)`} />
//             ))}
//           </BarChart>
//         </ResponsiveContainer>
//       )}
//     </div>
//   );
// }

// export default IssueChart;

// above perfect

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Select from 'react-select';
import { fetchIssues } from '../../../actions/bmdashboard/issueChartActions';
import './issueChart.css';

function IssueChart() {
  const dispatch = useDispatch();
  const { loading, issues, error } = useSelector(state => state.bmissuechart);

  const [filters, setFilters] = useState({ issueTypes: [], years: [] });

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  useEffect(() => {
    if (issues && Object.keys(issues).length > 0) {
      const allIssueTypes = Object.keys(issues);
      const allYears = [
        ...new Set(
          Object.values(issues)
            .flatMap(issueData => Object.keys(issueData))
            .map(year => parseInt(year, 10)),
        ),
      ].sort((a, b) => a - b);

      // Set initial filters to show all issues and years
      setFilters({ issueTypes: allIssueTypes, years: allYears });
    }
  }, [issues]);

  const extractDropdownOptions = () => {
    const issueTypes = [...new Set(Object.keys(issues))].map(issue => ({
      label: issue,
      value: issue,
    }));

    const years = [
      ...new Set(
        Object.values(issues)
          .flatMap(issueData => Object.keys(issueData))
          .map(year => parseInt(year, 10)),
      ),
    ]
      .sort((a, b) => a - b)
      .map(year => ({ label: year.toString(), value: year }));

    const addAll = options => [{ label: 'All', value: 'All' }, ...options];
    return {
      issueTypes: addAll(issueTypes),
      years: addAll(years),
    };

    // return { issueTypes, years };
  };

  const { issueTypes, years } = extractDropdownOptions();

  const generateColor = index => {
    const hue = (index * 60) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const uniqueYears = years.filter(year => year.value !== 'All').map(year => year.value);
  const yearColorMap = uniqueYears.reduce((acc, year, index) => {
    acc[year] = generateColor(year, index);
    return acc;
  }, {});

  const handleFilterChange = (selectedOptions, field) => {
    if (selectedOptions.some(option => option.value === 'All')) {
      // Handle "All" selection - Select all available values
      const allValues = field === 'issueTypes' ? Object.keys(issues) : uniqueYears;
      setFilters({
        ...filters,
        [field]: allValues,
      });
    } else {
      // Handle normal selection
      setFilters({
        ...filters,
        [field]: selectedOptions.map(option => option.value),
      });
    }
  };

  const processData = () => {
    if (!issues || Object.keys(issues).length === 0) return [{ issueType: 'No Data' }];

    if (filters.issueTypes.length === 0 && filters.years.length >= 0) {
      return [{ issueType: 'No Issues Selected' }];
    }

    const groupedData = {};
    const allYears = [...filters.years].sort((a, b) => a - b);

    const filteredIssueTypes = filters.issueTypes.length ? filters.issueTypes : Object.keys(issues);

    filteredIssueTypes.forEach(issueType => {
      if (!issues[issueType]) return;

      const issueData = issues[issueType];
      groupedData[issueType] = { issueType };

      allYears.forEach(year => {
        groupedData[issueType][year] = 0;
      });

      Object.keys(issueData).forEach(year => {
        const yearNum = parseInt(year, 10);
        if (filters.years.includes(yearNum)) {
          groupedData[issueType][yearNum] = issueData[year] || 0;
        }
      });
    });

    return Object.values(groupedData);
  };

  // Calculate the maximum value from processData for Y-axis
  const processedData = processData();

  const allYValues = processedData.flatMap(data =>
    Object.values(data).filter(val => typeof val === 'number'),
  );

  // Get unique, rounded values for Y-axis ticks
  const yTicks = [...new Set(allYValues.map(val => Math.floor(val)))].sort((a, b) => a - b);

  const sortedProcessedData = processedData.sort((a, b) => {
    const issueTypeA = a.issueType;
    const issueTypeB = b.issueType;
    return (
      issueTypes.findIndex(option => option.value === issueTypeA) -
      issueTypes.findIndex(option => option.value === issueTypeB)
    );
  });

  return (
    <div className="event-container">
      <h2 className="event-title">Issues Chart</h2>

      <div>
        {/* Multi-Select Dropdown for Issue Type */}
        <label>Issue Type:</label>
        <Select
          isMulti
          options={issueTypes}
          onChange={selectedOptions => handleFilterChange(selectedOptions, 'issueTypes')}
          value={issueTypes.filter(option => filters.issueTypes.includes(option.value))}
          placeholder="Select Issue Type(s)"
        />

        {/* Multi-Select Dropdown for Year */}
        <label>Year:</label>
        <Select
          isMulti
          options={years}
          onChange={selectedOptions => handleFilterChange(selectedOptions, 'years')}
          value={years.filter(option => filters.years.includes(option.value))}
          placeholder="Select Year(s)"
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedProcessedData} margin={{ top: 60, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="issueType" />
            <YAxis
              ticks={yTicks} // Use the unique, rounded ticks
              tickFormatter={tick => tick}
            />
            <Tooltip />
            <Legend />
            {(filters.years.length ? filters.years : uniqueYears)
              .sort((a, b) => a - b)
              .map(year => (
                <Bar key={year} dataKey={year} fill={yearColorMap[year]} />
              ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default IssueChart;
