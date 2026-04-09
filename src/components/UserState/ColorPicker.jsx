import PropTypes from 'prop-types';
import { COLOR_SWATCHES } from './constants';
import styles from './UserState.module.css';

function ColorPicker({ selectedColor, onSelect }) {
  return (
    <div className={styles.colorPickerWrapper}>
      <span className={styles.colorPickerLabel}>Color:</span>
      {COLOR_SWATCHES.map(swatch => (
        <button
          key={swatch.hex}
          type="button"
          title={swatch.label}
          onClick={() => onSelect(swatch.hex)}
          className={styles.colorSwatch}
          style={{
            background: swatch.hex,
            border: selectedColor === swatch.hex ? '3px solid #000' : '2px solid transparent',
            outline: selectedColor === swatch.hex ? '2px solid #fff' : 'none',
            outlineOffset: '-4px',
          }}
        />
      ))}
    </div>
  );
}

ColorPicker.propTypes = {
  selectedColor: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ColorPicker;
