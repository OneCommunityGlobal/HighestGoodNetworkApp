import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { Button } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import './TeamLocations.css';

function MarkerPopup({
  profile,
  userName,
  isAbleToEdit,
  editHandler,
  removeLocation,
  isOpen,
  darkMode, // Removed randomLocationOffset
}) {
  const popupRef = useRef();

  useEffect(() => {
    if (popupRef.current !== undefined) {
      if (isOpen) {
        popupRef.current.openPopup();
      } else {
        popupRef.current.closePopup();
      }
    }
  }, [isOpen]);

  return (
    <CircleMarker
      center={[
        profile.location.coords.lat,
        profile.location.coords.lng,
      ]}
      key={profile._id}
      color={profile.isActive ? 'green' : 'gray'}
      ref={popupRef}
    >
      <Popup autoClose={false}>
        <div>
          {profile.title && profile.title}
          {userName && <div>Name: {userName}</div>}
          {profile.jobTitle && <div>{`Title: ${profile.jobTitle}`}</div>}
          <div>{`Location: ${profile.location.city || profile.location.userProvided}`}</div>
          {isAbleToEdit && (
            <div className="mt-3">
              <Button
                color="Primary"
                className="btn btn-outline-success mr-1 btn-sm"
                onClick={() => editHandler(profile)}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Edit
              </Button>
              <Button
                color="danger"
                className="btn btn-outline-error mr-1 btn-sm"
                onClick={() => removeLocation(profile._id)}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </Popup>
    </CircleMarker>
  );
}

export default MarkerPopup;
