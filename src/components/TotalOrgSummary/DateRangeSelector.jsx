import { useState } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

// Get the start of the current week (Sunday)
function getStartOfWeek(date) {
  return moment(date)
    .startOf('week')
    .toDate();
}

function DateRangeSelector({ onDateRangeChange }) {
  const options = [
    { value: 'current', label: 'Current Week (default)' },
    { value: 'lastweek', label: 'Last Week' },
    { value: 'custom', label: 'Select Date Range' },
  ];
  const [selectedOption, setSelectedOption] = useState(options[0]);
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

  // Handle option change
  // const handleOptionChange = (selected) => {
  //   setSelectedOption(selected);
  // };

  const handleOptionChange = selected => {
    if (!selected) {
      // console.error('No option selected');
      return;
    }

    setSelectedOption(selected);

    if (selected.value === 'current') {
      updateDates(
        moment()
          .startOf('week')
          .format('YYYY-MM-DD'),
        moment()
          .endOf('week')
          .format('YYYY-MM-DD'),
      );
    } else if (selected.value === 'lastweek') {
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
      <Select
        id="dateRange"
        value={selectedOption}
        onChange={handleOptionChange}
        options={options}
        placeholder="Select..."
      />

      {selectedOption.value === 'custom' && (
        <div style={{ marginTop: '5px', position: 'absolute' }}>
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
