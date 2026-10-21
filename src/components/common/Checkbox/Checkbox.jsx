import PropTypes from 'prop-types';
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
  darkMode,
}) => {
  return (
    <div
      data-testid="checkbox-wrapper"
      className={`${
        darkMode ? styles.checkboxWrapperDark : styles.checkboxWrapper
      } ${wrapperClassname || ''} ${backgroundColorCN || ''}`}
    >
      <input
        className={`${styles.checkboxInput}`}
        type="checkbox"
        id={id}
        name={id}
        checked={value}
        onChange={onChange}
      />
      <label
        className={`${styles.checkboxLabel} ${
          darkMode ? styles.checkboxLabelDark : ''
        } ${textColorCN || ''}`}
        htmlFor={id}
      >
        {label}
      </label>
    </div>
  );
};

Checkbox.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.bool,
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  wrapperClassname: PropTypes.string,
  backgroundColorCN: PropTypes.string,
  textColorCN: PropTypes.string,
  darkMode: PropTypes.bool,
};

Checkbox.defaultProps = {
  wrapperClassname: '',
  backgroundColorCN: '',
  textColorCN: '',
  darkMode: false,
};
