"use client"

import { useState, useEffect } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import { format, addDays } from "date-fns"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, TimeScale)

// Mock data for projects
const MOCK_PROJECTS = [
  { projectId: "proj1", projectName: "Site A" },
  { projectId: "proj2", projectName: "Site B" },
  { projectId: "proj3", projectName: "Site C" },
  { projectId: "proj4", projectName: "Site D" },
  { projectId: "proj5", projectName: "Site E" },
]

// Mock data generator for tools cost breakdown
const generateToolsCostData = (projects) => {
  return projects.map((projectId) => {
    const projectName = MOCK_PROJECTS.find((p) => p.projectId === projectId)?.projectName || projectId

    // Generate random costs between 5000 and 20000
    const ownedToolsCost = Math.floor(Math.random() * 15000) + 5000
    const rentedToolsCost = Math.floor(Math.random() * 15000) + 5000

    return {
      projectName,
      ownedToolsCost,
      rentedToolsCost,
    }
  })
}

// Helper function to generate dates between start and end dates
const getDatesInRange = (startDate, endDate) => {
  const dates = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

// Mock data generator for rentals cost over time
const generateRentalsCostData = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates = getDatesInRange(start, end)

  return dates.map((date) => {
    // Generate random cost between 2000 and 6000
    const value = Math.floor(Math.random() * 4000) + 2000

    return {
      date: format(date, "yyyy-MM-dd"),
      value,
    }
  })
}

