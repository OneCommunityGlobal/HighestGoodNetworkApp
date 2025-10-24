import { getFormState } from 'actions/formActions';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addQuestion, resetFormState } from 'actions/formActions';
import QuestionMaker from './Components/QuestionMaker';

export default function FormEditor() {
  const formQuestions = useSelector(state => state.form.questions);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFormState());
  }, [dispatch]);
  // console.log(formQuestions);
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <div className="container-fluid">
        <h1>Form Builder</h1>
        {/* <h2>Untitled Form</h2>
        <h3>summary</h3> */}
        <div className="m-5 ">
          {formQuestions.map(question => {
            if (question !== null && question !== undefined)
              return <QuestionMaker key={question.id} data={question} />;
            return null;
          })}
          <button
            type="button"
            className="btn btn-primary m-1"
            onClick={() => dispatch(addQuestion())}
          >
            Add question
          </button>
          <div>
            <button
              type="button"
              className="btn btn-danger m-1"
              onClick={() => dispatch(resetFormState())}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
