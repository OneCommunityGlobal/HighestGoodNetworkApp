/* eslint-disable no-undef */
// This is needed to remove a warning related to popper.js when testing reactstrap tooltips.
// More on this bug: https://github.com/react-bootstrap/react-bootstrap/issues/4997
/* eslint-env jest */
import PopperJs from 'popper.js';

// export default class Popper {
//  static placements = PopperJs.placements;

  function Popper() {
    return {
      destroy: () => {},
      scheduleUpdate: () => {},
    };
  }
  // To mimic static property
  Popper.placements = PopperJs.placements;
  export default Popper;


  describe('Stop Error', () => {
   it('should not error out due to no tests (popper.js.js)', () => {
    
  });
});
