import { getTotalOrgSummary } from 'actions/totalOrgSummary';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function AnniversaryCelebrated({
  fromDate,
  toDate,
  fromOverDate,
  toOverDate,
  darkMode,
}) {
  const dispatch = useDispatch();
  const [anniversaryStatsOnSetDate, setAnniversaryStatsOnSetDate] = useState([]);
  const [anniversaryStatsOnLastDate, setAnniversaryStatsOnLastDate] = useState([]);
  const [anniversaryStatsOnSetDateQuantity, setAnniversaryStatsOnSetDateQuantity] = useState(0);
  const [anniversaryStatsOnlastDateQuantity, setAnniversaryStatsOnSlastDateQuantity] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log({ anniversaryStatsOnSetDate });
    // eslint-disable-next-line no-console
    console.log({ anniversaryStatsOnSetDateQuantity });

    setAnniversaryStatsOnSetDateQuantity(anniversaryStatsOnSetDate.length);
  }, [anniversaryStatsOnSetDate, anniversaryStatsOnSetDateQuantity]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log({ anniversaryStatsOnLastDate });
    // eslint-disable-next-line no-console
    console.log({ anniversaryStatsOnlastDateQuantity });
    setAnniversaryStatsOnSlastDateQuantity(anniversaryStatsOnLastDate.length);
  }, [anniversaryStatsOnLastDate, anniversaryStatsOnlastDateQuantity]);

  useEffect(() => {
    const fectchOnSetDate = async () => {
      const response = await dispatch(getTotalOrgSummary(fromDate, toDate));
      // eslint-disable-next-line no-console
      console.log({ response });
      setAnniversaryStatsOnSetDate(response.data.anniversaryStats);
    };
    fectchOnSetDate();
  }, [fromDate, toDate]);

  useEffect(() => {
    const fectchOnLastDate = async () => {
      const res = await dispatch(getTotalOrgSummary(fromOverDate, toOverDate));
      // eslint-disable-next-line no-console
      console.log({ res });
      setAnniversaryStatsOnLastDate(res.data.anniversaryStats);
    };
    fectchOnLastDate();
  }, [fromOverDate, toOverDate]);

  return (
    <div>
      <h6 className={`${darkMode ? 'text-light' : 'text-dark'} fw-bold text-center`}>
        Anniversary Celebrated
      </h6>
      {Array.isArray(anniversaryStatsOnSetDate) && anniversaryStatsOnSetDate.length > 0 ? (
        anniversaryStatsOnSetDate.map(anniversary => (
          <li key={anniversary._id} className="d-flex flex-column">
            <p>{`${anniversary.firstName} ${anniversary.lastName}`}</p>
          </li>
        ))
      ) : (
        <p>There are no Anniversaries in this period</p>
      )}
    </div>
  );
}
