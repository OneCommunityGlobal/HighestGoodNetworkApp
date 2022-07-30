import { useEffect, useState } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from 'reactstrap';
import { getProjectDetail } from '../../../actions/project';
import { fetchAllMembers } from '../../../actions/projectMembers';
import { fetchAllWBS } from '../../../actions/wbs';
import ProjectMemberTable from '../ProjectMemberTable';
import { ReportHeader } from "../sharedComponents/ReportHeader";
import '../../Teams/Team.css';
import WbsTable from '../WbsTable';
import { projectReportViewData } from './selectors';

export const ProjectReport = ({ match }) => {

  const dispatch = useDispatch();
  const { wbs, projectMembers, isActive, projectName, isLoading } = useSelector(projectReportViewData);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (match) {
      dispatch(getProjectDetail(match.params.projectId));
      dispatch(fetchAllWBS(match.params.projectId));
      dispatch(fetchAllMembers(match.params.projectId));
    }
  }, []);

    return (
      <div>
        <ReportHeader isActive>
          <h3>
            {projectName}
          </h3>
        </ReportHeader>
        <Container fluid className="bg--white py-3 mb-5">
        <div className="container">
          <DropdownButton id="dropdown-basic-button" title="Time Frame">
            <Dropdown.Item href="#/action-1">Past Week</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Past Two Weeks</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Past Month</Dropdown.Item>
            <Dropdown.Item href="#/action-4">Past 6 Months</Dropdown.Item>
            <Dropdown.Item href="#/action-5">Past Year</Dropdown.Item>
            <Dropdown.Item href="#/action-6" onClick={() => setShowDatePicker(!showDatePicker)}>
              Custom range
            </Dropdown.Item>
          </DropdownButton>
          <div>
            {showDatePicker && (
              <div>
                From:{' '}
                <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
                To: <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
              </div>
            )}
          </div>
          <WbsTable wbs={wbs} />
          <ProjectMemberTable projectMembers={projectMembers} />
        </div>
      </Container>
      </div>
    );
};
