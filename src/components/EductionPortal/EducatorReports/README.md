# Educator Reports - Analytics Dashboard

## Overview
A comprehensive reporting interface for educators to generate and view student and class performance reports through visual analytics.

## Features

### 🎯 Main Components
- **Unified Reports Section**: Accessible from the Educator Dashboard at `/educator/reports`
- **Tab-based Interface**: Switch between "Individual Reports" and "Class Reports"
- **Advanced Filtering**: Filter by report type, student/class, subject, and date range
- **Visual Analytics**: Interactive charts, progress tracking, and key metrics
- **Responsive Design**: Optimized for desktop and tablet views
- **Dark/Light Mode**: Consistent with dashboard styling

### 📊 Individual Reports View
- **Student Progress Tracking**: Strengths & gaps table by subject
- **Performance Metrics**: Average score, lessons completed, engagement rate, time spent
- **Trend Analysis**: Performance trend charts over time
- **Actionable Insights**: AI-generated recommendations for student improvement
- **Visual Indicators**: Color-coded performance status (🟢🟡🔴)

### 👥 Class Performance View
- **Class Metrics**: Class average, completion rate, engagement rate, active learners
- **Teaching Strategies Analysis**: Effectiveness visualization with color-coded bars
- **Life Strategies Impact**: Impact assessment charts
- **Strategic Recommendations**: Actionable insights for teaching methodology

## Component Architecture

```
src/components/EducatorReports/
├── ReportsView.jsx                 # Main dashboard component
├── ReportsView.module.css         # Main styling
├── index.js                       # Export file
└── components/
    ├── ReportFilterBar/
    │   ├── ReportFilterBar.jsx     # Filter controls
    │   └── ReportFilterBar.module.css
    ├── ReportChart/
    │   ├── ReportChart.jsx         # Reusable chart component
    │   └── ReportChart.module.css
    ├── MetricCard/
    │   ├── MetricCard.jsx          # Key metrics display
    │   └── MetricCard.module.css
    ├── IndividualReportView/
    │   ├── IndividualReportView.jsx
    │   └── IndividualReportView.module.css
    └── ClassPerformanceView/
        ├── ClassPerformanceView.jsx
        └── ClassPerformanceView.module.css
```

## Technology Stack

- **React 18**: Component framework
- **Reactstrap**: UI components (Bootstrap 4)
- **Chart.js + react-chartjs-2**: Data visualization
- **CSS Modules**: Scoped styling
- **Redux**: State management (dark mode, user auth)
- **React Router**: Routing

## Route Configuration

The reports are accessible via:
- **Route**: `/educator/reports`
- **Protection**: EPProtectedRoute (Education Portal authentication required)
- **Component**: EducatorReports

## Key Features

### 🔍 Advanced Filtering
- Report type selection (Individual/Class)
- Student/Class dropdown selection
- Subject filtering (All subjects, Mathematics, Science, English, etc.)
- Date range selection (Last Week, Month, Quarter, Semester, Year, Custom)

### 📈 Chart Types
- **Bar Charts**: Strategy effectiveness, impact analysis
- **Line Charts**: Performance trends over time
- **Pie Charts**: Distribution analysis (if needed)

### 🎨 Visual Design
- **Color-coded Status**: 
  - 🟢 Green: Excellent performance (85%+)
  - 🟡 Yellow: Good performance (70-84%)
  - 🔴 Red: Needs improvement (<70%)
- **Metric Cards**: Clean, informative summary displays
- **Responsive Tables**: Sortable, accessible data tables

### 🌙 Dark Mode Support
All components support dark mode theming with:
- Automatic color scheme switching
- Consistent contrast ratios
- Accessible focus indicators

## Usage

### Accessing Reports
1. Navigate to `/educator/reports`
2. Use the filter bar to select:
   - Report type (Individual/Class)
   - Student or class name
   - Subject area
   - Date range
3. Switch between tabs to view different report types

### Individual Reports
- Select a student from the dropdown
- View key metrics: average score, lessons completed, engagement rate
- Analyze subject-specific performance in the strengths & gaps table
- Review performance trends over time
- Read actionable insights for student improvement

### Class Reports
- Select a class from the dropdown
- Monitor class-wide metrics and engagement
- Analyze teaching strategy effectiveness
- Review life strategies impact
- Get recommendations for improving class performance

## Data Structure

### Mock Data Sources
- Student performance data by subject
- Class analytics and metrics
- Teaching strategy effectiveness scores
- Engagement and completion rates
- Time tracking data

### API Integration Points
- `fetchStudentData()`: Individual student analytics
- `fetchClassData()`: Class-wide performance data
- Filter-based data fetching with subject and date range parameters

## Responsive Breakpoints

- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px-1199px (adjusted spacing, stacked cards)
- **Mobile**: <768px (single column, optimized touch targets)

## Accessibility Features

- WCAG 2.1 AA compliant color contrast
- Keyboard navigation support
- Screen reader friendly markup
- Focus management for interactive elements
- Alternative text for charts and visual indicators

## Future Enhancements

- Real-time data updates
- Export functionality (PDF/CSV)
- Print-optimized layouts
- Advanced filtering options
- Comparative analytics
- Historical trend analysis
- Parent/guardian sharing capabilities

## Development Notes

- All components use CSS Modules for scoped styling
- Chart.js is pre-configured with responsive options and dark mode support
- Error boundaries handle API failures gracefully
- Loading states provide user feedback during data fetching
- Print styles are included for all components