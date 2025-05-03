import './UpdateReusablesBulk.css';
import { Container } from 'reactstrap';
import { useState } from 'react';
import moment from 'moment';
import UpdateReusablesBulkTable from './UpdateReusablesBulkTable';
import UpdateReusablesBulkInputs from './UpdateReusablesBulkInputs';

function UpdateReusablesBulk() {
  const [date, setDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [project, setProject] = useState('All Projects');
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
