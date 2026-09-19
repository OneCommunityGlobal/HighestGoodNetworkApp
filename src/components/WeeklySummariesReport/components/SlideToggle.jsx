import { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import styles from './SlideToggle.module.scss';

// eslint-disable-next-line react/function-component-definition
const SlideToggle = ({ color = 'default', className = '', onChange, checked: checkedProp }) => {
  const [internalChecked, setInternalChecked] = useState(false);

  // Controlled when a `checked` prop is supplied, uncontrolled otherwise so that
  // existing call sites that only pass `onChange` keep working unchanged.
  const isControlled = checkedProp !== undefined;
  const checked = isControlled ? checkedProp : internalChecked;

  return (
    <label className={cn(styles.switch, styles[color], checked && styles.checked, className)}>
      <span className="sr-only">Enable dark mode</span> {/* Hidden but accessible */}
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {
          onChange(color, !checked);
          if (!isControlled) {
            setInternalChecked(!checked);
          }
        }}
      />
      <span className={styles.slider} />
    </label>
  );
};

SlideToggle.propTypes = {
  color: PropTypes.oneOf(['default', 'purple', 'green', 'navy']),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  checked: PropTypes.bool,
};

export default SlideToggle;
