import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
} from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import costBreakdownService from '../../../../services/costBreakdownService';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';
import './CostBreakdownChart.module.css';

const CostBreakdownChart = () => {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects?.projects || []);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Sample data for fallback when API is unavailable
  const sampleData = [
    { month: 'Jan 2024', plumbing: 5000, electrical: 4500, structural: 7000, mechanical: 6000 },
    { month: 'Feb 2024', plumbing: 4000, electrical: 4800, structural: 6800, mechanical: 6200 },
    { month: 'Mar 2024', plumbing: 5500, electrical: 5200, structural: 7200, mechanical: 5800 },
    { month: 'Apr 2024', plumbing: 4800, electrical: 4900, structural: 6900, mechanical: 6100 },
    { month: 'May 2024', plumbing: 5200, electrical: 5100, structural: 7100, mechanical: 5900 },
    { month: 'Jun 2024', plumbing: 4600, electrical: 4700, structural: 6800, mechanical: 6000 },
  ];

  useEffect(() => {
    // Fetch projects on component mount
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    // Set initial project when projects are loaded
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]._id || projects[0].id);
      // Set sample data initially (will be replaced with real API call)
      setChartData(sampleData);
      setLoading(false);
    }
  }, [projects, selectedProject]);

  const fetchCostBreakdown = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);

      // Try to fetch real data from API
      try {
        const response = await costBreakdownService.getCostBreakdown(
          selectedProject,
          fromDate,
          toDate,
        );
        if (response.data && response.data.actual) {
          setChartData(response.data.actual);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using sample data:', apiError.message);
      }

      // Fallback to sample data if API is not available
      let filteredData = sampleData;
      if (fromDate || toDate) {
        filteredData = sampleData.filter(item => {
          const itemDate = new Date(item.month + ' 1, 2024');
          const from = fromDate ? new Date(fromDate) : null;
          const to = toDate ? new Date(toDate) : null;

          if (from && to) {
            return itemDate >= from && itemDate <= to;
          } else if (from) {
            return itemDate >= from;
          } else if (to) {
            return itemDate <= to;
          }
          return true;
        });
      }

      setChartData(filteredData);
    } catch (err) {
      console.error('Error fetching cost breakdown:', err);
      setError('Failed to load cost breakdown data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    fetchCostBreakdown();
  };

  const resetFilters = () => {
    setFromDate('');
    setToDate('');
    if (projects.length > 0) {
      setSelectedProject(projects[0]._id || projects[0].id);
    }
    setChartData(sampleData);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <p className="label" style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{
                margin: '2px 0',
                color: entry.color,
                fontSize: '12px',
              }}
            >
              {entry.name}: ${entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading || projects.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <div>
          {projects.length === 0 ? 'Loading projects...' : 'Loading cost breakdown data...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          color: 'red',
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <Card className="cost-breakdown-chart">
      <CardBody>
        <CardTitle tag="h2" className="text-center mb-4">
          Cost Breakdown by Type of Expenditure
        </CardTitle>

        {/* Filters */}
        <Form className="mb-4">
          <Row>
            <Col md={3}>
              <FormGroup>
                <Label for="projectSelect">Project</Label>
                <Input
                  id="projectSelect"
                  type="select"
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                >
                  {projects.map(project => (
                    <option key={project._id || project.id} value={project._id || project.id}>
                      {project.projectName || project.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="fromDate">From Date</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="toDate">To Date</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <div>
                <Button color="primary" onClick={handleFilterChange} className="me-2">
                  Apply Filters
                </Button>
                <Button color="secondary" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </Col>
          </Row>
        </Form>

        {/* Chart */}
        <div style={{ width: '100%', height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#666' }}
                tickSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fill: '#666' }}
                tickSize={10}
                domain={[0, 'auto']}
                label={{
                  value: 'Cost ($)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  paddingTop: '20px',
                }}
              />

              {/* Cost Lines */}
              <Line
                type="monotone"
                dataKey="plumbing"
                stroke="#8884d8"
                strokeWidth={3}
                name="Plumbing"
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="electrical"
                stroke="#82ca9d"
                strokeWidth={3}
                name="Electrical"
                dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="structural"
                stroke="#ffc658"
                strokeWidth={3}
                name="Structural"
                dot={{ fill: '#ffc658', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="mechanical"
                stroke="#ff7300"
                strokeWidth={3}
                name="Mechanical"
                dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="mt-4">
          <Row>
            <Col md={3}>
              <div className="text-center">
                <h6>Total Plumbing</h6>
                <strong>
                  ${chartData.reduce((sum, item) => sum + (item.plumbing || 0), 0).toLocaleString()}
                </strong>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h6>Total Electrical</h6>
                <strong>
                  $
                  {chartData
                    .reduce((sum, item) => sum + (item.electrical || 0), 0)
                    .toLocaleString()}
                </strong>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h6>Total Structural</h6>
                <strong>
                  $
                  {chartData
                    .reduce((sum, item) => sum + (item.structural || 0), 0)
                    .toLocaleString()}
                </strong>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h6>Total Mechanical</h6>
                <strong>
                  $
                  {chartData
                    .reduce((sum, item) => sum + (item.mechanical || 0), 0)
                    .toLocaleString()}
                </strong>
              </div>
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  );
};

export default CostBreakdownChart;
