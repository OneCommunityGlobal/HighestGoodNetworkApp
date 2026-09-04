import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import logo from '../../../../assets/images/logo2.webp';
import mastermap from '../../../../assets/images/masterMap.webp';
import mapRouter from '../../../../assets/images/routeMarker.webp';
import pin from '../../../../assets/images/pin-point.webp';
import styles from './MasterPlan.module.css';
import { getVillageDropdownFilterData } from '~/actions/lbdashboard/villageDetailsAction';

const PIN_HIDDEN_STYLE = { display: 'none' };

function getVillageMarkerStyle(position) {
  return {
    '--top': position.top,
    '--left': position.left,
  };
}

function getPinStyle(village) {
  if (!village) return PIN_HIDDEN_STYLE;
  return {
    '--top': village.position.top,
    '--left': village.position.left,
    display: 'block',
  };
}

function getVillageButtonClassName(selectedVillage, village, styleModule) {
  const isSelected = selectedVillage?._id === village._id;
  return isSelected ? `${styleModule.selected} ${styleModule.village}` : styleModule.village;
}

const VILLAGE_BUTTON_STYLE = {
  padding: '0 10px',
  textAlign: 'center',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

function MasterPlan() {
  const [selectedVillage, setSelectedVillage] = useState(null);
  const history = useHistory();
  const dispatch = useDispatch();
  const villages = useSelector(state => state.villageDetails.villages || []);
  const darkMode = useSelector(state => state.theme.darkMode);
  const dm = darkMode ? styles.dark : '';

  useEffect(() => {
    dispatch(getVillageDropdownFilterData());
  }, [dispatch]);

  const handleVillageClick = useCallback(
    village => {
      if (selectedVillage && selectedVillage._id === village._id) {
        const slug = village.name.replace(/\s+/g, '-');
        history.push(`/lbdashboard/village/${slug}?id=${village._id}`);
      } else {
        setSelectedVillage(village);
      }
    },
    [selectedVillage, history],
  );

  const handleOutsideClick = useCallback(() => {
    setSelectedVillage(null);
  }, []);

  const handleOutsideKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === ' ') handleOutsideClick();
    },
    [handleOutsideClick],
  );

  const handleMarkerClick = useCallback(
    (e, village) => {
      e.stopPropagation();
      handleVillageClick(village);
    },
    [handleVillageClick],
  );

  return (
    <div
      className={`${styles.mainContainer} ${dm}`}
      onClick={handleOutsideClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleOutsideKeyDown}
    >
      <div className={styles.logoContainer}>
        <img src={logo} alt="One Community Logo" />
      </div>

      <div className={`${styles.contentContainer} ${dm}`}>
        <div className={styles.containerTop} />
        <div className={styles.containerMain}>
          <div className={styles.containerMap}>
            <div className={styles.mapDetails}>
              <div className={styles.map}>
                <div className={styles.imageWrapper}>
                  <img src={mastermap} alt="Master Map" />
                  {villages.map(v => (
                    <button
                      key={v._id}
                      style={getVillageMarkerStyle(v.position)}
                      className={styles.villageMarker}
                      type="button"
                      aria-label={`Marker for ${v.name}`}
                      onClick={e => handleMarkerClick(e, v)}
                    />
                  ))}
                  <img
                    src={pin}
                    alt="Pin Point"
                    className={styles.pinPoint}
                    style={getPinStyle(selectedVillage)}
                  />
                </div>
              </div>
              <div className={styles.route}>
                <img src={mapRouter} alt="Route Marker" />
                <p>
                  Click on the village marker or on the village to select a village and view more
                  details.
                </p>
                <p>Click again to view the village Page.</p>
              </div>
            </div>

            <div className={styles.villages}>
              {villages.map(v => (
                <button
                  key={v._id}
                  type="button"
                  aria-label={`Select ${v.name}`}
                  className={getVillageButtonClassName(selectedVillage, v, styles)}
                  onClick={e => handleMarkerClick(e, v)}
                  style={VILLAGE_BUTTON_STYLE}
                >
                  <img src={v.imageLink} alt={v.name} />
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.villageDetails} ${dm}`}>
            {selectedVillage && (
              <div className={`${styles.villageDetailsContent} ${dm}`}>
                <h3>{selectedVillage.name}</h3>
                <p>{selectedVillage.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterPlan;
