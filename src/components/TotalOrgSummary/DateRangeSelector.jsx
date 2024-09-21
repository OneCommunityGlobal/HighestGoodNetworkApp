import { useState } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment'; // For date manipulation
import 'react-datepicker/dist/react-datepicker.css';

// Get the start of the current week (Sunday)
function getStartOfWeek(date) {
  return moment(date)
    .startOf('week')
    .toDate();
}

// Get the start and end of last week (Sunday to Saturday)
// function getLastWeekRange() {
//   const startOfCurrentWeek = getStartOfWeek(new Date());
//   const startOfLastWeek = moment(startOfCurrentWeek)
//     .subtract(7, 'days')
//     .toDate();
//   const endOfLastWeek = moment(startOfLastWeek)
//     .add(6, 'days')
//     .toDate();
//   return { startDate: startOfLastWeek, endDate: endOfLastWeek };
// }
// filteredData
function DateRangeSelector({ onDateRangeChange }) {
  const [selectedOption, setSelectedOption] = useState('Current Week');
  const [startDate, setStartDate] = useState(getStartOfWeek(new Date()));
  const [endDate, setEndDate] = useState(
    moment()
      .endOf('day')
      .toDate(),
  );

  const updateDates = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange({ startDate: start, endDate: end });
  };

  // Handle option change (Current Week, Last Week, Custom)
  const handleOptionChange = ({ target: { value } }) => {
    setSelectedOption(value);

    // if (value === 'Current Week') {
    //   // start date: last sunday
    //   // end date: last sunday + 6days
    //   updateDates(
    //     getStartOfWeek(new Date()),
    //     moment()
    //       .endOf('day')
    //       .toDate(),
    //   );
    // } else if (value === 'Last Week') {
    //   // start date: last to last sunday
    //   // end date: last to last sunday + 6days
    //   const { startLastWeek, endLastWeek } = getLastWeekRange();
    //   updateDates(startLastWeek, endLastWeek);
    // } else {
    //   updateDates(null, null);
    // }

    if (value === 'Current Week') {
      updateDates(
        moment()
          .startOf('week')
          .format('YYYY-MM-DD'),
        moment()
          .endOf('week')
          .format('YYYY-MM-DD'),
      );
    } else if (value === 'Last Week') {
      const startLastWeek = moment()
        .subtract(1, 'week')
        .startOf('week')
        .format('YYYY-MM-DD');
      const endLastWeek = moment()
        .subtract(1, 'week')
        .endOf('week')
        .format('YYYY-MM-DD');
      updateDates(startLastWeek, endLastWeek);
    } else {
      updateDates(null, null);
    }
  };

  // Update date range when date picker changes
  const handleDateChange = dates => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) onDateRangeChange({ startDate: start, endDate: end });
  };

  return (
    <div>
      <select id="dateRange" value={selectedOption} onChange={handleOptionChange}>
        <option value="Current Week">Current Week (default)</option>
        <option value="Last Week">Last Week</option>
        <option value="Select Date Range">Select Date Range</option>
      </select>

      {selectedOption === 'Select Date Range' && (
        <div style={{ marginTop: '10px' }}>
          <label>Date Range: </label>
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            dateFormat="MM/dd/yyyy"
            isClearable
          />
        </div>
      )}
    </div>
  );
}

export default DateRangeSelector;
