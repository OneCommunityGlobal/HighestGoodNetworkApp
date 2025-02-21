import { useDispatch } from 'react-redux';
import { addOption, deleteOption, updateOption } from 'actions/formActions';

export default function OptionMaker({ data }) {
  const dispatch = useDispatch();

  const handleOptionChange = (optionId, e) => {
    dispatch(updateOption(data.id, optionId, { value: e.target.value }));
  };

  return (
    <div>
      {data.options.map(option => (
        <div key={option.id} className="mt-1 mb-1 input-group">
          <input
            type="text"
            className="form-control"
            value={option.value}
            placeholder="Enter an option"
            onChange={e => handleOptionChange(option.id, e)}
          />
          <button
            type="button"
            className="btn btn-danger btn-sm ml-1"
            onClick={() => dispatch(deleteOption(data.id, option.id))}
          >
            Delete
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-primary mt-1 mb-1"
        onClick={() => dispatch(addOption(data.id))}
      >
        Add Option
      </button>
    </div>
  );
}
