import { useState } from 'react';
import { useHistory } from 'react-router';
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
    description:
      'The Duplicable City Center will be the largest open source/DIY structure in the world. As part of One Community it will be a diversely functional, ultra-eco-friendly (LEED Platinum Certifiable), space and resource saving community center designed to be replicated.',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2018/02/Duplicable-City-Center-PlanRender_640x335.jpg',
    position: { top: '48%', left: '49.75%' },
  },
  {
    id: 1,
    name: 'Earthbag Village',
    short: 'Earthbag',
    description:
      'The Earthbag Village consists of seventy-eight 150-200 square foot (14-18.6 sq meter) earthbag hotel room styled cabanas plus four communal eco-shower structures, 2 vermiculture waste processing toilet structures, two net-zero water use toilet structures, and the central Tropical Atrium.',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2018/10/Earthbag-Village-640x335-render.jpg',
    position: { top: '45%', left: '41.1%' },
  },
  {
    id: 2,
    name: 'Straw Bale Village',
    short: 'Straw',
    description:
      'The Straw Bale Village consists of fifty-two 250-300 square foot (23-28 sq meters) studio-style rooms, each with an attached bathroom. They are arranged in groups of 4 that can easily be connected and or converted to create multi-room units.',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2011/09/Straw-Bale-Village-PlanRender_640x335-1.png',
    position: { top: '75.75%', left: '68%' },
  },
  {
    id: 3,
    name: 'Cob Village',
    description:
      'Cob is an ancient building material composed of dirt, straw, and water that may have been used for construction since prehistoric times. Some of the oldest man-made structures in Afghanistan are composed of rammed earth and cob and still standing! ',
    short: 'Cob',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2011/09/Cob-Village-PlanRender_640x335.png',
    position: { top: '99.5%', left: '9%' },
  },
  {
    id: 4,
    name: 'Earth Block Village',
    short: 'Block',
    description:
      'Compressed earth blocks (CEBs) or pressed earth blocks are damp soil compressed at high pressure to form blocks. If the blocks are stabilized with a chemical binder such as Portland Cement they are called compressed stabilized earth blocks (CSEBs) or stabilized earth blocks (SEBs).',
    url: 'https://onecommunityglobal.org/wp-content/uploads/2015/02/P4-Plan-Render_640x335.jpg',
    position: { top: '112.5%', left: '75%' },
  },
  {
    id: 5,
    name: 'Shipping Container Village',
    short: 'Container',
    description:
      'The Shipping Container Village is planned as a semi-subterranean 3-level village constructed using shipping containers. It will provide 36 living units and 18 additional common spaces.',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2011/09/Shipping-Container-Village-PlanRender_640x335.jpg',
    position: { top: '107.25%', left: '53.75%' },
  },
  {
    id: 6,
    name: 'Recycled Materials Village',
    short: 'Recycle',
    description:
      'The Recycled Materials Village (Pod 6) will be open source shared to demonstrate how to build safely, affordably, and efficiently with maximal use of reclaimed/recycled materials. The design of the Recycled Materials Village is an earthship-inspired semi-subterranean design that will provide 47 living units and 14 common areas.',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2018/06/Recycled-Materials-Village-PlanRender_640x335-updated.jpg',
    position: { top: '50.5%', left: '66.75%' },
  },
  {
    id: 7,
    name: 'Tree House Village',
    short: 'Treehouse',
    description:
      'The Tree House Village will be a community living model in the trees. It plans to show how a Tree House Village, or off-ground and low-footprint/low-impact housing, can be a viable approach to sustainable living.',
    url:
      'https://onecommunityglobal.org/wp-content/uploads/2014/01/Tree-House-Village-PlanRender_640x335.jpg',
    position: { top: '68.25%', left: '93%' },
  },
];
function MasterPlan() {
  const [selectedVillage, setSelectedVillage] = useState(null);
  const router = useHistory();

  const handleVillageClick = village => {
    setSelectedVillage(village);
    if (selectedVillage === village) {
      router.push(`/master-plan/${village.id}`);
    }
  };

  const handleOutsideClick = () => {
    setSelectedVillage(null);
  };

  return (
    <div className="main-container" onClick={handleOutsideClick}>
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
                      onClick={e => {
                        e.stopPropagation();
                        handleVillageClick(v);
                      }}
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
                <p>
                  Click on the village marker or on the village to select a village and view more
                  details.
                </p>
                <p>Double Click to view the village Page.</p>
              </div>
            </div>
            <div className="villages">
              {villages.map(v => (
                <div
                  key={v.id}
                  className={`${selectedVillage === v ? 'selected ' : ''} village`}
                  style={{ cursor: 'pointer', padding: '0 10px', textAlign: 'center' }}
                  onClick={e => {
                    e.stopPropagation();
                    handleVillageClick(v);
                  }}
                >
                  <img src={v.url} alt={v.name} />
                </div>
              ))}
            </div>
          </div>
          <div className="village-details">
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
