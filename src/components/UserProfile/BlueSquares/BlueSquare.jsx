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

  const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  
  const toSortableDay = (d) => {
    if (!d) return Number.POSITIVE_INFINITY;
  
    const s = String(d).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, day] = s.split("-").map(Number);
      return new Date(y, m - 1, day, 0, 0, 0, 0).getTime();
    }

    const m = s.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b\s+(\d{1,2})\s+(\d{4})\b/);
    if (m) {
      const [, mon, dd, yyyy] = m;
      return new Date(Number(yyyy), monthMap[mon], Number(dd), 0, 0, 0, 0).getTime();
    }
  
    const t = Date.parse(s);
    return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
  };
  
  const sortedBlueSquares = [...(blueSquares || [])].sort((a, b) => {
    const ta = toSortableDay(a?.date);
    const tb = toSortableDay(b?.date);
  
    if (ta !== tb) return ta - tb;
  
    return String(a?._id || "").localeCompare(String(b?._id || ""));
  });
  

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
          sortedBlueSquares
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