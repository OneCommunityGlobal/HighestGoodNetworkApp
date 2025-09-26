import React, { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getVillageDetailsData } from '~/actions/lbdashboard/villageDetailsAction';
import logo from '../../../../assets/images/logo2.png';
import './VillageDetails.css';

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
    <div className="mainContainer">
      <div className="logoContainer">
        <img src={logo} alt="One Community Logo" />
      </div>

      <div className="contentContainer">
        <div className="containerTop" />
        <div className="containerMain">
          <div className="village-details-page">
            <div className="details-container">
              {village.villageMapLink && (
                <div className="map-section">
                  <img src={village.villageMapLink} alt={village.name} className="village-map" />
                </div>
              )}

              <div className="info-section">
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
                    <div className="properties-grid">
                      {village.properties.map(p => (
                        <div key={p._id || p.unit}>
                          <p>Unit: {p.unit}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Link to="/lbdashboard/masterplan" className="masterplan-link">
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
