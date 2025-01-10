const CalendarActivitySection = () => {
  const calendar_activities = [
    { id: 1, author: "Jiaqi", message: "Published event 1 approved", time: "2 min ago" },
    { id: 2, author: "Alex", message: "Event 2 needs attendees", time: "1 hour ago" },
    { id: 3, author: "Taylor", message: "Updated workshop details", time: "3 hours ago" },
  ];

  return (
    <div className="calendar-activity-section">
      <h2>Latest News</h2>
      <ul className="calendar-activity-list">
        {calendar_activities.map((activity) => (
          <li key={activity.id} className="calendar-activity-item">
            <p>
              <strong>{activity.author}</strong>: {activity.message}
            </p>
            <small>{activity.time}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CalendarActivitySection;
