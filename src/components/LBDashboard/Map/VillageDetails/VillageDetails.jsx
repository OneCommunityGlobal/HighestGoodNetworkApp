import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { getVillageDetailsData } from '~/actions/lbdashboard/villageDetailsAction';
import logo from '../../../../assets/images/logo2.png';
import styles from './VillageDetails.module.css';

const NOT_FOUND_STYLE = { textAlign: 'center' };

function shouldFetchVillage(village, villageId) {
  return villageId && (!village || village._id !== villageId);
}

export default function VillageDetails() {
  const location = useLocation();
  const dispatch = useDispatch();

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

  return (
    <div className={styles.mainContainer}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.containerTop} />
        <div className={styles.containerMain}>
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
              <div className={styles.infoSection}>
                <h2>{village.name}</h2>
                {village.amenities?.length > 0 && (
                  <>
                    <h3>Amenities</h3>
                    <ul>
                      {village.amenities.map(amenity => (
                        <li key={amenity}>{amenity}</li>
                      ))}
                    </ul>
                  </>
                )}
                {village.properties?.length > 0 && (
                  <>
                    <h3>Properties</h3>
                    <div className={styles.propertiesGrid}>
                      {village.properties.map(p => (
                        <div key={p._id || p.unit} className={styles.propertyCard}>
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
