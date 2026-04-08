import { Form, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import styles from './Login.module.css';
function Login() {
  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.pageTtile}>Highest Good Network</h1>
      <h1 className={styles.pageTtile}> Material Equipemnt Tool Tracker</h1>
      <div className={styles.formContainer}>
        <Form>
          <FontAwesomeIcon icon={faUser} size="3x" />
          <h2>Welcome to HGN</h2>
          <Input type="text" />
          <Input type="text" />
        </Form>
      </div>
    </div>
  );
}
export default Login;
