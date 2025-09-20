import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './VillageDetails.css';
import { useDispatch, useSelector } from 'react-redux';
import { getVillageDetailsData } from '~/actions/villageDetailsAction';

export default function VillageDetails() {
  const { villageName } = useParams();
  const dispatch = useDispatch();

  const villages = useSelector(state => state.villageMap.villages || []);
  const village = villages.find(v => v.name === villageName || v._id === villageName);

  useEffect(() => {
    if (village || village._id) {
      dispatch(getVillageDetailsData(village._id));
    }
  }, [dispatch, village]);

  if (!village) {
    return <h2 style={{ textAlign: 'center' }}>Village not found</h2>;
  }

  return (
    <div className="details-container">
      {/* map section */}
      {village.villageMapLink && (
        <div className="map-section">
          <img src={village.villageMapLink} alt={village.name} className="village-map" />
        </div>
      )}

      {/* info section */}
      <div className="info-section">
        <h2>{village.name}</h2>
        {/* {village.description && <p>{village.description}</p>} */}

        {/* amenities */}
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

        {/* Properties */}
        {village.properties?.length > 0 && (
          <>
            <h3>Properties</h3>
            <div className="properties-grid">
              {village.properties.map(p => (
                <div key={p._id || p.unit} className="property-card">
                  <p>Unit: {p.unit}</p>
                  <p>
                    Current Bid: $
                    {typeof p.currentBid === 'number'
                      ? p.currentBid.toLocaleString()
                      : p.currentBid}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Master Plan Button */}
        <Link to="/lbdashboard/masterplan" className="masterplan-link">
          Go back to Map
        </Link>
      </div>
    </div>
  );
}
