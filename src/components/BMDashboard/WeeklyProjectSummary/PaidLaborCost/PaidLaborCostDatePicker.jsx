import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Info } from 'lucide-react';
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
  const [showInfo, setShowInfo] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selectionStage, setSelectionStage] = useState(startDate ? 'END_DATE' : 'START_DATE');

  // Generate calendar days
  const generateCalendarDays = () => {
    const baseDate = tempStartDate || new Date();
    const firstDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const lastDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

    const firstDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const previousMonthDays = [];
    if (firstDay > 0) {
      const prevLast = new Date(baseDate.getFullYear(), baseDate.getMonth(), 0).getDate();
      for (let i = firstDay - 1; i >= 0; i -= 1) {
        previousMonthDays.push(
          new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, prevLast - i),
        );
      }
    }

    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i += 1) {
      currentMonthDays.push(new Date(baseDate.getFullYear(), baseDate.getMonth(), i));
    }

    const totalDays = previousMonthDays.length + currentMonthDays.length;
    const nextMonthDays = [];
    for (let i = 1; i <= 42 - totalDays; i += 1) {
      nextMonthDays.push(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, i));
    }

    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Check if date in range
  const isInRange = date => {
    if (!tempStartDate || !tempEndDate) {
      if (tempStartDate && hoverDate && selectionStage === 'END_DATE') {
        const start = startOfDay(tempStartDate);
        const hoverEnd = startOfDay(hoverDate);
        const current = startOfDay(date);
        return (
          (isAfter(current, start) || isEqual(current, start)) &&
          (isBefore(current, hoverEnd) || isEqual(current, hoverEnd))
        );
      }
      return false;
    }
    const start = startOfDay(tempStartDate);
    const end = startOfDay(tempEndDate);
    const current = startOfDay(date);
    return (
      (isAfter(current, start) || isEqual(current, start)) &&
      (isBefore(current, end) || isEqual(current, end))
    );
  };

  // Check if date disabled
  const isDisabled = date => {
    const today = startOfDay(new Date());
    const d = startOfDay(date);
    if (isAfter(d, today)) return true;
    if (minDate && isBefore(d, startOfDay(minDate))) return true;
    if (maxDate && isAfter(d, startOfDay(maxDate))) return true;
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
      if (isBefore(date, tempStartDate)) {
        setTempStartDate(date);
        return;
      }
      if (isEqual(startOfDay(date), startOfDay(tempStartDate))) return;
      setTempEndDate(date);
      setSelectionStage('START_DATE');
      onDatesChange({ startDate: tempStartDate, endDate: date });
      setIsOpen(false);
    }
  };

  const handleDateMouseEnter = date => setHoverDate(date);
  const handleMouseLeave = () => setHoverDate(null);
  const navigateToPrevMonth = () => {
    const base = tempStartDate || new Date();
    const prev = new Date(base);
    prev.setMonth(prev.getMonth() - 1);
    setTempStartDate(prev);
  };
  const navigateToNextMonth = () => {
    const base = tempStartDate || new Date();
    const next = new Date(base);
    next.setMonth(next.getMonth() + 1);
    setTempStartDate(next);
  };

  const calendarDays = generateCalendarDays();

  // Format display
  const formatDisplayDate = () => {
    if (!startDate && !endDate) return placeholder;
    if (startDate && !endDate) return `${format(startDate, 'MMM d, yyyy')} - ?`;
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  // Outside click
  const handleWindowClick = e => {
    if (isOpen && !e.target.closest('.paid-labor-cost-custom-date-range-picker')) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    if (isOpen) window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, [isOpen]);

  return (
    <div className={`paid-labor-cost-custom-date-range-picker ${className}`}>
      <div className="paid-labor-cost-input-wrapper">
        {/* Date input */}
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

        {/* Info icon + tooltip on hover only */}
        <div
          className="paid-labor-cost-info-wrapper"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <button
            type="button"
            className="paid-labor-cost-info-button"
            aria-label="Date picker info"
          >
            <Info size={16} />
          </button>
          {showInfo && (
            <div className="paid-labor-cost-info-tooltip">
              <p>
                <strong>Date Range Picker</strong>
              </p>
              <ul>
                <li>Click the calendar or input to open the picker.</li>
                <li>Select a start date, then an end date.</li>
                <li>Disabled dates cannot be selected.</li>
                <li>Click Reset to clear your selection.</li>
              </ul>
            </div>
          )}
        </div>
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
