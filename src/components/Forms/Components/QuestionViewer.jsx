import OptionViewer from './OptionViewer';

export default function QuestionViewer({ data }) {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <div>
        <label>{data.label}</label>
        {data.type === 'short_answer' && <input type="text" id={data.id} />}
        {data.type === 'paragraph' && <textarea id={data.id} />}
        {data.type === 'multi_select' && <OptionViewer data={data} />}
        {data.type === 'radio' && <OptionViewer data={data} />}
      </div>
    </>
  );
}
