import { QuestionType } from '~/utils/enums';
import PropTypes from 'prop-types';

export default function OptionViewer({ data, SetFormAnswers, formAnwers }) {
  // console.log(data);
  const handleAnswerChange = (e, questionId) => {
    const newFormAnswers = formAnwers.map(answer => {
      if (answer.questionId === questionId) {
        if (data.type === QuestionType.MultiSelect) {
          const options = answer.answer.split(',');
          if (e.target.checked) {
            options.push(e.target.value);
          } else {
            const index = options.indexOf(e.target.value);
            if (index > -1) {
              options.splice(index, 1);
            }
          }
          return {
            ...answer,
            answer: options.join(','),
          };
        }

        return {
          ...answer,
          answer: e.target.value,
        };
      }
      return answer;
    });
    SetFormAnswers(newFormAnswers);
  };

  return (
    <div>
      {data.options.map(option => {
        return (
          <div key={option.id}>
            <input
              className="mr-2"
              type={data.type === QuestionType.Radio ? 'radio' : 'checkbox'}
              id={option.value}
              value={option.value}
              name={data.id}
              onChange={e => handleAnswerChange(e, data.id)}
            />
            <label htmlFor={option.value}>{option.value}</label>
          </div>
        );
      })}
    </div>
  );
}

OptionViewer.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        value: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
  SetFormAnswers: PropTypes.func.isRequired,
  formAnwers: PropTypes.arrayOf(
    PropTypes.shape({
      questionId: PropTypes.string.isRequired,
      answer: PropTypes.string,
    }),
  ).isRequired,
};
