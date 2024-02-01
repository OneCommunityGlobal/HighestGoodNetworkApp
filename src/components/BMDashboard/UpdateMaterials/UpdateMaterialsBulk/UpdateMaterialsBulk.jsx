import './UpdateMaterialsBulk.css';
import { Container } from 'reactstrap';
import { useState } from 'react';
import moment from 'moment';
import UpdateMaterialsBulkTable from './UpdateMaterialsBulkTable';
import UpdateMaterialsBulkInputs from './UpdateMaterialsBulkInputs';

function UpdateMaterialsBulk() {
  const [date, setDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [project, setProject] = useState('All Projects');
  return (

    <Container fluid className="logMaterialContainer">
      <div className="logMaterialPage">
        <div className="logMaterial">
          <div className="logMaterialTitle">MATERIAL DAILY ACTIVITIES UPDATE FORM</div>
          <UpdateMaterialsBulkInputs
            project={project}
            setProject={setProject}
            date={date}
            setDate={setDate}
          />
          <UpdateMaterialsBulkTable
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

export default UpdateMaterialsBulk;
