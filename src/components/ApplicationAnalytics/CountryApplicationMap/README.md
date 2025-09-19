# Country Application Map Component

An interactive world map visualization showing application distribution by country for the HighestGoodNetworkApp job analytics system.

## Features

### 🗺️ Interactive World Map
- **Technology**: Built with `react-simple-maps` for smooth, responsive world map rendering
- **Color Scale**: Dynamic gradient coloring based on application volume (darker = more applications)
- **Hover Effects**: Interactive country highlighting with detailed tooltips

### 📊 Data Visualization
- **Real-time Data**: Shows current application counts per country
- **Color Legend**: Visual scale indicator showing application ranges
- **Summary Statistics**: Total applications, country count, and averages

### 🔍 Advanced Filtering

#### Time Period Filters
- **Weekly**: Last 7 days
- **Monthly**: Last 30 days  
- **Yearly**: Last year
- **Custom Range**: User-defined date range

#### Multi-Select Role Filter
- Checkbox-based role selection
- Supports filtering by multiple roles simultaneously
- Dynamic data updates based on selected roles

### 💡 Smart Tooltips
- **Exact Numbers**: Shows precise application counts
- **Trend Analysis**: Displays percentage change vs. previous period
- **Context-Aware**: Adapts comparison text based on selected time filter
  - Preset filters (week/month/year): Shows "X% more/less than last [period]"
  - Custom date ranges: Disables comparison (no previous period reference)

### 🎨 Dark Mode Support
- Fully responsive to app's dark mode theme
- Optimized color schemes for both light and dark modes
- Consistent with existing app design patterns

## Technical Implementation

### Dependencies
- `react-simple-maps`: World map rendering
- `react-redux`: State management integration
- `axios`: API data fetching (ready for backend integration)

### File Structure
```
CountryApplicationMap/
├── CountryApplicationMap.jsx      # Main component
├── CountryApplicationMap.module.css # Styling
├── api.js                         # Data service layer
├── CountryApplicationMap.test.jsx # Unit tests
├── index.js                       # Export file
└── README.md                      # Documentation
```

### API Integration
The component is designed to work with the following API endpoints:
- `GET /api/country-applications` - Fetch country application data
- `GET /api/roles` - Get available roles for filtering
- `GET /api/application-summary` - Get summary statistics

### Data Structure
```javascript
{
  country: "United States of America",
  applications: 1250,
  previousPeriod: 1100,
  roles: {
    "Software Developer": 450,
    "Project Manager": 200,
    // ... other roles
  }
}
```

## Usage

The component is integrated into the JobAnalytics system as a new tab:

```jsx
import CountryApplicationMap from './CountryApplicationMap/CountryApplicationMap';

// Component is automatically available in JobAnalytics tabs
<CountryApplicationMap />
```

## Customization

### Color Schemes
Colors are automatically generated based on:
- Dark mode preference (from Redux store)
- Application volume ranges
- Accessibility considerations

### Responsive Design
- Mobile-optimized layout
- Collapsible filter panels
- Touch-friendly interactions

## Testing

Run tests with:
```bash
npm test CountryApplicationMap.test.jsx
```

## Future Enhancements

1. **Real API Integration**: Replace mock data with actual backend calls
2. **Export Functionality**: Add PDF/image export capabilities
3. **Drill-down Views**: Click country to see city/region breakdown
4. **Animation**: Smooth transitions for filter changes
5. **Comparison Mode**: Side-by-side period comparisons
