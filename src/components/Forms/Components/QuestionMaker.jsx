// // This component is part of the form builder

// import { QuestionType } from 'utils/enums';
// import OptionMaker from './OptionMaker';

// export default function QuestionMaker({ data, updateQuestion }) {
//   const handleTypeChange = e => {
//     updateQuestion(data.id, { type: e.target.value });
//   };

//   return (
//     // eslint-disable-next-line react/jsx-no-useless-fragment
//     <>
//       <div>
//         <div>
//           <label>
//             <input
//               type="text"
//               value={data.label}
//               onChange={e => updateQuestion(data.id, { label: e.target.value })}
//             />
//           </label>

//           <select value={data.type} onChange={handleTypeChange}>
//             <option value="select">Select</option>
//             <option value="short_answer">Short Answer</option>
//             <option value="paragraph">Paragraph</option>
//             <option value="multi_select">Multi-Select</option>
//             <option value="radio">Radio</option>
//           </select>
//         </div>

//         <div>
//           {data.type === QuestionType.Paragraph && <textarea id={data.id} disabled />}
//           {data.type === QuestionType.ShortAnswer && <input type="text" id={data.id} disabled />}
//           {data.type === QuestionType.MultiSelect && (
//             <OptionMaker data={data} updateQuestion={updateQuestion} />
//           )}
//           {data.type === QuestionType.Radio && (
//             <OptionMaker data={data} updateQuestion={updateQuestion} />
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// Using Redux
import { updateQuestion } from 'actions/formActions';
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
