import { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import styles from './SlideToggle.module.scss';

// eslint-disable-next-line react/function-component-definition
const SlideToggle = ({ color = 'default', onChange, className }) => {
  const [checked, setChecked] = useState(false);

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label className={cn(styles.switch, styles[color], checked && styles.checked, className)}>
      <input
        type="checkbox"
        checked={checked}
        aria-label={`Toggle ${color} switch`}
        onChange={() => {
          onChange(color, !checked);
          setChecked(!checked);
        }}
      />
      <span className={styles.slider} />
    </label>
  );
};

SlideToggle.defaultProps = {
  color: 'default',
  className: '',
};

SlideToggle.propTypes = {
  color: PropTypes.oneOf(['default', 'purple', 'green', 'navy']),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default SlideToggle;
