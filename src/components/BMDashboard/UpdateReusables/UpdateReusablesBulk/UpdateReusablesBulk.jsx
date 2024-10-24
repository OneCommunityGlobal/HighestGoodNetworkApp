import './UpdateReusablesBulk.css';
import { Container } from 'reactstrap';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import UpdateReusablesBulkTable from './UpdateReusablesBulkTable';
import UpdateReusablesBulkInputs from './UpdateReusablesBulkInputs';

function UpdateReusablesBulk() {
  const [date, setDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [project, setProject] = useState('All Projects');
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/bmdashboard/reusables/update')) {
      document.title = 'Reusables Daily Activities Update Form';
    }
  }, [location]);
  return (
    <Container fluid className="logReusableContainer">
      <div className="logReusablePage">
        <div className="logReusable">
          <div className="logReusableTitle">MATERIAL DAILY ACTIVITIES UPDATE FORM</div>
          <UpdateReusablesBulkInputs
            project={project}
            setProject={setProject}
            date={date}
            setDate={setDate}
          />
          <UpdateReusablesBulkTable
            project={project}
            setDate={setDate}
            setProject={setProject}
            date={date}
          />
        </div>
      </div>
    </Container>
  );
}

export default UpdateReusablesBulk;
