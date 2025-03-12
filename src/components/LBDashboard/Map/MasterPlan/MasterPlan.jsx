import logo from '../../../../assets/images/logo2.png';
import mastermap from '../../../../assets/images/masterMap.png';
import mapRouter from '../../../../assets/images/routeMarker.png';
import './MasterPlan.css';

const villages = [
  {
    id: 0,
    name: 'Duplicable City Center',
    short: 'CC',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2018/02/Duplicable-City-Center-PlanRender_640x335.jpg',
  },
  {
    id: 1,
    name: 'Earthbag Village',
    short: 'Earthbag',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2018/10/Earthbag-Village-640x335-render.jpg',
  },
  {
    id: 2,
    name: 'Straw Bale Village',
    short: 'Straw',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2011/09/Straw-Bale-Village-PlanRender_640x335-1.png',
  },
  {
    id: 3,
    name: 'Cob Village',
    short: 'Cob',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2011/09/Cob-Village-PlanRender_640x335.png',
  },
  {
    id: 4,
    name: 'Earth Block Village',
    short: 'Block',
    url: 'https://onecommunityglobal.org/wp-content/uploads/2015/02/P4-Plan-Render_640x335.jpg',
  },
  {
    id: 5,
    name: 'Shipping Container Village',
    short: 'Container',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2011/09/Shipping-Container-Village-PlanRender_640x335.jpg',
  },
  {
    id: 6,
    name: 'Recycled Materials Village',
    short: 'Recycle',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2018/06/Recycled-Materials-Village-PlanRender_640x335-updated.jpg',
  },
  {
    id: 7,
    name: 'Tree House Village',
    short: 'Treehouse',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2014/01/Tree-House-Village-PlanRender_640x335.jpg',
  },
];

function MasterPlan() {
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
                <img src={mastermap} alt="Master Map" />
              </div>
              <div className="route">
                <img src={mapRouter} alt="Route Marker" />
              </div>
            </div>
            <div className="villages">
              {villages.map(v => (
                <div key={v.id} className="village-name">
                  {v.name}
                  <img src={v.url} alt={v.short} />
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
