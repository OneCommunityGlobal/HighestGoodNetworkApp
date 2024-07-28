import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function Anniversary({ props }) {
  const { userProfiles } = props;
  const testData = [
    {
      _id: '5ede6be453a0480017164a5b',
      firstName: 'Nithesh',
      lastName: 'Admin',
    },
  ];

  const listData = testData.map(item => ({
    ...item,
    avatar: userProfiles.filter(entry => entry._id.includes(item._id))[0].profilePic,
    // icon: 
  }));

  return (
    <ul>
      {listData.map(item => (
        <li key={item._id}>
          <img src={item.avatar} alt={item.firstName} />
          {item.firstName}
          <img src={item.icon} alt={item.iconDescription} />
        </li>
      ))}
    </ul>
  );
}
