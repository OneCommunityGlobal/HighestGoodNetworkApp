import { useRef } from 'react';

function OptionMaker({ data, updateQuestion }) {
  const inputRefs = useRef([]);
  const handleListAdd = () => {
    updateQuestion(data.id, { list: [...data.list, 'new option'] });
  };
  const handleListChange = (index, value) => {
    const updatedList = [...data.list];
    updatedList[index] = value;
    updateQuestion(data.id, { list: updatedList });
  };
  const handleListRemove = index => {
    const updatedList = [...data.list];
    updatedList.splice(index, 1);
    updateQuestion(data.id, { list: updatedList });
  };

  return (
    <div>
      {data.list.map((option, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <input
              ref={el => {
                inputRefs.current[index] = el;
              }} // Store refs to manage focus
              type="text"
              value={option}
              onChange={e => handleListChange(index, e.target.value)}
            />
            <button type="button" onClick={() => handleListRemove(index)}>
              Remove
            </button>
          </div>
        );
      })}
      <button type="button" onClick={() => handleListAdd()}>
        Add option
      </button>
    </div>
  );
}

export default OptionMaker;
