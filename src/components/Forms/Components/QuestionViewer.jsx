import dompurify from 'dompurify';
import PropTypes from 'prop-types';
import OptionViewer from './OptionViewer';
import styles from '../formsPage.module.css';

export default function QuestionViewer({ data, SetFormAnswers, formAnwers }) {
  const handleAnswerChange = (e, questionId) => {
    const newFormAnswers = formAnwers.map(answer => {
      if (answer.questionId === questionId) {
        return {
          ...answer,
          answer: e.target.value,
        };
      }
      return answer;
    });
    SetFormAnswers(newFormAnswers);
  };
  const sanitizer = dompurify.sanitize;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <div className={styles.viewerCard}>
        <div className={styles.questionLabelBar}>
          <label className="mb-0">{data.label}</label>
        </div>
        {/* eslint-disable-next-line react/no-danger */}
        <div
          className={styles.viewerDescription}
          dangerouslySetInnerHTML={{ __html: sanitizer(data.description) }}
        />
        <div>
          {data.type === 'short_answer' && (
            <input
              className="form-control"
              type="text"
              id={data.id}
              required={data.required}
              onChange={e => handleAnswerChange(e, data.id)}
            />
          )}
          {data.type === 'paragraph' && (
            <textarea
              className="form-control"
              id={data.id}
              required={data.required}
              onChange={e => handleAnswerChange(e, data.id)}
            />
          )}
          {(data.type === 'multi_select' || data.type === 'radio') && (
            <OptionViewer data={data} SetFormAnswers={SetFormAnswers} formAnwers={formAnwers} />
          )}
        </div>
      </div>
    </>
  );
}

QuestionViewer.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string.isRequired,
    required: PropTypes.bool,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        value: PropTypes.string,
      }),
    ),
  }).isRequired,
  SetFormAnswers: PropTypes.func.isRequired,
  formAnwers: PropTypes.arrayOf(
    PropTypes.shape({
      questionId: PropTypes.string.isRequired,
      type: PropTypes.string,
      question: PropTypes.string,
      answer: PropTypes.string,
    }),
  ).isRequired,
};
