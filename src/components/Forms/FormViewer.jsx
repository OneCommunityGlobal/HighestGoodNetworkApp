import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFormState } from 'actions/formActions';
import QuestionViewer from './Components/QuestionViewer';

export default function FormViewer() {
  const formQuestions = useSelector(state => state.form.questions);
  // console.log(formQuestions);
  const initialFormAnswers = [];
  // set form answers to state
  formQuestions.map(question => {
    initialFormAnswers.push({
      questionId: question.id,
      type: question.type,
      question: question.label,
      answer: '',
    });
    return initialFormAnswers;
  });
  const [formAnwers, SetFormAnswers] = useState(initialFormAnswers);
  // console.log(formAnwers);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFormState());
  }, [dispatch]);

  // alert form data on submit
  const handleSubmit = e => {
    e.preventDefault();
    const presentanleFormAnswers = formAnwers.map(answer => {
      return {
        question: answer.question,
        answer: answer.answer,
      };
    });
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(presentanleFormAnswers));
  };
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <div className="container">
        <h1>Answer this form</h1>
        <form onSubmit={handleSubmit}>
          {formQuestions.map(question => {
            return (
              <QuestionViewer
                key={question.id}
                data={question}
                SetFormAnswers={SetFormAnswers}
                formAnwers={formAnwers}
              />
            );
          })}
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </>
  );
}
