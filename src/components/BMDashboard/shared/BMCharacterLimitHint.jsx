import PropTypes from 'prop-types';
import { FormText } from 'reactstrap';

export default function BMCharacterLimitHint({ limit, length, summary }) {
  return (
    <FormText
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <span>{summary || `Max ${limit} characters`}</span>
      <span aria-live="polite">{limit - length} characters left</span>
    </FormText>
  );
}

BMCharacterLimitHint.propTypes = {
  limit: PropTypes.number.isRequired,
  length: PropTypes.number.isRequired,
  summary: PropTypes.string,
};
