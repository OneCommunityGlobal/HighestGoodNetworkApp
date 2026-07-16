import { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const DailyLogContext = createContext(null);

const initialLogs = [
  {
    log_id: 'lg-2',
    actor_id: 's-1',
    action_type: 'task_upload',
    entity_id: 'time-log-101',
    metadata: {
      course: 'Mathematics 101 - Algebra Fundamentals',
      duration: '2h 0m',
      grade: 'A-',
      badge: 'Graded (A-)',
      link: '/time-logs/101',
      comments_count: 8,
      notes: 'Worked on quadratic equations practice and reviewed feedback.',
      noteToTeacher: '',
      teacherFeedback:
        'Good progress on quadratic equations. Focus on translating word problems into equations and check fraction operations carefully.',
    },
    created_at: '2025-09-10T14:00:00Z',
  },
  {
    log_id: 'lg-3',
    actor_id: 's-1',
    action_type: 'task_upload',
    entity_id: 'time-log-102',
    metadata: {
      course: 'English 200 - Creative Writing',
      duration: '1h 30m',
      badge: 'Reviewed',
      link: '/time-logs/102',
      notes: 'Drafted a short story outline and edited the introduction.',
      noteToTeacher: '',
      teacherFeedback: '',
    },
    created_at: '2025-09-09T16:00:00Z',
  },
  {
    log_id: 'lg-4',
    actor_id: 's-1',
    action_type: 'task_upload',
    entity_id: 'time-log-103',
    metadata: {
      course: 'Science 150 - Biology Basics',
      duration: '1h 15m',
      badge: 'Pending Review',
      link: '/time-logs/103',
      notes: 'Completed notes on cell structure and watched lecture video.',
      noteToTeacher: '',
      teacherFeedback: '',
    },
    created_at: '2025-09-08T18:00:00Z',
  },
];

export function DailyLogProvider({ children }) {
  const [logs, setLogs] = useState(initialLogs);

  const addLog = log => setLogs(prev => [log, ...prev]);

  const updateLogNote = (logId, note) => {
    setLogs(prev =>
      prev.map(row =>
        row.log_id === logId || row.entity_id === `time-log-${logId}`
          ? { ...row, metadata: { ...row.metadata, noteToTeacher: note } }
          : row,
      ),
    );
  };

  const value = useMemo(() => ({ logs, addLog, updateLogNote }), [logs]);

  return <DailyLogContext.Provider value={value}>{children}</DailyLogContext.Provider>;
}

DailyLogProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useDailyLog() {
  const ctx = useContext(DailyLogContext);
  if (!ctx) throw new Error('useDailyLog must be used within a DailyLogProvider');
  return ctx;
}
