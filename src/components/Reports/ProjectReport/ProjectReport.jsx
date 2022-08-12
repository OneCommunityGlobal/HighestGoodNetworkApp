import { useEffect, useState } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from 'reactstrap';
import { FiBox } from 'react-icons/fi';
import { getProjectDetail } from '../../../actions/project';
import { fetchAllMembers } from '../../../actions/projectMembers';
import { fetchAllWBS } from '../../../actions/wbs';
import ProjectMemberTable from '../ProjectMemberTable';
import { ReportPage } from '../sharedComponents/ReportPage';
import WbsTable from '../WbsTable';
import { projectReportViewData } from './selectors';
import '../../Teams/Team.css';

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
    <ReportPage renderProfile={() => <ReportPage.ReportHeader isActive={isActive} avatar={<FiBox />} name={projectName} />}>
      <ReportPage.ReportBlock>
        <div className="container">
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
      </ReportPage.ReportBlock>
    </ReportPage>
  );
};
