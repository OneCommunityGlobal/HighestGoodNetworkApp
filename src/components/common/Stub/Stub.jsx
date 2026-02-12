import { GiHollowCat } from 'react-icons/gi';
import styles from './Stub.module.css';

function Stub({ darkMode }) {
  return (
    <div className={`${styles.stubWrapper}`} data-testid="stub-wrapper">
      <GiHollowCat size={72} data-testid="stub-icon" />
      <div className={`stub-hint ${darkMode ? 'text-light' : ''}`}>
        Nothing&apos;s here at the moment
      </div>
    </div>
  );
}
export default Stub;
