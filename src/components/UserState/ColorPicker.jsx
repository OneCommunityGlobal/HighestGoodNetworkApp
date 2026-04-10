import PropTypes from 'prop-types';
import { COLOR_SWATCHES } from './constants';
import styles from './UserState.module.css';

function ColorPicker({ selectedColor, onSelect, usedColors = [] }) {
  return (
    <div className={styles.colorPickerWrapper}>
      <span className={styles.colorPickerLabel}>Color:</span>
      <div>
        <div className={styles.swatchesRow}>
          {COLOR_SWATCHES.map(swatch => {
            const isUsed = usedColors.includes(swatch.hex);
            const isSelected = selectedColor === swatch.hex;
            return (
              <div key={swatch.hex} className={styles.swatchWrapper}>
                <button
                  type="button"
                  title={isUsed ? `${swatch.label} (already in use)` : swatch.label}
                  onClick={() => onSelect(swatch.hex)}
                  className={styles.colorSwatch}
                  style={{
                    background: swatch.hex,
                    border: isSelected ? '3px solid #000' : '2px solid transparent',
                    outline: isSelected ? '2px solid #fff' : 'none',
                    outlineOffset: '-4px',
                  }}
                />
                {isUsed && (
                  <span className={styles.swatchUsedDot} title="Already in use">
                    ●
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {usedColors.includes(selectedColor) && (
          <p className={styles.colorWarning}>⚠️ This color is already used by another state.</p>
        )}
      </div>
    </div>
  );
}

ColorPicker.propTypes = {
  selectedColor: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  usedColors: PropTypes.arrayOf(PropTypes.string),
};

ColorPicker.defaultProps = {
  usedColors: [],
};

export default ColorPicker;
