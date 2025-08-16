import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { getVillageDropdownFilterData } from '~/actions/villageDetailsAction';
import logo from '../../../../assets/images/logo2.png';
import mastermap from '../../../../assets/images/masterMap.png';
import mapRouter from '../../../../assets/images/routeMarker.png';
import pin from '../../../../assets/images/pin-point.png';
import './MasterPlan.css';

function MasterPlan() {
  const [selectedVillage, setSelectedVillage] = useState(null);
  const router = useHistory();
  const dispatch = useDispatch();
  const villages = useSelector(state => state.villageMap.villages || []);

  useEffect(() => {
    dispatch(getVillageDropdownFilterData());
  }, [dispatch]);

  const handleVillageClick = village => {
    setSelectedVillage(village);
  };

  const handleOutsideClick = () => {
    setSelectedVillage(null);
  };

  return (
    <div
      className="mainContainer"
      onClick={handleOutsideClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleOutsideClick();
        }
      }}
    >
      <div className="logoContainer">
        <img src={logo} alt="One Community Logo" />
      </div>

      <div className="contentContainer">
        <div className="containerTop" />
        <div className="containerMain">
          <div className="containerMap">
            <div className="mapDetails">
              <div className="map">
                <div className="imageWrapper">
                  <img src={mastermap} alt="Master Map" />

                  {villages.map(v => (
                    <button
                      key={v._id}
                      style={{
                        '--top': v.position?.top || '50%',
                        '--left': v.position?.left || '50%',
                      }}
                      className="villageMarker"
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
                    className="pinPoint"
                    style={{
                      '--top': selectedVillage?.position?.top || '0%',
                      '--left': selectedVillage?.position?.left || '0%',
                      display: selectedVillage ? 'block' : 'none',
                    }}
                  />
                </div>
              </div>

              <div className="route">
                <img src={mapRouter} alt="Route Marker" />
                <p>
                  Click on the village marker or on the village to select a village and view more
                  details.
                </p>
                <p>Double Click to view the village Page.</p>
              </div>
            </div>

            <div className="villages">
              {villages.map(v => (
                <button
                  key={v._id}
                  type="button"
                  aria-label={`Select ${v.name}`}
                  className={`${selectedVillage === v ? 'selected ' : ''}village`}
                  onClick={e => {
                    e.stopPropagation();
                    handleVillageClick(v);
                  }}
                  onDoubleClick={() => router.push(`/lbdashboard/village/${v._id}`)}
                  style={{
                    padding: '0 10px',
                    textAlign: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <img src={v.imageLink || v.url} alt={v.name} />
                </button>
              ))}
            </div>
          </div>

          <div
            className={`villageDetails ${
              selectedVillage ? 'villageDetailsVisible' : 'villageDetailsHidden'
            }`}
          >
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
