import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './style.css';


const CopyToClipboard = ({
    textName, 
    message
  }) => {

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(textName)
        toast.success(message)
    }
    
    return (
        <FontAwesomeIcon 
            className="copy-to-clipboard"
            icon={faCopy}
            onClick={handleCopyToClipboard}
        />
    );
};

export default CopyToClipboard;

