/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/button-has-type */
import { useState } from 'react';
import Question from './Components/Question';

export default function FormEditor() {
  const [formQuestions, setFormQuestions] = useState([]);
  const addQuestion = () => {
    const question = {
      name: `question_${formQuestions.length}`,
      label: 'untitled question',
      type: 'short_answer',
      list: [],
    };
    setFormQuestions([...formQuestions, question]);
  };
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <h1>Form Builder</h1>
      <h2>Untitled Form</h2>
      <h3>summary</h3>
      <div className="m-5 ">
        {formQuestions.map(question => {
          // eslint-disable-next-line react/no-array-index-key
          return <Question {...question} key={question.name} />;
        })}
        <button onClick={() => addQuestion()}>Add question</button>
      </div>
    </>
  );
}
