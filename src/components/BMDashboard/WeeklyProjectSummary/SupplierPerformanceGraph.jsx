/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';

// Mock data for initial development/testing
const mockData = [
  { supplierName: 'Supplier A', onTimeDeliveryPercentage: 95 },
  { supplierName: 'Supplier B', onTimeDeliveryPercentage: 90 },
  { supplierName: 'Supplier C', onTimeDeliveryPercentage: 87 },
  { supplierName: 'Supplier D', onTimeDeliveryPercentage: 85 },
];

// Mock projects for initial development/testing
const mockProjects = [
  { id: 'all', name: 'ALL' },
  { id: 'proj1', name: 'Project Alpha' },
  { id: 'proj2', name: 'Project Beta' },
  { id: 'proj3', name: 'Project Gamma' },
];

export default function SupplierPerformanceDashboard({
  showTitle = true,
  enableFilters = true,
  className = '',
  height = 350,
  onDataLoaded = null,
}) {
  // State variables
  const [supplierData, setSupplierData] = useState([]);
  const [projects, setProjects] = useState(mockProjects);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch supplier performance data based on filters
  useEffect(() => {
    const fetchSupplierData = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real implementation, this would call an API
        const sortedData = [...mockData].sort(
          (a, b) => b.onTimeDeliveryPercentage - a.onTimeDeliveryPercentage,
        );

        setSupplierData(sortedData);

        // Call onDataLoaded callback if provided
        if (onDataLoaded && typeof onDataLoaded === 'function') {
          onDataLoaded(sortedData);
        }
      } catch (err) {
        // console.error('Error fetching supplier data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, [selectedProject, dateRange.startDate, dateRange.endDate, onDataLoaded]);

  // Event handlers
  const handleProjectChange = projectId => {
    setSelectedProject(projectId);
    setShowProjectDropdown(false);
  };

  const handleDateChange = e => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Format date for display
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={` ${className}`}>
      {/* Header with title and filters */}
      {(showTitle || enableFilters) && (
        <div className="flex flex-row md:flex-row justify-between items-start md:items-center mb-4">
          {showTitle && (
            <h3 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">
              Supplier Performance by On-Time Delivery %
            </h3>
          )}

          {enableFilters && (
            <div className="flex flex-col gap-2">
              {/* Project filter */}
              <div className="relative">
                <div
                  className="flex items-center px-3 py-1 border border-gray-300 rounded-md cursor-pointer text-sm"
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                >
                  <span className="text-xs mr-1">Project: </span>
                  <span className="font-medium mr-1">
                    {selectedProject === 'all'
                      ? 'ALL'
                      : projects.find(p => p.id === selectedProject)?.name}
                  </span>
                  <ChevronDown size={14} className="text-gray-500" />
                </div>

                {showProjectDropdown && (
                  <div className="absolute z-10 mt-1 w-40 border border-gray-200 rounded-md shadow-lg text-sm">
                    {projects.map(project => (
                      <div
                        key={project.id}
                        className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-xs"
                        onClick={() => handleProjectChange(project.id)}
                      >
                        {project.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date range filter */}
              <div className="relative">
                <div
                  className="flex items-center px-3 py-1 border border-gray-300 rounded-md cursor-pointer text-sm"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <span className="text-xs mr-1">Dates: </span>
                  <span className="font-medium mr-1">
                    {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                  </span>
                  <Calendar size={14} className="text-gray-500" />
                </div>

                {showDatePicker && (
                  <div className="absolute z-10 right-0 mt-1 p-3 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="flex flex-col gap-2 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Start
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={dateRange.startDate}
                          onChange={handleDateChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End</label>
                        <input
                          type="date"
                          name="endDate"
                          value={dateRange.endDate}
                          onChange={handleDateChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        className="mt-1 px-3 py-1 bg-blue-600 text-white rounded-md text-xs"
                        onClick={() => setShowDatePicker(false)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {/* Chart content */}
      <div style={{ height: `${height}px` }} className="w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-6 w-6 bg-blue-100 rounded-full mb-2" />
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          </div>
        ) : supplierData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No supplier data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplierData} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="supplierName" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#eee' }}
                tickFormatter={value => `${value}%`}
              />
              <Tooltip
                formatter={value => [`${value}%`, 'On-Time Delivery']}
                contentStyle={{ fontSize: '12px' }}
              />
              <Bar
                dataKey="onTimeDeliveryPercentage"
                name="On-Time Delivery %"
                fill="#4CAF50"
                radius={[4, 4, 0, 0]}
                barSize={30}
              >
                <LabelList
                  dataKey="onTimeDeliveryPercentage"
                  position="top"
                  formatter={value => `${value}%`}
                  style={{ fill: '#333', fontSize: 11, fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
