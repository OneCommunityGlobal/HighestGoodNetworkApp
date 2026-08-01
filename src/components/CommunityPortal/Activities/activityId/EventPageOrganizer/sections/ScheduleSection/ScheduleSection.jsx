import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import styles from './ScheduleSection.module.css';

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildCalendarDates(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const dates = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    dates.push({ day, isCurrentMonth: false, iso: toISO(prevYear, prevMonth, day) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push({ day: d, isCurrentMonth: true, iso: toISO(year, month, d) });
  }
  const remaining = 42 - dates.length;
  for (let d = 1; d <= remaining; d++) {
    dates.push({ day: d, isCurrentMonth: false, iso: toISO(nextYear, nextMonth, d) });
  }
  return dates;
}

export const ScheduleSection = ({
  availableDates = [],
  selectedDate = '',
  onDateSelect = null,
  darkMode = false,
}) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!Number.isNaN(d.getTime())) {
        setYear(d.getFullYear());
        setMonth(d.getMonth());
      }
    }
  }, [selectedDate]);

  const availableSet = new Set(availableDates);
  const calendarDates = buildCalendarDates(year, month);
  const chevronColor = darkMode ? styles.chevronDark : styles.chevronLight;

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else setMonth(m => m - 1);
  };

  const handleNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else setMonth(m => m + 1);
  };

  return (
    <section className={styles.container}>
      <Card className="bg-transparent border-0 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col gap-6">
            <header className={styles.header}>
              <Button
                variant="ghost"
                size="icon"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={handlePrev}
                aria-label="Previous month"
              >
                <ChevronLeftIcon className={`w-2.5 h-[15px] ${chevronColor}`} />
              </Button>
              <h2 className={`${styles.monthTitle} ${darkMode ? styles.monthTitleDark : ''}`}>
                {MONTH_NAMES[month]} {year}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={handleNext}
                aria-label="Next month"
              >
                <ChevronRightIcon className={`w-2.5 h-[15px] ${chevronColor}`} />
              </Button>
            </header>

            <div className={styles.calendarWrapper}>
              <div className={styles.calendarGrid}>
                {weekDays.map((day, index) => (
                  <div
                    key={`weekday-${day}-${index}`}
                    className={`${styles.weekDay} ${darkMode ? styles.weekDayDark : ''}`}
                  >
                    {day}
                  </div>
                ))}

                {calendarDates.map((date, index) => {
                  const isAvailable = availableSet.has(date.iso);
                  const isSelected = date.iso === selectedDate;
                  return (
                    <div
                      key={`date-${date.isCurrentMonth ? 'cur' : 'other'}-${date.day}-${index}`}
                      className={`${styles.dateCell} ${isAvailable ? styles.availableDate : ''} ${
                        isSelected ? styles.selectedDate : ''
                      }`}
                      onClick={
                        isAvailable && onDateSelect ? () => onDateSelect(date.iso) : undefined
                      }
                      onKeyDown={
                        isAvailable && onDateSelect
                          ? e => e.key === 'Enter' && onDateSelect(date.iso)
                          : undefined
                      }
                      role={isAvailable && onDateSelect ? 'button' : undefined}
                      tabIndex={isAvailable && onDateSelect ? 0 : undefined}
                    >
                      {isSelected && (
                        <div className={styles.dateHighlight}>
                          <div className={styles.highlightCircle} />
                        </div>
                      )}
                      <span
                        className={`${styles.dateNumber} ${
                          date.isCurrentMonth
                            ? darkMode
                              ? styles.currentMonthDark
                              : styles.currentMonth
                            : styles.otherMonth
                        }`}
                      >
                        {date.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

ScheduleSection.propTypes = {
  availableDates: PropTypes.arrayOf(PropTypes.string),
  selectedDate: PropTypes.string,
  onDateSelect: PropTypes.func,
  darkMode: PropTypes.bool,
};
