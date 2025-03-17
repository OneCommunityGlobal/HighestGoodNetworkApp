import { useEffect, useState, useMemo, useCallback } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import './TotalReport.css';
import { Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import TotalReportBarGraph from './TotalReportBarGraph';
import Loading from '../../common/Loading';

function TotalContributorsReport(props) {
  const { startDate, endDate, userProfiles, darkMode } = props;
  const [totalContributorsReportDataLoading, setTotalContributorsReportDataLoading] = useState(true);
  const [totalContributorsReportDataReady, setTotalContributorsReportDataReady] = useState(false);
  const [showContributorsTable, setShowContributorsTable] = useState(false);
  const [allContributors, setAllContributors] = useState([]);

  const fromDate = useMemo(() => startDate ? startDate.toLocaleDateString('en-CA') : '', [startDate]);
  const toDate = useMemo(() => endDate ? endDate.toLocaleDateString('en-CA') : '', [endDate]);
  const userList = useMemo(() => {
    if (!userProfiles || !Array.isArray(userProfiles)) {
      console.error("🚨 Error: userProfiles is undefined or not an array.");
      return [];
    }
    return userProfiles.map(user => user._id);
  }, [userProfiles]);


  const loadContributorsData = useCallback(async () => {
    try {
      console.log("📢 Fetching Contributors Report from:", ENDPOINTS.TIME_ENTRIES_REPORTS_TOTAL_PEOPLE_REPORT);

      const url = ENDPOINTS.TIME_ENTRIES_REPORTS_TOTAL_PEOPLE_REPORT;
      const response = await axios.post(url, { users: userList, fromDate, toDate });

      console.log("✅ API Response:", response.data); // Debugging

      const contributors = response.data.map(entry => ({
        userId: entry.userId,
        userName: entry.userName,
        hours: entry.hours,
        minutes: entry.minutes,
        tangibleHours: entry.tangibleHours,
      }));

      // Filter contributors who logged **at least 10 tangible hours**
      const filteredContributors = contributors.filter(contributor => contributor.tangibleHours >= 10);
      console.log("✅ Filtered Contributors:", filteredContributors); // Debugging

      setAllContributors(filteredContributors);
    } catch (err) {
      console.error("🚨 API Load Error:", err.message);
    }
  }, [fromDate, toDate, userList]);



  useEffect(() => {
    setTotalContributorsReportDataReady(false);
    setTotalContributorsReportDataLoading(true);
    const controller = new AbortController();

    loadContributorsData(controller)
      .then(() => {
        setTotalContributorsReportDataLoading(false);
        setTotalContributorsReportDataReady(true);
      })
      .catch((error) => {
        console.error("Failed to load data:", error);
        setTotalContributorsReportDataLoading(false);
        setTotalContributorsReportDataReady(false);
      });

    return () => controller.abort();
  }, [loadContributorsData, startDate, endDate]);

  const onClickTotalContributorsDetail = () => setShowContributorsTable(prevState => !prevState);

  const totalContributorsTable = contributors => (
    <table className="table table-bordered table-responsive-sm">
      <thead className={darkMode ? 'bg-space-cadet text-light' : ''} style={{ pointerEvents: 'none' }}>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Contributor Name</th>
          <th scope="col">Tangible Hours Logged</th>
        </tr>
      </thead>
      <tbody className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
        {contributors.sort((a, b) => a.userName.localeCompare(b.userName)).map((contributor, index) => (
          <tr key={contributor.userId}>
            <td>{index + 1}</td>
            <td>{contributor.userName}</td>
            <td>{contributor.tangibleHours.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const totalContributorsInfo = contributors => {
    const totalTangibleTime = contributors.reduce((acc, obj) => acc + Number(obj.tangibleHours), 0);

    return (
      <div className={`total-container ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
        <div className={`total-title ${darkMode ? 'text-azure' : ''}`}>Total Contributors Report</div>
        <div className="total-period">
          In the period from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}:
        </div>
        <div className="total-item">
          <div className="total-number">{allContributors.length}</div>
          <div className="total-text">contributors have logged more than 10 tangible hours.</div>
        </div>
        <div className="total-item">
          <div className="total-number">{totalTangibleTime.toFixed(2)}</div>
          <div className="total-text">total tangible hours logged.</div>
        </div>
        {allContributors.length ? (
          <div className="total-detail">
            <Button onClick={onClickTotalContributorsDetail}>
              {showContributorsTable ? 'Hide Details' : 'Show Details'}
            </Button>
            <i
              className="fa fa-info-circle"
              data-tip
              data-for="totalContributorsDetailTip"
              data-delay-hide="0"
              aria-hidden="true"
              style={{ paddingLeft: '.32rem' }}
            />
            <ReactTooltip id="totalContributorsDetailTip" place="bottom" effect="solid">
              Click this button to show or hide the list of all contributors who logged at least 10 tangible hours.
            </ReactTooltip>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div>
      {!totalContributorsReportDataReady ? (
        <div style={{ textAlign: 'center' }}>
          {totalContributorsReportDataLoading ? (
            <>
              <Loading align="center" darkMode={darkMode} />
              <div style={{ marginTop: '10px', fontStyle: 'italic', color: 'gray' }}>
                🚀 Data is on a secret mission! 📊 Report is being generated. ✨
                <br />
                Please hang tight while we work our magic! 🧙‍♂️🔮
              </div>
            </>
          ) : (
            <div style={{ marginTop: '10px', fontStyle: 'italic', color: 'red' }}>
              ❌ Failed to load the report. Please try again later.
            </div>
          )}
        </div>
      ) : (
        <div>
          <div>{totalContributorsInfo(allContributors)}</div>
          <div>{showContributorsTable ? totalContributorsTable(allContributors) : null}</div>
        </div>
      )}
    </div>
  );
}

export default TotalContributorsReport;
