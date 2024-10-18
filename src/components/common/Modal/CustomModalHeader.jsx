import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-regular-svg-icons';
import { useSelector } from 'react-redux';

function CustomModalHeader({ title, toggle, children }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div
      className={`rounded-top rounded-top-left rounded-top-right ${
        darkMode ? 'bg-space-cadet text-light' : ''
      }`}
    >
      <div className="d-flex justify-content-between align-items-center w-100 p-3">
        <div className="d-flex align-items-center">
          <h4 className={darkMode ? 'text-light' : 'text-dark'}>{title}</h4>
          {children}
        </div>
        {toggle ? (
          <button type="button" className={darkMode ? 'text-light' : ''} onClick={() => toggle()}>
            <FontAwesomeIcon size="lg" icon={faWindowClose} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default CustomModalHeader;
