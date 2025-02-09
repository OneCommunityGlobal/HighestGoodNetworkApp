import { useHistory } from 'react-router-dom';
import { getTotalOrgSummary } from 'actions/totalOrgSummary';
import { useEffect, useState } from 'react';
import { IoPersonOutline } from 'react-icons/io5';
import { SiGmail } from 'react-icons/si';
import { useDispatch } from 'react-redux';

export default function AnniversaryCelebrated({
  fromDate,
  toDate,
  fromOverDate,
  toOverDate,
  darkMode,
}) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [anniversaryStatsOnSetDate, setAnniversaryStatsOnSetDate] = useState([]);
  const [anniversaryStatsOnLastDate, setAnniversaryStatsOnLastDate] = useState([]);
  const [anniversaryStatsOnSetDateQuantity, setAnniversaryStatsOnSetDateQuantity] = useState(0);
  const [anniversaryStatsOnLastDateQuantity, setAnniversaryStatsOnSLastDateQuantity] = useState(0);
  const percentageChange = (
    (anniversaryStatsOnSetDateQuantity / anniversaryStatsOnLastDateQuantity - 1) *
    100
  ).toFixed(2);
  const isPositive = percentageChange >= 0;
  const sign = isPositive ? '+' : '';

  useEffect(() => {
    setAnniversaryStatsOnSetDateQuantity(anniversaryStatsOnSetDate.length);
  }, [anniversaryStatsOnSetDate, anniversaryStatsOnSetDateQuantity]);

  useEffect(() => {
    setAnniversaryStatsOnSLastDateQuantity(anniversaryStatsOnLastDate.length);
  }, [anniversaryStatsOnLastDate, anniversaryStatsOnLastDateQuantity]);

  useEffect(() => {
    const fectchOnSetDate = async () => {
      const response = await dispatch(getTotalOrgSummary(fromDate, toDate));
      setAnniversaryStatsOnSetDate(response.data.anniversaryStats);
    };
    fectchOnSetDate();
  }, [fromDate, toDate]);

  useEffect(() => {
    const fectchOnLastDate = async () => {
      const res = await dispatch(getTotalOrgSummary(fromOverDate, toOverDate));
      setAnniversaryStatsOnLastDate(res.data.anniversaryStats);
    };
    fectchOnLastDate();
  }, [fromOverDate, toOverDate]);

  const handleEmailClick = email => {
    history.push('/sendemail', { state: { email } });
  };

  return (
    <div>
      <h4 className={`${darkMode ? 'text-light' : 'text-dark'} fw-bold text-center`}>
        Anniversary Celebrated
      </h4>
      <span
        className={`text-center ${isPositive ? 'text-success' : 'text-danger'}`}
        style={{ fontWeight: 'bold' }}
      >
        {sign}
        {percentageChange}% week over week
      </span>
      <ul className="w-90 overflow-auto" style={{ maxHeight: '220px' }}>
        {Array.isArray(anniversaryStatsOnSetDate) && anniversaryStatsOnSetDate.length > 0 ? (
          anniversaryStatsOnSetDate.map(item => (
            <li key={item._id} className="d-flex flex-column ">
              <div className="d-flex flex-row m-2">
                {item.profilePic ? (
                  <img
                    src={item.profilePic}
                    alt="profile"
                    className="rounded-circle ms-5"
                    style={{ width: '30px', height: '30px' }}
                  />
                ) : (
                  <IoPersonOutline size={30} className="mx-2" />
                )}
                <SiGmail
                  size={30}
                  color="red"
                  className="mx-2 "
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleEmailClick(item.email)}
                />
                <p className="mx-2">{`${item.firstName} ${item.lastName}`}</p>
              </div>
            </li>
          ))
        ) : (
          <p>There are no Anniversaries in this period</p>
        )}
      </ul>
    </div>
  );
}