// Main component
function ToolsCostDashboard() {
  // State for filters
  const [selectedProjects, setSelectedProjects] = useState([])
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // State for data
  const [toolsCostData, setToolsCostData] = useState([])
  const [rentalsCostData, setRentalsCostData] = useState([])

  // Initialize with all projects selected
  useEffect(() => {
    setSelectedProjects(MOCK_PROJECTS.map((project) => project.projectId))
  }, [])

  // Update data when filters change
  useEffect(() => {
    if (selectedProjects.length > 0 && dateRange.from && dateRange.to) {
      // Format dates for API calls
      const startDate = format(dateRange.from, "yyyy-MM-dd")
      const endDate = format(dateRange.to, "yyyy-MM-dd")

      // Generate mock data
      const toolsData = generateToolsCostData(selectedProjects)
      const rentalsData = generateRentalsCostData(startDate, endDate)

      setToolsCostData(toolsData)
      setRentalsCostData(rentalsData)
    }
  }, [selectedProjects, dateRange])

  // Toggle project selection
  const toggleProject = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId))
    } else {
      setSelectedProjects([...selectedProjects, projectId])
    }
  }

  // Select all projects
  const selectAllProjects = () => {
    setSelectedProjects(MOCK_PROJECTS.map((project) => project.projectId))
  }

  // Clear all selected projects
  const clearAllProjects = () => {
    setSelectedProjects([])
  }

  // Handle date range selection
  const handleDateRangeChange = (range) => {
    setDateRange(range)
    setIsDatePickerOpen(false)
  }

  // Prepare data for stacked bar chart
  const stackedBarChartData = {
    labels: toolsCostData.map((item) => item.projectName),
    datasets: [
      {
        label: "Owned Tools Cost",
        data: toolsCostData.map((item) => item.ownedToolsCost),
        backgroundColor: "#4f46e5", // Indigo
        stack: "Stack 0",
      },
      {
        label: "Rented Tools Cost",
        data: toolsCostData.map((item) => item.rentedToolsCost),
        backgroundColor: "#f97316", // Orange
        stack: "Stack 0",
      },
    ],
  }

  // Prepare data for line chart
  const lineChartData = {
    labels: rentalsCostData.map((item) => {
      const date = new Date(item.date)
      return format(date, "MMM dd")
    }),
    datasets: [
      {
        label: "Rental Cost",
        data: rentalsCostData.map((item) => item.value),
        borderColor: "#0ea5e9", // Sky blue
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
      },
    ],
  }

  // Chart options for stacked bar chart
  const stackedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "How much of the tools costs are due to rentals?",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(context.parsed.y)
            }
            return label
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        ticks: {
          callback: (value) => "$" + value.toLocaleString(),
        },
      },
    },
  }

  // Chart options for line chart
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Total Rentals Cost Over Time",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(context.parsed.y)
            }
            return label
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          callback: (value) => "$" + value.toLocaleString(),
        },
      },
    },
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Tools Cost Analysis Dashboard</h1>

      {/* Filters Section */}
      <div className="filters-card">
        <div className="card-header">
          <h2 className="card-title">Filters</h2>
          <p className="card-description">Select projects and date range to filter the data</p>
        </div>
        <div className="card-content">
          <div className="filter-group">
            <h3 className="filter-label">Projects</h3>
            <div className="dropdown-container">
              <button className="dropdown-button" onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}>
                {selectedProjects.length > 0 ? (
                  <span>
                    Selected:
                    {selectedProjects.length <= 2 ? (
                      selectedProjects.map((projectId) => {
                        const project = MOCK_PROJECTS.find((p) => p.projectId === projectId)
                        return (
                          <span key={projectId} className="badge">
                            {project?.projectName || projectId}
                          </span>
                        )
                      })
                    ) : (
                      <span className="badge">{selectedProjects.length} projects</span>
                    )}
                  </span>
                ) : (
                  "Select projects"
                )}
                <span className="dropdown-icon">▼</span>
              </button>

              {isProjectDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-search">
                    <input type="text" placeholder="Search projects..." />
                  </div>
                  <div className="dropdown-items">
                    <div className="dropdown-item" onClick={selectAllProjects}>
                      <span className="checkbox">{selectedProjects.length === MOCK_PROJECTS.length && "✓"}</span>
                      <span>Select All</span>
                    </div>
                    <div className="dropdown-item" onClick={clearAllProjects}>
                      <span className="checkbox">{selectedProjects.length === 0 && "✓"}</span>
                      <span>Clear All</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    {MOCK_PROJECTS.map((project) => (
                      <div
                        key={project.projectId}
                        className="dropdown-item"
                        onClick={() => toggleProject(project.projectId)}
                      >
                        <span className="checkbox">{selectedProjects.includes(project.projectId) && "✓"}</span>
                        <span>{project.projectName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-label">Date Range</h3>
            <div className="dropdown-container">
              <button className="dropdown-button" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
                {dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  "Select date range"
                )}
                <span className="dropdown-icon">📅</span>
              </button>

              {isDatePickerOpen && (
                <div className="date-picker-menu">
                  <div className="date-picker-row">
                    <div>
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={format(dateRange.from, "yyyy-MM-dd")}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            from: new Date(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label>End Date</label>
                      <input
                        type="date"
                        value={format(dateRange.to, "yyyy-MM-dd")}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            to: new Date(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="date-picker-actions">
                    <button className="date-picker-button" onClick={() => handleDateRangeChange(dateRange)}>
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        {/* Stacked Bar Chart */}
        <div className="chart-card">
          <div className="card-header">
            <h2 className="card-title">How much of the tools costs are due to rentals?</h2>
            <p className="card-description">Breakdown of owned vs. rented tools costs by project</p>
          </div>
          <div className="card-content chart-container">
            {toolsCostData.length > 0 ? (
              <Bar data={stackedBarChartData} options={stackedBarOptions} />
            ) : (
              <div className="no-data-message">No data available for the selected filters.</div>
            )}
          </div>
        </div>

        {/* Line Chart */}
        <div className="chart-card">
          <div className="card-header">
            <h2 className="card-title">Total Rentals Cost Over Time</h2>
            <p className="card-description">Trend of rental costs over the selected time period</p>
          </div>
          <div className="card-content chart-container">
            {rentalsCostData.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="no-data-message">No data available for the selected filters.</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Global styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        /* Dashboard container */
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .dashboard-title {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: #111827;
        }

        /* Card styles */
        .filters-card,
        .chart-card {
          background-color: white;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .card-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .card-description {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .card-content {
          padding: 1.5rem;
        }

        /* Filter styles */
        .filter-group {
          margin-bottom: 1.5rem;
        }

        .filter-group:last-child {
          margin-bottom: 0;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        /* Dropdown styles */
        .dropdown-container {
          position: relative;
        }

        .dropdown-button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0.5rem 1rem;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          text-align: left;
        }

        .dropdown-icon {
          margin-left: 0.5rem;
          font-size: 0.75rem;
        }

        .dropdown-menu,
        .date-picker-menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          margin-top: 0.25rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          z-index: 10;
        }

        .dropdown-search {
          padding: 0.5rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .dropdown-search input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .dropdown-items {
          max-height: 15rem;
          overflow-y: auto;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .dropdown-item:hover {
          background-color: #f9fafb;
        }

        .checkbox {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1rem;
          height: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          margin-right: 0.5rem;
        }

        .dropdown-divider {
          height: 1px;
          background-color: #f3f4f6;
          margin: 0.25rem 0;
        }

        .badge {
          display: inline-block;
          background-color: #f3f4f6;
          color: #374151;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          margin-left: 0.5rem;
        }

        /* Date picker styles */
        .date-picker-menu {
          padding: 1rem;
        }

        .date-picker-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .date-picker-row label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          color: #374151;
        }

        .date-picker-row input {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .date-picker-actions {
          display: flex;
          justify-content: flex-end;
        }

        .date-picker-button {
          background-color: #3b82f6;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
        }

        .date-picker-button:hover {
          background-color: #2563eb;
        }

        /* Chart styles */
        .charts-container {
          display: grid;
          gap: 2rem;
        }

        .chart-container {
          height: 400px;
          position: relative;
        }

        .no-data-message {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6b7280;
          font-size: 0.875rem;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .date-picker-row {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default ToolsCostDashboard
