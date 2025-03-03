import { useHistory } from 'react-router-dom';
import { IoPersonOutline } from 'react-icons/io5';
import { SiGmail } from 'react-icons/si';
import Loading from 'components/common/Loading';
import sixMonthsAward from '../images/sixMonthsAward.svg';
import oneYearAward from '../images/oneYearAward.svg';

export default function AnniversaryCelebrated({ isLoading, data, darkMode }) {
  const history = useHistory();
  const sixMonthsData = data?.['6Months'] || { comparisonPercentage: 0 };
  const oneYearData = data?.['1Year'] || { comparisonPercentage: 0 };
  const sixMonthsPercent = sixMonthsData.comparisonPercentage;
  const oneYearPercent = oneYearData.comparisonPercentage;
  const is6MonthsPositive = sixMonthsPercent.toString().charAt(0) !== '-';
  const isOneYearPositive = oneYearPercent.toString().charAt(0) !== '-';

  const handleEmailClick = email => {
    history.push('/sendemail', { state: { email } });
  };

  const getAnniversaryListItem = (userData = [], anniversaryMonths = 6) => {
    const { _id, profilePic, email, firstName, lastName } = userData;
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
          {profilePic ? (
            <img
              src={profilePic}
              alt="profile"
              className="rounded-circle ms-5"
              style={{ width: '30px', height: '30px' }}
            />
          ) : (
            <IoPersonOutline size={30} className="" />
          )}
          <SiGmail
            size={30}
            color="red"
            className=""
            style={{ cursor: 'pointer' }}
            onClick={() => handleEmailClick(email)}
          />
          <p className="m-0 align-self-center">{`${firstName} ${lastName}`}</p>
          <img
            src={anniversaryMonths === 6 ? sixMonthsAward : oneYearAward}
            alt="six months award"
            style={{ width: '30px', height: '30px' }}
          />
        </div>
      </li>
    );
  };

  return (
    <div>
      <h4 className={`${darkMode ? 'text-light' : 'text-dark'} fw-bold text-center`}>
        Anniversary Celebrated
      </h4>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="w-100vh">
            <Loading />
          </div>
        </div>
      ) : (
        <>
          {/* Comparison percentages */}
          <span
            style={{
              fontWeight: 'bold',
              display: 'grid',
              justifyContent: 'center',
              justifyItems: 'center',
              fontSize: '20px',
              marginBottom: '5px',
            }}
          >
            <p style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
              <span style={{ color: 'gray' }}>6 months: </span>
              <span className={`text-center ${is6MonthsPositive ? 'text-success' : 'text-danger'}`}>
                {`${is6MonthsPositive ? '+' : ''}${sixMonthsPercent}%`}
              </span>
            </p>
            <p style={{ display: 'flex', gap: '5px' }}>
              <span style={{ color: 'gray' }}>1 year: </span>
              <span className={`text-center ${isOneYearPositive ? 'text-success' : 'text-danger'}`}>
                {`${isOneYearPositive ? '+' : ''}${oneYearPercent}%`}
              </span>
            </p>
          </span>

          {/* List of anniversaries */}
          <ul className="w-90 overflow-auto" style={{ maxHeight: '220px' }}>
            {sixMonthsData.users.map(item => getAnniversaryListItem(item, 6))}
            {oneYearData.users.map(item => getAnniversaryListItem(item, 12))}
          </ul>
        </>
      )}
    </div>
  );
}
