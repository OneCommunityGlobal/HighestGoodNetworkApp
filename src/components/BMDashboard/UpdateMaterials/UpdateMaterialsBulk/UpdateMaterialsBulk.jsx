import { Container } from 'reactstrap';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import UpdateMaterialsBulkTable from './UpdateMaterialsBulkTable';
import UpdateMaterialsBulkInputs from './UpdateMaterialsBulkInputs';
import styles from './UpdateMaterialsBulk.module.css';

function UpdateMaterialsBulk() {
  const [date, setDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [project, setProject] = useState('All Projects');
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <Container fluid className={`${styles.logMaterialContainer}`}>
      <div className={`${styles.logMaterialPage} ${darkMode ? styles.logMaterialPageDark : ''}`}>
        <div className={`${styles.logMaterial} ${darkMode ? styles.logMaterialDark : ''}`}>
          <div className={`${styles.logMaterialTitle}`}>MATERIAL DAILY ACTIVITIES UPDATE FORM</div>
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
