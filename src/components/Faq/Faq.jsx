import React from 'react';
import FaqSearch from './FaqSearch';
import FaqManagement from './FaqManagement';

const userHasPermission = permission => {
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions'));
  return userPermissions && userPermissions.includes(permission);
};

function Faq() {
  return (
    <div>
      <h2>FAQ System</h2>
      <FaqSearch />

      {userHasPermission('faq_create') && <FaqManagement />}
    </div>
  );
}

export default Faq;
