import { Form, Input, Button } from 'reactstrap';
import { User, Lock } from 'lucide-react';
import styles from './Login.module.css';
function Login() {
  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.pageTitle}>Highest Good Network</h1>
      <h1 className={styles.pageTitle}> Material Equipemnt Tool Tracker</h1>
      <div className={styles.formContainer}>
        <Form>
          <User size="70" strokeWidth={1.5} aria-hidden="true" />
          <h2 className={styles.heading2}>Welcome to HGN</h2>
          <div className={styles.inputWrapper}>
            <User size="30" strokeWidth={1.5} aria-hidden="true" />
            <Input
              type="text"
              placeholder="username"
              name="username"
              className={styles.inputBox}
              aria-label="Username input field"
            />
          </div>
          <div className={styles.inputWrapper}>
            <Lock size="25" strokeWidth={1.5} aria-hidden="true" />
            <Input
              type="password"
              placeholder="password"
              name="password"
              className={styles.inputBox}
              aria-label="password input field"
            />
          </div>
          <div className={styles.forgetPswd}>
            <a href="https://www.highestgood.com/forgotpassword">Forgot your password?</a>
          </div>
          <div>
            <Button className={styles.logInBtn}>Login</Button>
          </div>
          <div>
            <p className={styles.infoSec}>If you do not have login info,</p>
            <p className={styles.infoSec}>contact the admin(adminEmail@xxx.com)</p>
          </div>
        </Form>
      </div>
    </div>
  );
}
export default Login;
