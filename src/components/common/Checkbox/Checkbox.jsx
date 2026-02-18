import styles from './Checkbox.module.css';

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
    <div
      data-testid="checkbox-wrapper"
      className={`${styles.checkboxWrapper} ${wrapperClassname} ${backgroundColorCN}`}
    >
      <input
        className={`${styles.checkboxInput}`}
        type="checkbox"
        id={id}
        name={id}
        checked={value}
        onChange={onChange}
      />
      <label className={`${styles.checkboxLabel} ${textColorCN}`} htmlFor={id}>
        {label}
      </label>
    </div>
  );
};
