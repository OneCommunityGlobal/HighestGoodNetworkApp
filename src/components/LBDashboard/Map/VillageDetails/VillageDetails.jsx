import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { getVillageDetailsData } from '~/actions/lbdashboard/villageDetailsAction';
import logo from '../../../../assets/images/logo2.webp';
import styles from './VillageDetails.module.css';

const NOT_FOUND_STYLE = { textAlign: 'center' };

function shouldFetchVillage(village, villageId) {
  return villageId && (!village || village._id !== villageId);
}

export default function VillageDetails() {
  const location = useLocation();
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const villageId = useMemo(() => new URLSearchParams(location.search).get('id'), [
    location.search,
  ]);

  const village = useSelector(state => state.villageDetails.villageDetails[villageId]);

  useEffect(() => {
    if (shouldFetchVillage(village, villageId)) {
      dispatch(getVillageDetailsData(villageId));
    }
  }, [dispatch, villageId, village]);

  if (!village) return <h2 style={NOT_FOUND_STYLE}>Village not found</h2>;

  const dm = darkMode ? styles.dark : '';

  return (
    <div className={`${styles.mainContainer} ${dm}`}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className={`${styles.contentContainer} ${dm}`}>
        <div className={styles.containerTop} />
        <div className={`${styles.containerMain} ${dm}`}>
          <div className={styles.villageDetailsPage}>
            <div className={styles.detailsContainer}>
              {village.villageMapLink && (
                <div className={styles.mapSection}>
                  <img
                    src={village.villageMapLink}
                    alt={village.name}
                    className={styles.villageMap}
                  />
                </div>
              )}
              <div className={`${styles.infoSection} ${dm}`}>
                <h2 className={dm}>{village.name}</h2>
                {village.amenities?.length > 0 && (
                  <>
                    <h3 className={dm}>Amenities</h3>
                    <ul>
                      {village.amenities.map(amenity => (
                        <li key={amenity}>{amenity}</li>
                      ))}
                    </ul>
                  </>
                )}
                {village.properties?.length > 0 && (
                  <>
                    <h3 className={dm}>Properties</h3>
                    <div className={styles.propertiesGrid}>
                      {village.properties.map(p => (
                        <div key={p._id || p.unit} className={`${styles.propertyCard} ${dm}`}>
                          <p>Unit: {p.unit}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <Link to="/lbdashboard/masterplan" className={styles.masterplanLink}>
                  Go back to Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
