import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import styles from './style.module.css';

// eslint-disable-next-line react/function-component-definition
const CopyToClipboard = ({ writeText, message }) => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(writeText);
    toast.success(message);
  };

  return (
    <FontAwesomeIcon
      className={`${styles.copyToClipboard}`}
      icon={faCopy}
      onClick={handleCopyToClipboard}
      color={darkMode ? 'lightgrey' : ''}
    />
  );
};

export default CopyToClipboard;
