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

  if (!data) {
    return <div className="text-center p-3">No anniversary data available for this period.</div>;
  }

  const sixMonthsData = data?.['6Months'] ?? {
    users: [],
    comparisonPercentage: 0,
  };

  const oneYearData = data?.['1Year'] ?? {
    users: [],
    comparisonPercentage: 0,
  };

  const hasComparisonData =
    sixMonthsData?.comparisonPercentage !== undefined &&
    oneYearData?.comparisonPercentage !== undefined;

  let sixMonthsPercent = 0;
  let oneYearPercent = 0;
  let is6MonthsPositive = true;
  let isOneYearPositive = true;

  if (hasComparisonData) {
    sixMonthsPercent = sixMonthsData.comparisonPercentage ?? 0;
    oneYearPercent = oneYearData.comparisonPercentage ?? 0;

    is6MonthsPositive = Number(sixMonthsPercent) >= 0;
    isOneYearPositive = Number(oneYearPercent) >= 0;
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
            className="anniversaryGmailIcon"
            style={{ cursor: 'pointer', display: 'block' }}
            onClick={() => handleEmailClick(email)}
          />

          <div style={{ alignSelf: 'center' }}>
            <p className="m-0" style={{ color: darkMode ? '#fff' : '#000' }}>
              {`${firstName || ''} ${lastName || ''}`}
            </p>

            <small style={{ color: darkMode ? '#aaa' : '#555' }}>
              Joined: {createdDate ? new Date(createdDate).toLocaleDateString() : 'N/A'}
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
      sixMonths: sixMonthsData?.users ?? [],
      oneYear: oneYearData?.users ?? [],
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'anniversaries.json';
    link.click();

    URL.revokeObjectURL(url);
  };

  const filterUsers = users =>
    users.filter(user =>
      `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(search.toLowerCase()),
    );

  const usersFilteredSixMonthsData = filterUsers(sixMonthsData?.users ?? []).map(item =>
    getAnniversaryListItem(item, 6),
  );

  const usersFilteredOneYearData = filterUsers(oneYearData?.users ?? []).map(item =>
    getAnniversaryListItem(item, 12),
  );

  const searchInputStyle = {
    margin: '10px 0',
    padding: '5px 10px',
    borderRadius: '5px',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid gray',
    width: '60%',
    backgroundColor: darkMode ? '#111827' : '#fff',
    color: darkMode ? '#f8fafc' : '#111827',
    WebkitTextFillColor: darkMode ? '#f8fafc' : '#111827',
  };

  const renderAnniversariesList = () => {
    if (usersFilteredSixMonthsData.length === 0 && usersFilteredOneYearData.length === 0) {
      return (
        <li
          className="text-center"
          style={{
            color: darkMode ? '#fff' : '#000',
            listStyle: 'none',
          }}
        >
          No anniversaries found
        </li>
      );
    }

    return (
      <>
        {usersFilteredSixMonthsData}
        {usersFilteredOneYearData}
      </>
    );
  };

  return (
    <div className="mt-3">
      <style>
        {`
          #anniversary-search::placeholder {
            color: ${darkMode ? 'rgba(248,250,252,0.75)' : 'rgba(17,24,39,0.6)'} !important;
          }

          .anniversaryGmailIcon {
            color: #ea4335 !important;
            fill: #ea4335 !important;
          }

          .anniversaryGmailIcon path {
            fill: #ea4335 !important;
          }
        `}
      </style>

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
            <span style={{ color: darkMode ? '#fff' : 'gray' }}>6 months:</span>

            <span className={`text-center ${is6MonthsPositive ? 'text-success' : 'text-danger'}`}>
              {`${is6MonthsPositive ? '+' : ''}${sixMonthsPercent}%`}(
              {sixMonthsData?.users?.length ?? 0} users)
            </span>
          </p>

          <p style={{ display: 'flex', gap: '5px' }}>
            <span style={{ color: darkMode ? '#fff' : 'gray' }}>1 year:</span>

            <span className={`text-center ${isOneYearPositive ? 'text-success' : 'text-danger'}`}>
              {`${isOneYearPositive ? '+' : ''}${oneYearPercent}%`}(
              {oneYearData?.users?.length ?? 0} users)
            </span>
          </p>
        </span>
      )}

      <div className="d-flex justify-content-between align-items-center mb-2">
        <input
          id="anniversary-search"
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={searchInputStyle}
        />

        <button onClick={exportData} className="btn btn-secondary">
          Export Data
        </button>
      </div>

      <ul className="w-90 overflow-auto" style={{ maxHeight: '410px' }}>
        {renderAnniversariesList()}
      </ul>
    </div>
  );
}
