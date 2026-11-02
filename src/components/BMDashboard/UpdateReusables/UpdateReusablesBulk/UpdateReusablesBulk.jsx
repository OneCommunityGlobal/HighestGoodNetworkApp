import { Container } from 'reactstrap';
import { useState } from 'react';
import moment from 'moment';
import UpdateReusablesBulkTable from './UpdateReusablesBulkTable';
import UpdateReusablesBulkInputs from './UpdateReusablesBulkInputs';
import styles from './UpdateReusablesBulk.module.css';

function UpdateReusablesBulk() {
  const [date, setDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [project, setProject] = useState('All Projects');
  return (
    <Container fluid className={`${styles.logReusableContainer}`}>
      <div className={`${styles.logReusablePage}`}>
        <div className={`${styles.logReusable}`}>
          <div className={`${styles.logReusableTitle}`}>MATERIAL DAILY ACTIVITIES UPDATE FORM</div>
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
