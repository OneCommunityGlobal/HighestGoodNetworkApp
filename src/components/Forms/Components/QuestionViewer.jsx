import dompurify from 'dompurify';
import OptionViewer from './OptionViewer';

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
      <div className="border border-primary m-2 p-3 bg-light">
        <div className="mb-2 bg-info pl-1">
          <label className="text-white mb-0">{data.label}</label>
        </div>
        {/* eslint-disable-next-line react/no-danger */}
        <div className="mb-2" dangerouslySetInnerHTML={{ __html: sanitizer(data.description) }} />
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
