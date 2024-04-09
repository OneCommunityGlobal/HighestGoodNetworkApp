// import React, { useState } from 'react';
// import { SEARCH, SHOW, CREATE_NEW_USER, SEND_SETUP_LINK } from '../../languages/en/ui';
// import { boxStyle } from 'styles';
// import hasPermission from '../../utils/permissions';
// import { useDispatch, useSelector } from 'react-redux';

// // import { connect } from 'react-redux';
// /**
//  * The search panel stateless component for user management grid
//  */

// const UserSearchPanel = props => {
//   const dispatch = useDispatch();
//   const state = useSelector(state => state);

//   const isPermitted = hasPermission('postUserProfile');
//   // console.log(isPermitted)

//   return (
//     <div className="input-group mt-3" id="new_usermanagement">
//       <button type="button" className="btn btn-info mr-2" onClick={props.handleNewUserSetupPopup}>
//         {SEND_SETUP_LINK}
//       </button>

//       {isPermitted && (
//         <button
//           type="button"
//           className="btn btn-info mr-2"
//           onClick={e => {
//             props.onNewUserClick();
//           }}
//           style={boxStyle}
//         >
//           {CREATE_NEW_USER}
//         </button>
//       )}

//       <div className="input-group-prepend">
//         <span className="input-group-text">{SEARCH}</span>
//       </div>
//       <input
//         autoFocus
//         type="text"
//         className="form-control"
//         aria-label="Search"
//         placeholder="Search Text"
//         id="user-profiles-wild-card-search"
//         value={props.searchText}
//         onChange={e => {
//           props.onSearch(e.target.value);
//         }}
//       />
//       <div className="input-group-prepend ml-2">
//         <span className="input-group-text">{SHOW}</span>
//         <select
//           id="active-filter-dropdown"
//           onChange={e => {
//             props.onActiveFiter(e.target.value);
//           }}
//         >
//           <option value="all">All</option>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//           <option value="paused">Paused</option>
//         </select>
//       </div>

//       <div className="input-group-append"></div>
//     </div>
//   );
// };

// // const mapStateToProps = state => ({
// //   rolePermissions: state.role.roles,
// //   userRole: state.auth.user.role,
// // });

// // export default connect(mapStateToProps)(UserSearchPanel);

// export default UserSearchPanel;

// // userPermissions: state.auth.user.permissions?.frontPermissions,

// // const UserSearchPanel = ({ rolePermissions, userRole, searchText, handleNewUserSetupPopup }) => {

// //   let isPermitted = false;
// //   if (userRole && rolePermissions && rolePermissions.length !== 0) {
// //     const roleIndex = rolePermissions.findIndex(({ roleName }) => roleName === userRole);
// //     let permissions = [];

// //     if (roleIndex !== -1) {
// //       permissions = rolePermissions[roleIndex].permissions;
// //     }
// //     isPermitted = permissions.includes('postUserProfile');
// //   }

// // const UserSearchPanel = props => {

// // const isPermitted = userRole && rolePermissions && rolePermissions.length !== 0
// //   ? rolePermissions.some(role => role.roleName === userRole && role.permissions.includes('postUserProfile'))
// //   : false;

import React from 'react';
import { SEARCH, SHOW, CREATE_NEW_USER, SEND_SETUP_LINK } from '../../languages/en/ui';
import { boxStyle } from 'styles';
import hasPermission from '../../utils/permissions';
/**
 * The search panel stateless component for user management grid
 */
const UserSearchPanel = props => {
  return (
    <div className="input-group mt-3" id="new_usermanagement">
      <button type="button" className="btn btn-info mr-2" onClick={props.handleNewUserSetupPopup}>
        {SEND_SETUP_LINK}
      </button>
      {props.cancanPostNewUser && (
        <button
          type="button"
          className="btn btn-info mr-2"
          onClick={e => {
            props.onNewUserClick();
          }}
          style={boxStyle}
        >
          {CREATE_NEW_USER}
        </button>
      )}
      <div className="input-group-prepend">
        <span className="input-group-text">{SEARCH}</span>
      </div>
      <input
        autoFocus
        type="text"
        className="form-control"
        aria-label="Search"
        placeholder="Search Text"
        id="user-profiles-wild-card-search"
        value={props.searchText}
        onChange={e => {
          props.onSearch(e.target.value);
        }}
      />
      <div className="input-group-prepend ml-2">
        <span className="input-group-text">{SHOW}</span>
        <select
          id="active-filter-dropdown"
          onChange={e => {
            props.onActiveFiter(e.target.value);
          }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div className="input-group-append"></div>
    </div>
  );
};

export default UserSearchPanel;
