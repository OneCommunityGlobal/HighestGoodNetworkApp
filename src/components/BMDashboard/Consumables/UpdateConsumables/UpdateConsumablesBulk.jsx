import './UpdateConsumablesBulk.css';
import { Container } from 'reactstrap';
import { useState } from 'react';
import moment from 'moment';
import UpdateConsumablesBulkTable from './UpdateConsumablesBulkTable';
import UpdateConsumablesBulkInputs from './UpdateConsumablesBulkInputs';

function UpdateConsumablesBulk() {
  const [date, setDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [project, setProject] = useState('All Projects');
  return (
    <Container fluid className="logMaterialContainer">
      <div className="logMaterialPage">
        <div className="logMaterial">
          <div className="logMaterialTitle">CONSUMABLES BULK UPDATE FORM</div>
          <UpdateConsumablesBulkInputs
            project={project}
            setProject={setProject}
            date={date}
            setDate={setDate}
          />
          <UpdateConsumablesBulkTable
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

export default UpdateConsumablesBulk;

