import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Info } from 'lucide-react';
import { format, startOfDay, isAfter, isBefore, isEqual } from 'date-fns';
import styles from './PaidLaborCost.module.css';

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

  // *** SELECTION STATE ***
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selectionStage, setSelectionStage] = useState(
    startDate && !endDate ? 'END_DATE' : 'START_DATE',
  );

  // *** CALENDAR VIEW STATE ***
  const [calendarMonth, setCalendarMonth] = useState(startDate || new Date());

  // Reset temps & calendar whenever picker opens or props change
  useEffect(() => {
    if (isOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setSelectionStage(startDate && !endDate ? 'END_DATE' : 'START_DATE');
      setCalendarMonth(startDate || new Date());
    }
  }, [isOpen, startDate, endDate]);

  // Generate a 6×7 grid for the current calendarMonth
  const generateCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastOfMonth.getDate();

    const prevDays = [];
    const lead = firstOfMonth.getDay();
    if (lead > 0) {
      const prevLast = new Date(year, month, 0).getDate();
      for (let i = lead - 1; i >= 0; i -= 1) {
        prevDays.push(new Date(year, month - 1, prevLast - i));
      }
    }

    const currDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    const total = prevDays.length + currDays.length;
    const nextDays = [];
    for (let i = 1; i <= 42 - total; i += 1) {
      nextDays.push(new Date(year, month + 1, i));
    }

    return [...prevDays, ...currDays, ...nextDays];
  };

  // Range‐highlight logic
  const [hoverDate, setHoverDate] = useState(null);
  const isInRange = date => {
    const curr = startOfDay(date);
    // preview range while choosing end date
    if (tempStartDate && !tempEndDate && selectionStage === 'END_DATE' && hoverDate) {
      const s = startOfDay(tempStartDate);
      const e = startOfDay(hoverDate);
      return (isAfter(curr, s) || isEqual(curr, s)) && (isBefore(curr, e) || isEqual(curr, e));
    }
    if (tempStartDate && tempEndDate) {
      const s = startOfDay(tempStartDate);
      const e = startOfDay(tempEndDate);
      return (isAfter(curr, s) || isEqual(curr, s)) && (isBefore(curr, e) || isEqual(curr, e));
    }
    return false;
  };

  // Disabled‐date logic
  const isDisabled = date => {
    const today = startOfDay(new Date());
    const d = startOfDay(date);
    if (isAfter(d, today)) return true;
    if (minDate && isBefore(d, startOfDay(minDate))) return true;
    if (maxDate && isAfter(d, startOfDay(maxDate))) return true;
    return false;
  };

  // Click a date cell
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

  // Hover handlers
  const handleMouseEnter = date => setHoverDate(date);
  const handleMouseLeave = () => setHoverDate(null);

  // Month navigation
  const prevMonth = () =>
    setCalendarMonth(m => {
      const d = new Date(m);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  const nextMonth = () =>
    setCalendarMonth(m => {
      const d = new Date(m);
      d.setMonth(d.getMonth() + 1);
      return d;
    });

  const calendarDays = generateCalendarDays();

  // Display text
  const formatDisplayDate = () => {
    if (!startDate && !endDate) return placeholder;
    if (startDate && !endDate) return `${format(startDate, 'MMM d, yyyy')} - ?`;
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  // Outside‐click to close
  const wrapperRef = useRef();
  useEffect(() => {
    const onClick = e => {
      if (isOpen && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={`${styles.paidLaborCostCustomDateRangePicker} ${className}`}>
      {/* Input + Info */}
      <div className={styles.paidLaborCostInputWrapper}>
        <button
          type="button"
          className={styles.paidLaborCostDateRangeInput}
          onClick={e => {
            e.stopPropagation();
            setIsOpen(o => !o);
          }}
        >
          <div className={styles.paidLaborCostDateRangeText}>{formatDisplayDate()}</div>
          <div className={styles.paidLaborCostDateRangeIcon}>📅</div>
        </button>
        <div
          className={styles.paidLaborCostInfoWrapper}
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <button
            type="button"
            className={styles.paidLaborCostInfoButton}
            aria-label="Date picker info"
          >
            <Info size={16} />
          </button>
          {showInfo && (
            <div className={styles.paidLaborCostInfoTooltip}>
              <p>
                <strong>Date Range Picker</strong>
              </p>
              <ul>
                <li>Click input to open.</li>
                <li>Select start date, then end date.</li>
                <li>Disabled dates cannot be chosen.</li>
                <li>Click Reset to clear.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      {isOpen && (
        <div
          className={styles.paidLaborCostDateRangeCalendar}
          role="presentation"
          onMouseLeave={handleMouseLeave}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.paidLaborCostCalendarHeader}>
            <button type="button" className={styles.paidLaborCostMonthNav} onClick={prevMonth}>
              &lt;
            </button>
            <div className={styles.paidLaborCostCurrentMonth}>
              {format(calendarMonth, 'MMMM yyyy')}
            </div>
            <button type="button" className={styles.paidLaborCostMonthNav} onClick={nextMonth}>
              &gt;
            </button>
          </div>

          {/* Weekdays */}
          <div className={styles.paidLaborCostCalendarWeekdays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className={styles.paidLaborCostWeekday}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className={styles.paidLaborCostCalendarDays}>
            {calendarDays.map(date => {
              const isCurrMonth = date.getMonth() === calendarMonth.getMonth();
              const isStart = tempStartDate && isEqual(startOfDay(date), startOfDay(tempStartDate));
              const isEnd = tempEndDate && isEqual(startOfDay(date), startOfDay(tempEndDate));
              const inRange = isCurrMonth && isInRange(date);
              const disabled = isDisabled(date);

              return (
                <button
                  type="button"
                  key={uuidv4()}
                  className={[
                    styles.paidLaborCostDay,
                    isCurrMonth ? styles.paidLaborCostCurrentMonth : styles.paidLaborCostOtherMonth,
                    isStart && styles.paidLaborCostStartDate,
                    isEnd && styles.paidLaborCostEndDate,
                    inRange && styles.inRange,
                    disabled && 'disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                  disabled={disabled}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className={styles.paidLaborCostCalendarFooter}>
            <button
              type="button"
              className={styles.paidLaborCostResetButton}
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
            <div className={styles.paidLaborCostSelectionText}>
              {selectionStage === 'START_DATE' ? 'Select start date' : 'Select end date'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaidLaborCostDatePicker;
