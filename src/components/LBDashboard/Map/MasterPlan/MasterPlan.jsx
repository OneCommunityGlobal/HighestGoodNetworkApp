import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import logo from '../../../../assets/images/logo2.png';
import mastermap from '../../../../assets/images/masterMap.png';
import mapRouter from '../../../../assets/images/routeMarker.png';
import pin from '../../../../assets/images/pin-point.png';
import styles from './MasterPlan.module.css';
import { getVillageDropdownFilterData } from '~/actions/lbdashboard/villageDetailsAction';
import { useDispatch, useSelector } from 'react-redux';

function MasterPlan() {
  const [selectedVillage, setSelectedVillage] = useState(null);
  const history = useHistory();
  const villages = useSelector(state => state.villageDetails.villages || []);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getVillageDropdownFilterData());
  }, [dispatch]);

  const handleVillageClick = village => {
    if (selectedVillage && selectedVillage._id === village._id) {
      const slug = village.name.replace(/\s+/g, '-');
      history.push(`/lbdashboard/village/${slug}?id=${village._id}`);
    } else {
      setSelectedVillage(village);
    }
  };

  const handleOutsideClick = () => {
    setSelectedVillage(null);
  };

  return (
    <div
      className={styles.mainContainer}
      onClick={handleOutsideClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') handleOutsideClick();
      }}
    >
      <div className={styles.logoContainer}>
        <img src={logo} alt="One Community Logo" />
      </div>

      <div className={styles.contentContainer}>
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
                      style={{
                        '--top': v.position.top,
                        '--left': v.position.left,
                      }}
                      className={styles.villageMarker}
                      type="button"
                      aria-label={`Marker for ${v.name}`}
                      onClick={e => {
                        e.stopPropagation();
                        handleVillageClick(v);
                      }}
                    />
                  ))}
                  <img
                    src={pin}
                    alt="Pin Point"
                    className={styles.pinPoint}
                    style={{
                      '--top': selectedVillage ? selectedVillage.position.top : '0%',
                      '--left': selectedVillage ? selectedVillage.position.left : '0%',
                      display: selectedVillage ? 'block' : 'none',
                    }}
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
                  className={`${selectedVillage?._id === v._id ? `${styles.selected} ` : ''}${
                    styles.village
                  }`}
                  onClick={e => {
                    e.stopPropagation();
                    handleVillageClick(v);
                  }}
                  style={{
                    padding: '0 10px',
                    textAlign: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <img src={v.imageLink} alt={v.name} />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.villageDetails}>
            {selectedVillage && (
              <div className="village-details-content">
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
