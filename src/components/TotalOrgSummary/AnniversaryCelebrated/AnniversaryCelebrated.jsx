import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { SiGmail } from 'react-icons/si';
import Loading from '~/components/common/Loading';
import sixMonthsAward from '../images/sixMonthsAward.svg';
import oneYearAward from '../images/oneYearAward.svg';

export default function AnniversaryCelebrated({ isLoading, data, darkMode }) {
  const history = useHistory();
  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  const sixMonthsData = data['6Months'];
  const oneYearData = data['1Year'];
  const hasComparisonData = [sixMonthsData, oneYearData].every(
    dataset => dataset.comparisonPercentage,
  );

  let sixMonthsPercent;
  let oneYearPercent;
  let is6MonthsPositive;
  let isOneYearPositive;
  if (hasComparisonData) {
    sixMonthsPercent = sixMonthsData.comparisonPercentage;
    oneYearPercent = oneYearData.comparisonPercentage;
    is6MonthsPositive = sixMonthsPercent.toString().charAt(0) !== '-';
    isOneYearPositive = oneYearPercent.toString().charAt(0) !== '-';
  }

  const handleEmailClick = email => {
    history.push('/sendemail', { state: { email } });
  };

  const getAnniversaryListItem = (userData = {}, anniversaryMonths = 6) => {
    const { _id, profilePic, email, firstName, lastName, createdDate } = userData;
    return (
      <li key={_id} className="d-flex flex-column">
        <div
          style={{
            display: 'grid',
            gap: '15px',
            gridTemplateColumns: '30px 30px min-content 30px',
            textWrap: 'nowrap',
            margin: '10px 15px',
          }}
        >
          <img
            src={profilePic || '/profilepic.webp'}
            alt="profile"
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/profilepic.webp';
            }}
            className="rounded-circle ms-5"
            style={{ width: '30px', height: '30px' }}
          />

          <SiGmail
            size={30}
            color="red"
            style={{ cursor: 'pointer', display: 'block' }}
            onClick={() => handleEmailClick(email)}
          />

          <div style={{ alignSelf: 'center' }}>
            <p className="m-0" style={{ color: darkMode ? '#fff' : '#000' }}>
              {`${firstName} ${lastName}`}
            </p>
            {/* show created date */}
            <small style={{ color: darkMode ? '#aaa' : '#555' }}>
              Joined: {new Date(createdDate).toLocaleDateString()}
            </small>
          </div>
          <img
            src={anniversaryMonths === 6 ? sixMonthsAward : oneYearAward}
            alt="award"
            style={{ width: '30px', height: '30px' }}
          />
        </div>
      </li>
    );
  };

  const exportData = () => {
    const exportObj = {
      sixMonths: sixMonthsData.users,
      oneYear: oneYearData.users,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'anniversaries.json';
    // eslint-disable-next-line testing-library/no-node-access
    link.click();
  };

  // filter users by search
  const filterUsers = users =>
    users.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mt-3">
      {/* Comparison percentages with counts */}
      {hasComparisonData && (
        <span
          style={{
            fontWeight: 'bold',
            display: 'grid',
            justifyContent: 'center',
            justifyItems: 'center',
            fontSize: '20px',
            marginBottom: '10px',
          }}
        >
          <p style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
            <span style={{ color: darkMode ? '#fff' : 'gray' }}>6 months: </span>
            <span
              className={`text-center ${is6MonthsPositive ? 'text-success' : 'text-danger'}`}
              style={{ margin: 0 }}
            >
              {`${is6MonthsPositive ? '+' : ''}${sixMonthsPercent}%`}({sixMonthsData.users.length}{' '}
              users)
            </span>
          </p>
          <p style={{ display: 'flex', gap: '5px' }}>
            <span style={{ color: darkMode ? '#fff' : 'gray' }}>1 year: </span>
            <span
              className={`text-center ${isOneYearPositive ? 'text-success' : 'text-danger'}`}
              style={{ margin: 0 }}
            >
              {`${isOneYearPositive ? '+' : ''}${oneYearPercent}%`}({oneYearData.users.length}{' '}
              users)
            </span>
          </p>
        </span>
      )}

      {/* Search + Export Controls */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            margin: '10px 0',
            padding: '5px 10px',
            borderRadius: '5px',
            border: '1px solid gray',
            width: '60%',
          }}
        />
        <button onClick={exportData} className="btn btn-secondary">
          Export Data
        </button>
      </div>

      {/* List of anniversaries */}
      <ul className="w-90 overflow-auto" style={{ maxHeight: '410px' }}>
        {filterUsers(sixMonthsData.users).map(item => getAnniversaryListItem(item, 6))}
        {filterUsers(oneYearData.users).map(item => getAnniversaryListItem(item, 12))}
      </ul>
    </div>
  );
}
