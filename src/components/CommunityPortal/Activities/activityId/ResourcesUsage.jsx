import { useSelector } from 'react-redux';
import styles from './ResourcesUsage.module.css';

function ResourcesUsage() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const data = [
    {
      sNo: 1,
      name: 'Harsh Kadyan',
      materials: '????',
      facilities: 'Software Engineer Team',
      status: { text: 'Debited', color: 'green' },
      dueDate: '10 January 2024',
    },
    {
      sNo: 2,
      name: 'John Doe',
      materials: '????',
      facilities: 'HR Facilities',
      status: { text: 'Partially Debited', color: 'yellow' },
      dueDate: '25 December 2030',
    },
    {
      sNo: 3,
      name: 'Jane Smith',
      materials: '????',
      facilities: 'IT Equipment',
      status: { text: 'Not Debited', color: 'red' },
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(),
    },
    {
      sNo: 4,
      name: 'Alex Brown',
      materials: '????',
      facilities: 'Admin Facilities',
      status: { text: 'Debited', color: 'green' },
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toDateString(),
    },
  ];

  const getDueStatus = dueDateStr => {
    const today = new Date();
    const dueDate = new Date(Date.parse(dueDateStr));

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffInDays = Math.floor(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays < 0) {
      return { status: 'overdue', label: 'Overdue', tooltip: 'This item is overdue' };
    } else if (diffInDays <= 7) {
      return { status: 'dueSoon', label: 'Due Soon', tooltip: 'Due within 7 days' };
    } else {
      return { status: 'onTrack', label: 'On Track', tooltip: 'Due in more than 7 days' };
    }
  };

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.resourcesUsage}`}>
        <h2 className={`${styles.resourceTitle}`}>Resource Usage Monitoring</h2>

        {/* Header */}
        <div className={`${styles.resourceRow}`}>
          <div className={`${styles.column}`}>S.No</div>
          <div className={`${styles.column}`}>Name</div>
          <div className={`${styles.column}`}>Materials</div>
          <div className={`${styles.column}`}>Facilities</div>
          <div className={`${styles.column}`}>Status</div>
          <div className={`${styles.column}`}>Due Date</div>
          <div className={`${styles.column}`}>Actions</div>
        </div>

        {/* Rows */}
        {data.map(row => {
          const dueInfo = getDueStatus(row.dueDate);

          return (
            <div
              key={row.sNo}
              className={`${styles.resourceRow} ${styles[dueInfo.status]}`}
            >
              <div className={`${styles.column}`}>{row.sNo}</div>
              <div className={`${styles.column}`}>{row.name}</div>
              <div className={`${styles.column}`}>{row.materials}</div>
              <div className={`${styles.column}`}>{row.facilities}</div>

              <div
                className={`${styles.column} ${styles[`status${row.status.color}`]}`}
              >
                {row.status.text}
              </div>

              {/* Due Date Column */}
              <div className={`${styles.column}`} title={dueInfo.tooltip}>
                {row.dueDate}

                {dueInfo.status !== 'onTrack' && (
                  <span className={styles.dueTag}>
                    {dueInfo.status === 'overdue' ? '⚠️' : '⏳'} {dueInfo.label}
                  </span>
                )}
              </div>

              <div className={`${styles.column} ${styles.actionColumn}`}>
                <button type="button" className={`${styles.viewDetailsButton}`}>
                  View Details
                </button>
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className={`${styles.tickBox}`}>
          <label className={`${styles.tickLabel}`}>
            <input type="checkbox" id="tickAll" /> Tick off All Selected Items
          </label>
        </div>
      </div>
    </div>
  );
}

export default ResourcesUsage;