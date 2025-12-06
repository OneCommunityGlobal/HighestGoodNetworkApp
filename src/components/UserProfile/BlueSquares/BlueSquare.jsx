import styles from './BlueSquare.module.css';
import hasPermission from '~/utils/permissions';
import { connect } from 'react-redux';
import { formatCreatedDate, formatDate } from '~/utils/formatDate';
import { useEffect } from 'react';


const BlueSquare = (props) => {
  const {
    blueSquares,
    handleBlueSquare,
    hasPermission,
    darkMode
  } = props;

  const canAddInfringements = hasPermission('addInfringements');
  const canEditInfringements = hasPermission('editInfringements');
  const canDeleteInfringements = hasPermission('deleteInfringements');
  const isInfringementAuthorizer = canAddInfringements || canEditInfringements || canDeleteInfringements;

  const handleOnClick = (blueSquare) => {    
    if (!blueSquare._id) {
      handleBlueSquare, darkMode(isInfringementAuthorizer, 'message', 'none');
    } else if (canEditInfringements || canDeleteInfringements) {
      handleBlueSquare(true, 'modBlueSquare', blueSquare._id);
    } else {
      handleBlueSquare(true, 'viewBlueSquare', blueSquare._id);
    }
  };    
  useEffect(() => {
    if (window.location.hash === '#bluesquare') {
      const blueSquareWindow = document.getElementById('bluesquare');
      if (blueSquareWindow) {
        const yOffset = -100;
        const y = blueSquareWindow.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, []);
  return (
    <div id="bluesquare" className={`${styles.blueSquareContainer} ${darkMode ? 'bg-darkmode-liblack' : ''}`}>
      <div className={`${styles.blueSquares} ${blueSquares?.length ? '' : styles.NoBlueSquares}`}>
        {blueSquares?.length ? (
          blueSquares
            .sort((a, b) => (a.date > b.date ? 1 : -1))  // sorting by most recent date(awareded) last
            .map((blueSquare, index) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus, jsx-a11y/no-static-element-interactions
              <div
                key={index}
                role="button"
                id={styles.wrapper}
                data-testid="blueSquare"
                className={styles.blueSquareButton}
                onClick={() => handleOnClick(blueSquare)}
              >
                <div className={`${styles.report} `} data-testid="report">
                  <div className={styles.title}>{formatDate(blueSquare.date)}</div>
                  {blueSquare.description && (
                    <div className={styles.summary}>
                      {blueSquare.createdDate ? `${formatCreatedDate(blueSquare.createdDate)}: ` : ''}
                      {blueSquare.description}
                    </div>
                  )}
                </div>
              </div>
            ))
        ) : (
          <div>No blue squares.</div>
        )}
        {canAddInfringements && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
          <div
            onClick={() => handleBlueSquare(true, 'addBlueSquare', '')}
            className={styles.blueSquareButton}
            color="primary"
            data-testid="addBlueSquare"
          >
            +
          </div>
        )}
      </div>
    </div>
  );
};



export default connect(null, { hasPermission })(BlueSquare);