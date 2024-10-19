import { QuestionType } from 'utils/enums';

export default function OptionViewer({ data }) {
  console.log(data);
  return (
    <div>
      {data.options.map(option => {
        return (
          <div key={option.id}>
            <input
              type={data.type === QuestionType.Radio ? 'radio' : 'checkbox'}
              id={option.value}
              value={option.value}
              name={data.id}
            />
            <label htmlFor={option.value}>{option.value}</label>
          </div>
        );
      })}
    </div>
  );
}
