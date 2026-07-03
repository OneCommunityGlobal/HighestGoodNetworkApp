import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import React, { useState } from 'react';
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

function buildCalendarDates(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const dates = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    dates.push({ day: daysInPrevMonth - i, isCurrentMonth: false, hasEvent: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push({ day: d, isCurrentMonth: true, hasEvent: false });
  }
  const remaining = 42 - dates.length;
  for (let d = 1; d <= remaining; d++) {
    dates.push({ day: d, isCurrentMonth: false, hasEvent: false });
  }
  return dates;
}

export const ScheduleSection = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const calendarDates = buildCalendarDates(year, month);

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
                <ChevronLeftIcon className="w-2.5 h-[15px] text-black" />
              </Button>
              <h2 className={styles.monthTitle}>
                {MONTH_NAMES[month]} {year}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={handleNext}
                aria-label="Next month"
              >
                <ChevronRightIcon className="w-2.5 h-[15px] text-black" />
              </Button>
            </header>

            <div className={styles.calendarWrapper}>
              <div className={styles.calendarGrid}>
                {weekDays.map((day, index) => (
                  <div key={`weekday-${day}-${index}`} className={styles.weekDay}>
                    {day}
                  </div>
                ))}

                {calendarDates.map((date, index) => (
                  <div
                    key={`date-${date.isCurrentMonth ? 'cur' : 'other'}-${date.day}-${index}`}
                    className={styles.dateCell}
                  >
                    {date.isHighlighted && (
                      <div className={styles.dateHighlight}>
                        <div className={styles.highlightCircle} />
                      </div>
                    )}
                    <span
                      className={`${styles.dateNumber} ${
                        date.isCurrentMonth ? styles.currentMonth : styles.otherMonth
                      }`}
                    >
                      {date.day}
                    </span>
                    {date.hasEvent && <div className={styles.eventDot} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
