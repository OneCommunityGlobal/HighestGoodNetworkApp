import { useState } from 'react';
import styles from './Activitiesstyles.module.css';
function ResourceMonitoring() {
  const resources = [
    {
      title: 'Resource Issue',
      value: 27,
      max: 80,
      change: '+14%',
      direction: 'up',
      bgColor: '#fdecea',
    },
    {
      title: 'Resource Usage',
      value: 56,
      max: 80,
      change: '-24%',
      direction: 'down',
      bgColor: '#eafaf1',
    },
    {
      title: 'Event Numbers Left',
      value: 100,
      max: 200,
      change: '+5%',
      direction: 'up',
      bgColor: '#fff8e6',
    },
    {
      title: 'Attendance',
      value: 75,
      max: 100,
      change: '-8%',
      direction: 'down',
      bgColor: '#e7f4fc',
    },
    {
      title: 'New Members',
      value: 20,
      max: 50,
      change: '+10%',
      direction: 'up',
      bgColor: '#f3e8fd',
    },
  ];

  const progressColorMap = {
    'Resource Issue': 'red',
    'Resource Usage': 'green',
    'Event Numbers Left': 'goldenrod',
    Attendance: 'blue',
    'New Members': 'purple',
  };

  const labelMap = {
    Attendance: 'Healthy',
    'New Members': 'Good',
  };

  const [clickedArrow, setClickedArrow] = useState(null);

  const handleArrowClick = index => {
    setClickedArrow(index === clickedArrow ? null : index);
  };

  return (
    <div className={`${styles.resourceMonitoring}`}>
      <h2>Resources Monitoring</h2>
      <div className={`${styles.resourceGrid}`}>
        {resources.map((resource, index) => {
          const progress = (resource.value / resource.max) * 100;
          const arrowColor = resource.direction === 'up' ? 'green' : 'red';

          return (
            <div className={`${styles.resourceCard}`} key={resource.title}>
              {/* Left Section: Title and Value */}
              <div>
                <div className={`${styles.resourceTitle}`}>
                  {resource.title}
                  <button
                    type="button"
                    aria-label={`Toggle ${resource.title}`}
                    onClick={() => handleArrowClick(index)}
                  >
                    ↗
                  </button>
                </div>
                <div className={`${styles.resourceValue}`}>{resource.value}</div>
                <div className={`${styles.resourceStats}`}>
                  <div className={`${styles.arrow}`}>{resource.direction === 'up' ? '▲' : '▼'}</div>
                  <p>{resource.change}</p>
                  <p>compare to last week</p>
                </div>
              </div>

              <div className={styles.circleContainer}>
                <svg className={styles.progressCircle} viewBox="0 0 36 36" width="90" height="90">
                  <path
                    className={styles.circleBg}
                    d="
                      M18 2.5
                      a 15.5 15.5 0 0 1 0 31
                      a 15.5 15.5 0 0 1 0 -31
                    "
                  />

                  <path
                    className={styles.circleProgress}
                    stroke={progressColorMap[resource.title] || '#9ca3af'}
                    strokeDasharray={`${progress}, 100`}
                    d="
                      M18 2.5
                      a 15.5 15.5 0 0 1 0 31
                      a 15.5 15.5 0 0 1 0 -31
                    "
                  />
                </svg>

                <div className={styles.circleLabel}>{progress}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResourceMonitoring;
