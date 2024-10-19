import { updateQuestion, deleteQuestion } from 'actions/formActions';
import { useDispatch } from 'react-redux';
import OptionMaker from './OptionMaker';

export default function QuestionMaker({ data }) {
  const dispatch = useDispatch();

  const handleTypeChange = e => {
    dispatch(updateQuestion(data.id, { type: e.target.value }));
  };
  const handleLabelChange = e => {
    dispatch(updateQuestion(data.id, { label: e.target.value }));
  };
  return (
    <div>
      <div>
        <label>
          <input type="text" value={data.label} onChange={handleLabelChange} />
        </label>

        <select value={data.type} onChange={handleTypeChange}>
          <option value="select">Select</option>
          <option value="short_answer">Short Answer</option>
          <option value="paragraph">Paragraph</option>
          <option value="multi_select">Multi-Select</option>
          <option value="radio">Radio</option>
        </select>
        <button type="button" onClick={() => dispatch(deleteQuestion(data.id))}>
          Delete
        </button>
      </div>

      <div>
        {data.type === 'paragraph' && <textarea id={data.id} disabled />}
        {data.type === 'short_answer' && <input type="text" id={data.id} disabled />}
        {data.type === 'multi_select' && <OptionMaker data={data} />}
        {data.type === 'radio' && <OptionMaker data={data} />}
      </div>
    </div>
  );
}
