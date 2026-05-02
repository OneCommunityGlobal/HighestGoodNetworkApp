// eslint-disable-next-line no-unused-vars
import React from 'react';
import TopCommunityMembers from './TopCommunityMembers';

const sampleMembers = [
  {
    id: 1,
    name: 'Alice Johnson',
    skillScore: 7,
    email: 'alice@example.com',
    emailPrivate: false,
    slackID: 'U123ABC',
    slackPrivate: false,
  },
  {
    id: 2,
    name: 'Bob Smith',
    skillScore: 3,
    emailPrivate: true,
    slackPrivate: true,
  },
  {
    id: 3,
    name: 'Carla Green',
    skillScore: 8,
    email: 'carla@example.com',
    emailPrivate: false,
    slackID: 'U456XYZ',
    slackPrivate: false,
  },
  // Add up to 15 sample members...
];

function TestTopMembers() {
  return <TopCommunityMembers members={sampleMembers} />;
}

export default TestTopMembers;
