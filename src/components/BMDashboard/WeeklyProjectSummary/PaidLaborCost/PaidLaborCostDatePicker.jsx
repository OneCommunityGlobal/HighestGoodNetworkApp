import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfDay, isAfter, isBefore, isEqual } from 'date-fns';
import './PaidLaborCost.css';

function PaidLaborCostDatePicker({
  startDate,
  endDate,
  onDatesChange,
  className = '',
  minDate = null,
  maxDate = null,
  placeholder = 'Select date range',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selectionStage, setSelectionStage] = useState(startDate ? 'END_DATE' : 'START_DATE');

  // Generate days for the current month
  const generateCalendarDays = () => {
    // Default to current date if no start date is selected
    const baseDate = tempStartDate || new Date();
    const firstDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const lastDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

    // Find the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDay = firstDayOfMonth.getDay();

    const daysInMonth = lastDayOfMonth.getDate();

    // Calculate days from previous month to show
    const previousMonthDays = [];
    if (firstDay > 0) {
      const prevMonthLastDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 0).getDate();
      for (let i = firstDay - 1; i >= 0; i -= 1) {
        const day = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, prevMonthLastDay - i);
        previousMonthDays.push(day);
      }
    }

    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i += 1) {
      const day = new Date(baseDate.getFullYear(), baseDate.getMonth(), i);
      currentMonthDays.push(day);
    }

    // Next month days to fill the calendar (to have 6 rows total)
    const nextMonthDays = [];
    const totalDaysDisplayed = previousMonthDays.length + currentMonthDays.length;
    const daysNeeded = 42 - totalDaysDisplayed; // 6 rows * 7 days = 42 days total

    for (let i = 1; i <= daysNeeded; i += 1) {
      const day = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, i);
      nextMonthDays.push(day);
    }

    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Function to check if a date is within the selected range
  const isInRange = date => {
    if (!tempStartDate || !tempEndDate) {
      if (tempStartDate && hoverDate && selectionStage === 'END_DATE') {
        // When only start date is selected and user is hovering for end date
        const hoverEndDate = startOfDay(hoverDate);
        const start = startOfDay(tempStartDate);
        const current = startOfDay(date);

        return (
          (isAfter(current, start) || isEqual(current, start)) &&
          (isBefore(current, hoverEndDate) || isEqual(current, hoverEndDate))
        );
      }
      return false;
    }

    const currentDate = startOfDay(date);
    const start = startOfDay(tempStartDate);
    const end = startOfDay(tempEndDate);

    return (
      (isAfter(currentDate, start) || isEqual(currentDate, start)) &&
      (isBefore(currentDate, end) || isEqual(currentDate, end))
    );
  };

  // Function to check if a date is disabled
  const isDisabled = date => {
    const today = new Date();

    // Disable future dates (after today)
    if (isAfter(startOfDay(date), startOfDay(today))) {
      return true;
    }

    if (minDate && isBefore(date, startOfDay(minDate))) {
      return true;
    }

    if (maxDate && isAfter(date, startOfDay(maxDate))) {
      return true;
    }

    return false;
  };

  // Handle date click
  const handleDateClick = date => {
    if (isDisabled(date)) return;

    if (selectionStage === 'START_DATE') {
      setTempStartDate(date);
      setTempEndDate(null);
      setSelectionStage('END_DATE');
    } else {
      // If clicking a date before start date when selecting end date,
      // swap and make it the new start date
      if (isBefore(date, tempStartDate)) {
        setTempStartDate(date);
        setSelectionStage('END_DATE');
        return;
      }

      // Prevent selecting the same date as start and end
      if (isEqual(startOfDay(date), startOfDay(tempStartDate))) {
        return;
      }

      setTempEndDate(date);
      setSelectionStage('START_DATE');
      onDatesChange({
        startDate: tempStartDate,
        endDate: date,
      });
      setIsOpen(false);
    }
  };

  // Handle mouse enter on a date cell
  const handleDateMouseEnter = date => {
    setHoverDate(date);
  };

  // Handle mouse leave on the calendar
  const handleMouseLeave = () => {
    setHoverDate(null);
  };

  // Navigate to the previous month
  const navigateToPrevMonth = () => {
    const baseDate = tempStartDate || new Date();
    const newDate = new Date(baseDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setTempStartDate(newDate);
  };

  // Navigate to the next month
  const navigateToNextMonth = () => {
    const baseDate = tempStartDate || new Date();
    const newDate = new Date(baseDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setTempStartDate(newDate);
  };

  // Generate the calendar display
  const calendarDays = generateCalendarDays();

  // Format the date for display
  const formatDisplayDate = () => {
    if (!startDate && !endDate) return placeholder;

    if (startDate && !endDate) {
      return `${format(startDate, 'MMM d, yyyy')} - ?`;
    }

    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  // Handle clicks outside of the component
  const handleWindowClick = e => {
    // Close the calendar if clicking outside
    if (isOpen && !e.target.closest('.custom-date-range-picker')) {
      setIsOpen(false);
    }
  };

  // Add event listener for clicks outside the component
  React.useEffect(() => {
    if (isOpen) {
      window.addEventListener('click', handleWindowClick);
    }

    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, [isOpen]);

  return (
    <div className={`paid-labor-cost-custom-date-range-picker ${className}`}>
      {/* Input display */}
      <div
        className="paid-labor-cost-date-range-input"
        onClick={e => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <div className="paid-labor-cost-date-range-text">{formatDisplayDate()}</div>
        <div className="paid-labor-cost-date-range-icon">📅</div>
      </div>

      {/* Calendar dropdown */}
      {isOpen && (
        <div
          className="paid-labor-cost-date-range-calendar"
          onMouseLeave={handleMouseLeave}
          onClick={e => e.stopPropagation()}
        >
          <div className="paid-labor-cost-calendar-header">
            <button
              type="button"
              className="paid-labor-cost-month-nav paid-labor-cost-prev-month"
              onClick={navigateToPrevMonth}
            >
              &lt;
            </button>
            <div className="paid-labor-cost-current-month">
              {format(tempStartDate || new Date(), 'MMMM yyyy')}
            </div>
            <button
              type="button"
              className="paid-labor-cost-month-nav paid-labor-cost-next-month"
              onClick={navigateToNextMonth}
            >
              &gt;
            </button>
          </div>

          <div className="paid-labor-cost-calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="paid-labor-cost-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="paid-labor-cost-calendar-days">
            {calendarDays.map(date => {
              const isCurrentMonth = date.getMonth() === (tempStartDate || new Date()).getMonth();
              const isStart = tempStartDate && isEqual(startOfDay(date), startOfDay(tempStartDate));
              const isEnd = tempEndDate && isEqual(startOfDay(date), startOfDay(tempEndDate));
              const rangeClass = isInRange(date) ? 'in-range' : '';
              const disabledClass = isDisabled(date) ? 'disabled' : '';
              const isFutureDate = isAfter(startOfDay(date), startOfDay(new Date()));
              const isSameAsStart =
                tempStartDate &&
                selectionStage === 'END_DATE' &&
                isEqual(startOfDay(date), startOfDay(tempStartDate));

              return (
                <div
                  key={uuidv4()}
                  className={`
                    paid-labor-cost-day 
                    ${
                      isCurrentMonth
                        ? 'paid-labor-cost-current-month'
                        : 'paid-labor-cost-other-month'
                    } 
                    ${isStart ? 'paid-labor-cost-start-date' : ''} 
                    ${isEnd ? 'paid-labor-cost-end-date' : ''}
                    ${rangeClass}
                    ${disabledClass}
                    ${isFutureDate ? 'paid-labor-cost-future-date' : ''}
                    ${isSameAsStart ? 'paid-labor-cost-same-as-start' : ''}
                  `}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => handleDateMouseEnter(date)}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>

          <div className="paid-labor-cost-calendar-footer">
            <button
              type="button"
              className="paid-labor-cost-reset-button"
              onClick={() => {
                setTempStartDate(null);
                setTempEndDate(null);
                setSelectionStage('START_DATE');
                onDatesChange({ startDate: null, endDate: null });
                setIsOpen(false);
              }}
            >
              Reset
            </button>

            <div className="paid-labor-cost-selection-text">
              {selectionStage === 'START_DATE' ? 'Select start date' : 'Select end date'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaidLaborCostDatePicker;
