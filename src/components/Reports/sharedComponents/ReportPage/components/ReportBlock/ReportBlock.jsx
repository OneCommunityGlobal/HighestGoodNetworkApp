import classnames from 'classnames';
import styles from './ReportBlock.module.css';

export function ReportBlock({ className, children, firstColor, secondColor, darkMode }) {
  const color = secondColor
    ? `linear-gradient(to bottom right, ${firstColor}, ${secondColor})`
    : firstColor;

  let backgroundColor;
  if (secondColor) {
    backgroundColor = color;
  } else if (darkMode) {
    backgroundColor = '#3A506B';
  } else {
    backgroundColor = firstColor || 'white';
  }

  return (
    <div
      className={classnames(
        `${darkMode ? styles["report-block-wrapper-dark"] : styles["report-block-wrapper"]}`,
        className,
      )}
      data-testid="report-block-wrapper"
      role="generic"
    >
      <div
        className={styles["report-block-content"]}
        data-testid="report-block-content"
        style={{ background: backgroundColor }}
      >
        {children}
      </div>
    </div>
  );
}
