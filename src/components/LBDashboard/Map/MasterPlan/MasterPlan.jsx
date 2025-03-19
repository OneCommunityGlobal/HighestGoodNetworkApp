import { useState } from 'react';
import logo from '../../../../assets/images/logo2.png';
import mastermap from '../../../../assets/images/masterMap.png';
import mapRouter from '../../../../assets/images/routeMarker.png';
import pin from '../../../../assets/images/pin-point.png';
import './MasterPlan.css';

const villages = [
  {
    id: 0,
    name: 'Duplicable City Center',
    short: 'CC',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2018/02/Duplicable-City-Center-PlanRender_640x335.jpg',
    position: { top: '48%', left: '49.75%' },
  },
  {
    id: 1,
    name: 'Earthbag Village',
    short: 'Earthbag',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2018/10/Earthbag-Village-640x335-render.jpg',
    position: { top: '45%', left: '41.1%' },
  },
  {
    id: 2,
    name: 'Straw Bale Village',
    short: 'Straw',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2011/09/Straw-Bale-Village-PlanRender_640x335-1.png',
    position: { top: '75.75%', left: '68%' },
  },
  {
    id: 3,
    name: 'Cob Village',
    short: 'Cob',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2011/09/Cob-Village-PlanRender_640x335.png',
    position: { top: '99.5%', left: '9%' },
  },
  {
    id: 4,
    name: 'Earth Block Village',
    short: 'Block',
    url: 'https://onecommunityglobal.org/wp-content/uploads/2015/02/P4-Plan-Render_640x335.jpg',
    position: { top: '112.5%', left: '75%' },
  },
  {
    id: 5,
    name: 'Shipping Container Village',
    short: 'Container',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2011/09/Shipping-Container-Village-PlanRender_640x335.jpg',
    position: { top: '107.25%', left: '53.75%' },
  },
  {
    id: 6,
    name: 'Recycled Materials Village',
    short: 'Recycle',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2018/06/Recycled-Materials-Village-PlanRender_640x335-updated.jpg',
    position: { top: '50.5%', left: '66.75%' },
  },
  {
    id: 7,
    name: 'Tree House Village',
    short: 'Treehouse',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2014/01/Tree-House-Village-PlanRender_640x335.jpg',
    position: { top: '68.25%', left: '93%' },
  },
];
function MasterPlan() {
  const [selectedVillage, setSelectedVillage] = useState(null);

  const handleVillageClick = village => {
    setSelectedVillage(village);
  };

  return (
    <div className="main-container">
      <div className="logo-container">
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className="content-container">
        <div className="container-top" />
        <div className="container-main">
          <div className="container-map">
            <div className="map-details">
              <div className="map">
                <div className="image-wrapper">
                  <img src={mastermap} alt="Master Map" />
                  {villages.map(v => (
                    <button
                      key={v.id}
                      style={{
                        '--top': v.position.top,
                        '--left': v.position.left,
                      }}
                      className="village-marker"
                      type="button"
                      aria-label={`Marker for ${v.name}`}
                      onClick={() => handleVillageClick(v)}
                    />
                  ))}
                  <img
                    src={pin}
                    alt="Pin Point"
                    className="pin-point"
                    style={{
                      '--top': selectedVillage ? selectedVillage.position.top : '0%',
                      '--left': selectedVillage ? selectedVillage.position.left : '0%',
                      display: selectedVillage ? 'block' : 'none',
                    }}
                  />
                </div>
              </div>
              <div className="route">
                <img src={mapRouter} alt="Route Marker" />
              </div>
            </div>
            <div className="villages">
              {villages.map(v => (
                <div
                  key={v.id}
                  className={`${selectedVillage === v ? 'selected ' : ''} 'village`}
                  style={{ cursor: 'pointer', padding: '0 10px', textAlign: 'center' }}
                  onClick={() => handleVillageClick(v)}
                >
                  <img src={v.url} alt={v.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterPlan;
