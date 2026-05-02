import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import styles from './ScheduleSection.module.css';

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const calendarDates = [
  { day: 1, isCurrentMonth: true, hasEvent: false },
  { day: 2, isCurrentMonth: true, hasEvent: true, isHighlighted: true },
  { day: 3, isCurrentMonth: true, hasEvent: false },
  { day: 4, isCurrentMonth: true, hasEvent: false },
  { day: 5, isCurrentMonth: true, hasEvent: false },
  { day: 6, isCurrentMonth: true, hasEvent: false },
  { day: 7, isCurrentMonth: true, hasEvent: false },
  { day: 8, isCurrentMonth: true, hasEvent: false },
  { day: 9, isCurrentMonth: true, hasEvent: false },
  { day: 10, isCurrentMonth: true, hasEvent: false },
  { day: 11, isCurrentMonth: true, hasEvent: true },
  { day: 12, isCurrentMonth: true, hasEvent: false },
  { day: 13, isCurrentMonth: true, hasEvent: false },
  { day: 14, isCurrentMonth: true, hasEvent: false },
  { day: 15, isCurrentMonth: true, hasEvent: false },
  { day: 16, isCurrentMonth: true, hasEvent: false },
  { day: 17, isCurrentMonth: true, hasEvent: false },
  { day: 18, isCurrentMonth: true, hasEvent: true },
  { day: 19, isCurrentMonth: true, hasEvent: false },
  { day: 20, isCurrentMonth: true, hasEvent: false },
  { day: 21, isCurrentMonth: true, hasEvent: false },
  { day: 22, isCurrentMonth: true, hasEvent: false },
  { day: 23, isCurrentMonth: true, hasEvent: false },
  { day: 24, isCurrentMonth: true, hasEvent: false },
  { day: 25, isCurrentMonth: true, hasEvent: false },
  { day: 26, isCurrentMonth: true, hasEvent: true },
  { day: 27, isCurrentMonth: true, hasEvent: false },
  { day: 28, isCurrentMonth: true, hasEvent: false },
  { day: 29, isCurrentMonth: true, hasEvent: false },
  { day: 30, isCurrentMonth: true, hasEvent: false },
  { day: 1, isCurrentMonth: false, hasEvent: false },
  { day: 2, isCurrentMonth: false, hasEvent: false },
  { day: 3, isCurrentMonth: false, hasEvent: false },
  { day: 4, isCurrentMonth: false, hasEvent: false },
  { day: 5, isCurrentMonth: false, hasEvent: false },
];

export const ScheduleSection = () => {
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
              >
                <ChevronLeftIcon className="w-2.5 h-[15px] text-black" />
              </Button>
              <h2 className={styles.monthTitle}>September 2024</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-auto w-auto p-0 hover:bg-transparent"
              >
                <ChevronRightIcon className="w-2.5 h-[15px] text-black" />
              </Button>
            </header>

            <div className={styles.calendarWrapper}>
              <div className={styles.calendarGrid}>
                {weekDays.map((day, index) => (
                  <div key={`weekday-${index}`} className={styles.weekDay}>
                    {day}
                  </div>
                ))}

                {calendarDates.map((date, index) => (
                  <div key={`date-${index}`} className={styles.dateCell}>
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
