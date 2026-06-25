import { Container } from 'reactstrap';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import UpdateReusablesBulkTable from './UpdateReusablesBulkTable';
import UpdateReusablesBulkInputs from './UpdateReusablesBulkInputs';
import styles from './UpdateReusablesBulk.module.css';

function UpdateReusablesBulk() {
  const [date, setDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [project, setProject] = useState('All Projects');
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <Container fluid className={`${styles.logReusableContainer}`}>
      <div className={`${styles.logReusablePage} ${darkMode ? styles.logReusablePageDark : ''}`}>
        <div className={`${styles.logReusable} ${darkMode ? styles.logReusableDark : ''}`}>
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
