import { Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { getQuestionnaireLink } from './questionnaireLink';

// Copies the permanent questionnaire link so admins can share it with eligible people.
function CopyQuestionnaireLinkButton({ className = '', size = 'sm', color = 'secondary' }) {
  const link = getQuestionnaireLink();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Questionnaire link copied');
    } catch {
      toast.error(`Could not copy the link. Please copy it manually: ${link}`);
    }
  };

  return (
    <Button
      type="button"
      color={color}
      size={size}
      className={className}
      onClick={handleCopy}
      title={link}
    >
      <FontAwesomeIcon icon={faLink} className="mr-1" />
      Copy questionnaire link
    </Button>
  );
}

export default CopyQuestionnaireLinkButton;
