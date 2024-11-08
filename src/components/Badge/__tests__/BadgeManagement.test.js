
const { ENDPOINTS } =  require('../../../utils/URL');
const { returnUpdatedBadgesCollection } = require('../../../actions/badgeManagement');
const axios = require('axios');
jest.mock('axios');


describe('BadgeManagement returnUpdatedBadgesCollection unit test', () => {
  test('should update an existing badge in the collection', () => {
    const badgeCollection = [
      {
        "count": 1,
        "earnedDate": ["Dec-07-23"],
        "lastModified": "2023-12-07T23:58:56.900Z",
        "featured": false,
        "_id": "65725c5550b9eb8ddcfc5807",
        "badge": "64ee76a4a2de3e0d0c717841"
      }
    ];

    const selectedBadgesId = ['assign-badge-64ee76a4a2de3e0d0c717841'];

    const result = returnUpdatedBadgesCollection(badgeCollection, selectedBadgesId);

    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
    expect(result[0].earnedDate).toHaveLength(2); // One more date added
    expect(result[0].lastModified).not.toBe("2023-12-07T23:58:56.900Z"); 
  });

  test('should add a new badge to the collection', () => {
    const badgeCollection = [
      {
        "count": 1,
        "earnedDate": ["Dec-07-23"],
        "lastModified": "2023-12-07T23:58:56.900Z",
        "featured": false,
        "_id": "65725c5550b9eb8ddcfc5807",
        "badge": "64ee76a4a2de3e0d0c717841"
      }
    ];

    const selectedBadgesId = ['assign-badge-AAee76a4a2de3e0d0c717841'];

    const result = returnUpdatedBadgesCollection(badgeCollection, selectedBadgesId);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(badgeCollection[0]);
    expect(result[1].badge).toBe('AAee76a4a2de3e0d0c717841');
    expect(result[1].count).toBe(1);
    expect(result[1].earnedDate).toHaveLength(1);
  });
});


