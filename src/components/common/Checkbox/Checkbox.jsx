import './Checkbox.css';

// eslint-disable-next-line import/prefer-default-export, react/function-component-definition
export const Checkbox = ({
  onChange,
  value,
  label,
  id,
  wrapperClassname,
  backgroundColorCN,
  textColorCN,
}) => {
  return (
    <div className={`checkbox-wrapper ${wrapperClassname} ${backgroundColorCN}`}>
      <input
        className="checkbox-input"
        type="checkbox"
        id={id}
        name={id}
        checked={value}
        onChange={onChange}
      />
      <label className={`checkbox-label ${textColorCN}`} htmlFor={id}>
        {label}
      </label>
    </div>
  );
};
