import React, { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getVillageDetailsData } from '~/actions/lbdashboard/villageDetailsAction';
import logo from '../../../../assets/images/logo2.png';
import styles from './VillageDetails.module.css';

export default function VillageDetails() {
  const { id: nameSlug } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const villageId = query.get('id');

  const dispatch = useDispatch();
  const village = useSelector(state => state.villageDetails.villageDetails[villageId]);

  useEffect(() => {
    if (villageId && (!village || village._id !== villageId)) {
      dispatch(getVillageDetailsData(villageId));
    }
  }, [dispatch, villageId, village]);

  if (!village) return <h2 style={{ textAlign: 'center' }}>Village not found</h2>;

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
                      {village.amenities.map((a, idx) => (
                        <li key={idx}>{a}</li>
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
