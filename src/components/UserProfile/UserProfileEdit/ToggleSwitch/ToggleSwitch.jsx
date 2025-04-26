import style from './ToggleSwitch.module.scss';
import TriStateToggleSwitch from './TriStateToggleSwitch';

function ToggleSwitch({
  switchType,
  state,
  handleUserProfile,
  fontSize,
  toggleClass,
  fontColor,
  darkMode,
}) {
  switch (switchType) {
    case 'bluesquares':
      if (state) {
        return (
          <div className={`blueSqare ${toggleClass || ''}`}>
            <div className={style.switchSection}>
              {/* <div> Blue Squares: </div> */}
              <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
                public
                <input
                  data-testid="blue-switch"
                  id="blueSquaresPubliclyAccessible"
                  type="checkbox"
                  className={darkMode ? style.toggleDark : style.toggle}
                  onChange={handleUserProfile}
                />
                private
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className={`blueSqare ${toggleClass || ''}`}>
          <div className={style.switchSection}>
            {/* <div> Blue Squares: </div> */}
            <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
              public
              <input
                data-testid="blue-switch"
                id="blueSquaresPubliclyAccessible"
                type="checkbox"
                className={darkMode ? style.toggleDark : style.toggle}
                defaultChecked
                onChange={handleUserProfile}
              />
              private
            </div>
          </div>
        </div>
      );
    case 'email':
      if (state) {
        return (
          <div className="blueSqare">
            <div className={style.switchSection}>
              <div className="icon">
                <i
                  className="fa fa-envelope-o"
                  aria-hidden="true"
                  style={darkMode ? { color: 'white' } : {}}
                />
              </div>
              <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
                public
                <input
                  id="emailPubliclyAccessible"
                  data-testid="email-switch"
                  type="checkbox"
                  className={darkMode ? style.toggleDark : style.toggle}
                  onChange={handleUserProfile}
                />
                private
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="blueSqare">
          <div className={style.switchSection}>
            <div className="icon">
              <i
                className="fa fa-envelope-o"
                aria-hidden="true"
                style={darkMode ? { color: 'white' } : {}}
              />
            </div>
            <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
              public
              <input
                id="emailPubliclyAccessible"
                data-testid="email-switch"
                type="checkbox"
                className={darkMode ? style.toggleDark : style.toggle}
                defaultChecked
                onChange={handleUserProfile}
              />
              private
            </div>
          </div>
        </div>
      );
    case 'email-subcription':
      if (state) {
        return (
          <div className="blueSqare">
            <div className={style.switchSection}>
              <div className="icon">
                <i
                  className="fa fa-envelope-o"
                  aria-hidden="true"
                  style={darkMode ? { color: 'white' } : {}}
                />
              </div>
              <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
                subscribed
                <input
                  id="emailSubscriptionConfig"
                  data-testid="email-subcription-switch"
                  type="checkbox"
                  className={darkMode ? style.toggleDark : style.toggle}
                  onChange={handleUserProfile}
                />
                unsubscribed
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="blueSqare">
          <div className={style.switchSection}>
            <div className="icon">
              <i
                className="fa fa-envelope-o"
                aria-hidden="true"
                style={darkMode ? { color: 'white' } : {}}
              />
            </div>
            <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
              subscribed
              <input
                id="emailSubscriptionConfig"
                data-testid="email-subcription-switch"
                type="checkbox"
                className={darkMode ? style.toggleDark : style.toggle}
                defaultChecked
                onChange={handleUserProfile}
              />
              unsubscribed
            </div>
          </div>
        </div>
      );
    case 'phone':
      if (state) {
        return (
          <div className="blueSqare">
            <div className={style.switchSection}>
              <div className="icon">
                <i
                  className="fa fa-phone"
                  aria-hidden="true"
                  style={darkMode ? { color: 'white' } : {}}
                />
              </div>
              <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
                public
                <input
                  data-testid="phone-switch"
                  id="phonePubliclyAccessible"
                  // data-testid="custom-element"
                  type="checkbox"
                  className={darkMode ? style.toggleDark : style.toggle}
                  onChange={handleUserProfile}
                />
                private
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="blueSqare">
          <div className={style.switchSection}>
            <div className="icon">
              <i
                className="fa fa-phone"
                aria-hidden="true"
                style={darkMode ? { color: 'white' } : {}}
              />
            </div>
            <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
              public
              <input
                data-testid="phone-switch"
                id="phonePubliclyAccessible"
                type="checkbox"
                className={darkMode ? style.toggleDark : style.toggle}
                defaultChecked
                onChange={handleUserProfile}
              />
              private
            </div>
          </div>
        </div>
      );
    case 'visible':
      if (state) {
        return (
          <div className="blueSqare">
            <div className={style.switchSection}>
              <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
                visible
                <input
                  data-testid="visibility-switch"
                  id="leaderboardVisibility"
                  type="checkbox"
                  className={darkMode ? style.toggleDark : style.toggle}
                  onChange={handleUserProfile}
                />
                invisible
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="blueSqare">
          <div className={style.switchSection}>
            <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
              visible
              <input
                data-testid="visibility-switch"
                id="leaderboardVisibility"
                type="checkbox"
                className={darkMode ? style.toggleDark : style.toggle}
                onChange={handleUserProfile}
                defaultChecked
              />
              invisible
            </div>
          </div>
        </div>
      );
    case 'bio':
      return (
        <div className="blueSqare">
          <div className={style.switchSection} style={{ fontSize, color: fontColor }}>
            <div
              style={{ wordBreak: 'keep-all', color: darkMode ? 'white' : '' }}
              className={style.switchContainer}
            >
              posted
              <TriStateToggleSwitch pos={state || 'default'} onChange={handleUserProfile} />
              requested
            </div>
          </div>
        </div>
      );
    case 'active_members':
      if (state) {
        return (
          <div className="blueSqare">
            <div className={style.switchSection}>
              <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
                Active
                <input
                  data-testid="active-switch"
                  id="showActiveMembersOnly"
                  type="checkbox"
                  className={darkMode ? style.toggleDark : style.toggle}
                  onChange={handleUserProfile}
                />
                All
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="blueSqare">
          <div className={style.switchSection}>
            <div className={style.switchContainer} style={darkMode ? { color: 'white' } : {}}>
              Active
              <input
                data-testid="active-switch"
                id="showActiveMembersOnly"
                type="checkbox"
                className={darkMode ? style.toggleDark : style.toggle}
                defaultChecked
                onChange={handleUserProfile}
              />
              All
            </div>
          </div>
        </div>
      );
    default:
      break;
  }
  return <div>ERROR: Toggle Switch.</div>;
}

export default ToggleSwitch;
