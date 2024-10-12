export default function Question(props) {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <div>
        <div>
          <label>{props.label}</label>
          <select>
            <option value="select">Select</option>
            <option value="short_answer">Short Answer</option>
            <option value="paragraph">Paragraph</option>
            <option value="multi_select">Multi-Select</option>
            <option value="radio">Radio</option>
          </select>
        </div>
        <div>Input Fieds go here</div>
      </div>
    </>
  );
}
