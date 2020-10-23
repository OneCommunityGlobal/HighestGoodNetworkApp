import React from 'react';
import style from './ToggleSwitch.module.scss';

const ToggleSwitch = ({ switchType, state, handleUserProfile }) => {
  switch (switchType) {
    case 'bluesquares':
      if (state) {
        return (
          <div className={style.switchSection}>
            {/* <div> Blue Squares: </div> */}
            <div className={style.switchContainer}>
              public
              <input
                id="blueSquaresPubliclyAccessible"
                type="checkbox"
                className={style.toggle}
                onChange={handleUserProfile}
              />
              private
            </div>
          </div>
        );
      }
      return (
        <div className={style.switchSection}>
          {/* <div> Blue Squares: </div> */}
          <div className={style.switchContainer}>
            public
            <input
              id="blueSquaresPubliclyAccessible"
              type="checkbox"
              className={style.toggle}
              defaultChecked
              onChange={handleUserProfile}
            />
            private
          </div>
        </div>
      );

    case 'email':
      if (state) {
        return (
          <div className={style.switchSection}>
            <div className="icon">
              <i className="fa fa-envelope-o" aria-hidden="true" />
            </div>
            <div className={style.switchContainer}>
              public
              <input
                id="emailPubliclyAccessible"
                type="checkbox"
                className={style.toggle}
                onChange={handleUserProfile}
              />
              private
            </div>
          </div>
        );
      }
      return (
        <div className={style.switchSection}>
          <div className="icon">
            <i className="fa fa-envelope-o" aria-hidden="true" />
          </div>
          <div className={style.switchContainer}>
            public
            <input
              id="emailPubliclyAccessible"
              type="checkbox"
              className={style.toggle}
              defaultChecked
              onChange={handleUserProfile}
            />
            private
          </div>
        </div>
      );
    case 'phone':
      if (state) {
        return (
          <div className={style.switchSection}>
            <div className="icon">
              <i className="fa fa-phone" aria-hidden="true" />
            </div>
            <div className={style.switchContainer}>
              public
              <input
                id="phonePubliclyAccessible"
                type="checkbox"
                className={style.toggle}
                onChange={handleUserProfile}
              />
              private
            </div>
          </div>
        );
      }
      return (
        <div className={style.switchSection}>
          <div className="icon">
            <i className="fa fa-phone" aria-hidden="true" />
          </div>
          <div className={style.switchContainer}>
            public
            <input
              id="phonePubliclyAccessible"
              type="checkbox"
              className={style.toggle}
              defaultChecked
              onChange={handleUserProfile}
            />
            private
          </div>
        </div>
      );
    default:
      break;
  }
  return <div>ERROR: Toggle Switch.</div>;
};

export default ToggleSwitch;
