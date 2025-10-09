# Student Dashboard

A comprehensive student dashboard component for the Education Portal that displays task progress, time logging, and course management.

## Features

### 🎯 Core Functionality
- **Dual View Modes**: Card view and List view for task display
- **Real-time Progress Tracking**: Visual progress bars showing completion status
- **Smart Mark as Done Logic**: Different eligibility rules for read-only vs write tasks
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📊 Dashboard Components
- **Navigation Bar**: Top navigation with dropdown menus
- **Summary Cards**: Overview of total time logged, weekly progress, and active courses
- **Task Management**: Interactive task cards with status badges and action buttons

### 🎨 Visual Design
- **Modern UI**: Clean, minimalist design with subtle shadows and hover effects
- **Status Badges**: Color-coded badges for different task states
- **Progress Indicators**: Animated progress bars with percentage completion
- **Interactive Elements**: Hover states and smooth transitions

## Task Types & Mark as Done Logic

### Read-Only Tasks
- Can be marked as done only after requisite hours are logged
- `logged_hours >= suggested_total_hours`

### Write Tasks
- Automatically marked as done when upload is made
- Can also be manually marked as done if hours requirement is met
- `has_upload = true` OR `logged_hours >= suggested_total_hours`

## Status Badges

| Badge | Color | Condition |
|-------|-------|-----------|
| Comments | Orange | Task has comments but not completed |
| Hours Met | Green | Required hours logged but not marked done |
| Pending Review | Gray | Task in progress, awaiting review |
| Completed | Green | Task marked as completed |

## API Integration

### Current Implementation
- Uses mock data for development and testing
- Simulates API delay for realistic user experience

### Production Setup
To integrate with the actual API, update the following in `StudentDashboard.jsx`:

```javascript
// Replace mock data with actual API call
const response = await axios.get('/api/student/tasks', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

### API Endpoints

#### GET /api/student/tasks
Fetches all tasks for the logged-in student.

**Response Format:**
```json
[
  {
    "id": 1,
    "course_name": "Mathematics 101",
    "subtitle": "Algebra Fundamentals",
    "task_type": "read-only",
    "logged_hours": 6,
    "suggested_total_hours": 10,
    "last_logged_date": "2025-09-10",
    "created_at": "2025-09-01",
    "is_completed": false,
    "has_upload": false,
    "has_comments": true,
    "status": "in_progress"
  }
]
```

#### PUT /api/student/tasks/:id/mark-done
Marks a task as completed.

**Request:** Empty body
**Response:** Updated task object

## Component Structure

```
StudentDashboard/
├── StudentDashboard.jsx          # Main dashboard component
├── NavigationBar.jsx             # Top navigation
├── SummaryCards.jsx              # Summary statistics cards
├── TaskCardView.jsx              # Card view container
├── TaskListView.jsx              # List view container
├── TaskCard.jsx                  # Individual task card
├── TaskListItem.jsx              # Individual task list item
├── mockData.js                   # Mock data for development
├── index.js                      # Export file
└── *.module.css                  # Component-specific styles
```

## Usage

```jsx
import StudentDashboard from './components/EductionPortal/StudentDashboard';

function App() {
  return <StudentDashboard />;
}
```

## Styling

The component uses CSS Modules for scoped styling. Key design tokens:

- **Primary Color**: #3b82f6 (Blue)
- **Success Color**: #10b981 (Green)
- **Warning Color**: #f59e0b (Orange)
- **Background**: #f8f9fa (Light Gray)
- **Card Background**: #ffffff (White)

## Responsive Breakpoints

- **Desktop**: 1200px+ (3-column grid for cards)
- **Tablet**: 768px-1199px (2-column grid)
- **Mobile**: <768px (1-column layout, stacked navigation)

## Development Notes

1. **Mock Data**: Currently uses mock data for development
2. **API Ready**: Code structure prepared for easy API integration
3. **Accessibility**: Includes ARIA labels and keyboard navigation
4. **Performance**: Optimized with React hooks and efficient re-renders

## Future Enhancements

- [ ] Real-time updates via WebSocket
- [ ] Advanced filtering and sorting
- [ ] Export functionality for time logs
- [ ] Integration with calendar system
- [ ] Push notifications for deadlines
