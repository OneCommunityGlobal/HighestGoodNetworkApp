import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormGroup, Label, Input, Row, Col } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ToolsHorizontalBarChart from './ToolsHorizontalBarChart';
import './ToolsAvailabilityPage.css';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';

function ToolsAvailabilityPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const projects = useSelector(state => state.bmProjects || []);
  const dispatch = useDispatch();

  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch projects on component mount
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  return (
    <div className={`tools-availability-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="tools-availability-content">
        <div className="tools-filter-container">
          <Row>
            <Col md={4}>
              <FormGroup>
                <Label for="select-project">Project:</Label>
                <Input
                  id="select-project"
                  type="select"
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Start Date:</Label>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate || new Date()}
                  placeholderText="Select start date"
                  className={`form-control ${
                    darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                  }`}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>End Date:</Label>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  placeholderText="Select end date"
                  className={`form-control ${
                    darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                  }`}
                />
              </FormGroup>
            </Col>
          </Row>
        </div>
        <ToolsHorizontalBarChart
          darkMode={darkMode}
          isFullPage={true}
          projectId={selectedProjectId}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
}

export default ToolsAvailabilityPage;
