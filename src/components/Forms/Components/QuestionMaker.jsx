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
    <div className="shadow-sm rounded row border border-primary mb-2 p-2">
      <div className="row w-100 ml-2">
        <div className="col mb-1 mt-1 d-flex flex-row-reverse w-100">
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => dispatch(deleteQuestion(data.id))}
          >
            Delete
          </button>
        </div>
      </div>
      {/* <div className="row w-100 ml-2">
        <div className="col">
          <label>
            <input
              type="text"
              className="form-control"
              value={data.label}
              placeholder="Enter a Question"
              onChange={handleLabelChange}
            />
          </label>
        </div>

        <div className="col d-flex flex-row-reverse">
          <select className="form-select" value={data.type} onChange={handleTypeChange}>
            <option value="select">Select</option>
            <option value="short_answer">Short Answer</option>
            <option value="paragraph">Paragraph</option>
            <option value="multi_select">Multi-Select</option>
            <option value="radio">Radio</option>
          </select>
        </div>
      </div> */}
      <div className="input-group mb-1 mt-1">
        <input
          type="text"
          className="form-control"
          value={data.label}
          placeholder="Enter a Question"
          onChange={handleLabelChange}
        />
        <select className="form-select" value={data.type} onChange={handleTypeChange}>
          <option value="select">Select</option>
          <option value="short_answer">Short Answer</option>
          <option value="paragraph">Paragraph</option>
          <option value="multi_select">Multi-Select</option>
          <option value="radio">Radio</option>
        </select>
      </div>

      <div className="row w-100 ml-2 ">
        <div className="col">
          {data.type === 'paragraph' && (
            <textarea className="form-control m-1" id={data.id} disabled />
          )}
          {data.type === 'short_answer' && (
            <input type="text" className="form-control m-1" id={data.id} disabled />
          )}
          {data.type === 'multi_select' && <OptionMaker data={data} />}
          {data.type === 'radio' && <OptionMaker data={data} />}
        </div>
      </div>
      <div className="row w-100 ml-2">
        <div className="col mb-1">
          <div>
            <input
              className="form-check-input mb-1"
              value="required"
              type="checkbox"
              checked={data.required}
              onChange={() => dispatch(updateQuestion(data.id, { required: !data.required }))}
            />
          </div>
          <div>
            <label className="form-check-label">Required</label>
          </div>
        </div>
      </div>
    </div>
  );
}
