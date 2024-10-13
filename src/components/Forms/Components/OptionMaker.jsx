import { updateOption, addOption } from 'actions/formActions';
import { useDispatch } from 'react-redux';

export default function OptionMaker({ data }) {
  // options is an array of objects
  // each object has an id and a value
  const dispatch = useDispatch();

  const handleOptionChange = (id, newVal) => {
    // console.log(newVal);
    dispatch(updateOption(data.id, id, { value: newVal }));
  };

  const handleAddOption = () => {
    dispatch(addOption(data.id));
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <div>
        <ul>
          {data.options &&
            data.options.map(option => {
              return (
                <li key={option.id}>
                  <input
                    type="text"
                    value={option.value}
                    onChange={e => handleOptionChange(option.id, e.target.value)}
                  />
                  <button type="button">Delete</button>
                </li>
              );
            })}
        </ul>
        <button type="button" onClick={handleAddOption}>
          Add Option
        </button>
      </div>
    </>
  );
}
