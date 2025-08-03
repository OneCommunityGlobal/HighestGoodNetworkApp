import { GiHollowCat } from 'react-icons/gi';
import './Stub.css';

function Stub({ darkMode }) {
  return (
    <div className="stub-wrapper" data-testid="stub-wrapper">
      <GiHollowCat size={72} data-testid="stub-icon" />
      <div className={`stub-hint ${darkMode ? 'text-light' : ''}`}>
        Nothing&apos;s here at the moment
      </div>
    </div>
  );
}
export default Stub;
