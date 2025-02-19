import { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Table from 'react-bootstrap/Table';
import { formatDate } from '../../utils/formatDate';
import UserTableFooter from './UserTableFooter';
import '../Header/DarkMode.css';
import { boxStyle, boxStyleDark } from '../../styles';
import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';

const baseUrl = window.location.origin;

// Define Table Header
const TABLE_HEADER = [
  'Email',
  'Weekly Committed Hours',
  'Created Date',
  'Expired Date',
  'Status',
  'Refresh',
  'Cancel',
];
// Define Status Column Text
const INV_STATUS = {
  ACITVE: 'Active',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

function TableFilter({
  emailFilter,
  statusFilter,
  sortByCreationDateDesc,
  sortByExpiredDateDesc,
  setEmailFilter,
  setStatusFilter,
  setSortByCreationDateDesc,
  setSortByExpiredDateDesc,
  // darkMode,
}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <tr>
      <td style={{ width: '20%' }}>
        {/* <label htmlFor="email-filter">Email</label> */}
        <input
          id="email-filter"
          type="text"
          value={emailFilter}
          onChange={e => setEmailFilter(e.target.value)}
          className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
        />
      </td>
      <td id="weekly-committed" style={{ width: '10%' }} />
      <td style={{ width: '15%' }}>
        {/* <label htmlFor=" id='created-date'">Status</label> */}
        <select
          id=" id='created-date'"
          value={sortByCreationDateDesc}
          onChange={e => {
            setSortByCreationDateDesc(e.target.value);
            if (e.target.value !== 'default') {
              setSortByExpiredDateDesc('default');
            }
          }}
          className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
        >
          <option value="default">Select a Option</option>
          <option value>Latest First</option>
          <option value={false}>Oldest First</option>
        </select>
      </td>
      <td style={{ width: '15%' }}>
        {/* <label htmlFor=" id='expired-date'">Status</label> */}
        <select
          id=" id='expired-date'"
          value={sortByExpiredDateDesc}
          onChange={e => {
            setSortByExpiredDateDesc(e.target.value);
            if (e.target.value !== 'default') {
              setSortByCreationDateDesc('default');
            }
          }}
          className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
        >
          <option value="default">Select a Option</option>
          <option value>Latest First</option>
          <option value={false}>Oldest First</option>
        </select>
      </td>
      <td style={{ width: '15%' }}>
        <div className="table-filter__item">
          {/* <label htmlFor="status-filter">Status</label> */}
          <select
            id="status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
          >
            <option value="">All</option>
            <option value={INV_STATUS.ACITVE}>Active</option>
            <option value={INV_STATUS.EXPIRED}>Expired</option>
            <option value={INV_STATUS.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </td>
      <td id="refresh" style={{ width: '10%' }} />
      <td id="cancel" style={{ width: '10%' }} />
    </tr>
  );
}

function SetupHistoryPopup(props) {
  const darkMode = useSelector(state => state.theme.darkMode);
  // const [alert, setAlert] = useState({ visibility: 'hidden', message: '', state: 'success' });
  // const patt = RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
  // const baseUrl = window.location.origin;
  const [setupInvitationData, setSetupInvitationData] = useState([]);
  const [filteredSetupInvitationData, setFilteredSetupInvitationData] = useState([]);
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortByCreationDateDesc, setSortByCreationDateDesc] = useState('default');
  const [sortByExpiredDateDesc, setSortByExpiredDateDesc] = useState('default');
  const [selectedPage, setSelectedPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filteredUserDataCount, setFilteredUserDataCount] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [noDataMsg, setNoDataMsg] = useState('No Data');

  const closePopup = () => {
    props.onClose();
  };

  /**
   * Apply filters and return a sorted and filtered data list.
   * @param {*} data
   * @returns
   */
  const transformedTableData = inputdata => {
    /**
     * Filter data list by email and status
     */
    const data = inputdata || [];
    const filteredList = data.filter(invitation => {
      const EXPIRED = invitation.expiredDate < Date.now();
      const CANCELLED = invitation.isCancelled;

      const emailMatch = invitation.email.toLowerCase().includes(emailFilter.toLowerCase());
      let statusMatch = true;
      if (statusFilter === INV_STATUS.ACITVE) {
        statusMatch = !EXPIRED && !CANCELLED;
      } else if (statusFilter === INV_STATUS.CANCELLED) {
        statusMatch = CANCELLED;
      } else if (statusFilter === INV_STATUS.EXPIRED) {
        statusMatch = EXPIRED;
      }

      return emailMatch && statusMatch;
    });

    const compareByCreationAndExpirationDate = (a, b) => {
      const createdDateComparison =
        sortByCreationDateDesc === 'true' || sortByCreationDateDesc === 'default'
          ? new Date(b.createdDate) - new Date(a.createdDate)
          : new Date(a.createdDate) - new Date(b.createdDate);
      if (createdDateComparison !== 0 && sortByCreationDateDesc !== 'default') {
        return createdDateComparison;
      }

      // If sortByExpiredDateDesc is true, sort in descending order, else sort in ascending order
      const expiredDateComparison =
        sortByExpiredDateDesc === 'true' || sortByExpiredDateDesc === 'default'
          ? new Date(b.expiration) - new Date(a.expiration)
          : new Date(a.expiration) - new Date(b.expiration);
      return expiredDateComparison;
    };
    filteredList.sort(compareByCreationAndExpirationDate);

    setFilteredUserDataCount(filteredList.length);
    // pagination
    return filteredList.slice((selectedPage - 1) * pageSize, selectedPage * pageSize);
  };

  useEffect(() => {
    if (props.open) {
      httpService
        .get(ENDPOINTS.GET_SETUP_INVITATION())
        .then(res => {
          //  setSetupInvitationData(res.data);
          setSetupInvitationData(() => {
            const transformedData = transformedTableData(res.data);
            setFilteredSetupInvitationData(transformedData);
            setFilteredUserDataCount(
              transformedData.length && transformedData.length > 0 ? transformedData.length : 0,
            );
            return res.data;
          });
        })
        .catch(err => {
          if (err?.response?.status === 403) {
            const msg = err?.response?.data;
            setNoDataMsg(msg);
          } else {
            toast.error(`Fetching error: Invitation History.`);
            setNoDataMsg('No Data');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [props.open]);

  /**
   * Triggered data fetching when a new user invitation is sent or a record is updated.
   */
  useEffect(() => {
    if (props.shouldRefreshInvitationHistory && props.open === true) {
      httpService
        .get(ENDPOINTS.GET_SETUP_INVITATION())
        .then(res => {
          //  setSetupInvitationData(res.data);
          setSetupInvitationData(() => {
            const transformedData = transformedTableData(res.data);
            setFilteredSetupInvitationData(transformedData);
            setFilteredUserDataCount(
              transformedData.length && transformedData.length > 0 ? transformedData.length : 0,
            );
            return res.data;
          });
        })
        .catch(() => {
          toast.error(`Fetching error: Invitation History.`);
        })
        .finally(() => {
          setLoading(false);
          props.handleShouldRefreshInvitationHistory();
        });
    }
    return () => {
      // cleanup
    };
  }, [props.shouldRefreshInvitationHistory, props.open]);

  useEffect(() => {
    setFilteredSetupInvitationData(transformedTableData(setupInvitationData));
  }, [
    emailFilter,
    statusFilter,
    sortByCreationDateDesc,
    sortByExpiredDateDesc,
    selectedPage,
    pageSize,
  ]);

  const onPageSelect = page => {
    setSelectedPage(page);
  };

  const onSelectPageSize = size => {
    setPageSize(size);
  };

  const onClickRefresh = (e, index) => {
    // send API to refresh the invitation
    setIsButtonDisabled(true);

    httpService
      .post(ENDPOINTS.REFRESH_SETUP_INVITATION_TOKEN(), {
        token: filteredSetupInvitationData[index].token,
        baseUrl,
      })
      .then(res => {
        // debugger;
        if (res.status === 200) {
          // Close and reload data from database.
          props.handleShouldRefreshInvitationHistory();
          closePopup();
          toast.success('Invitation Refreshed!');
        }
      })
      .catch(() => {
        toast.error('Invitation Refresh Failed!');
      })
      .finally(() => {
        setIsButtonDisabled(false);
      });
  };

  const onClickCancel = (e, index) => {
    setIsButtonDisabled(true);
    httpService
      .post(ENDPOINTS.CANCEL_SETUP_INVITATION_TOKEN(), {
        token: filteredSetupInvitationData[index].token,
      })
      .then(res => {
        if (res.status === 200) {
          // Close and reload data from database.
          props.handleShouldRefreshInvitationHistory();
          closePopup();
          toast.success('Invitation Cancelled!');
        }
      })
      .catch(() => {
        toast.error('Invitation Cancel Failed!');
      })
      .finally(() => {
        setIsButtonDisabled(false);
      });
  };

  return (
    <Modal
      isOpen={props.open}
      toggle={closePopup}
      size="xl"
      className={darkMode ? 'dark-mode text-light' : ''}
    >
      <ModalHeader
        toggle={closePopup}
        cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
        className={darkMode ? 'bg-space-cadet' : ''}
      >
        Setup Invitation History
      </ModalHeader>
      <ModalBody
        style={{ minHeight: `${pageSize * 5}vh` }}
        className={darkMode ? 'bg-yinmn-blue' : ''}
      >
        <div className="setup-invitation-popup-section">
          {loading && <div>Data Loading...</div>}
          {/* {loading ? <div>Data Loading...</div> :  */}
          {!loading && setupInvitationData && setupInvitationData.length > 0 && (
            <>
              <Table responsive className={`table table-bordered ${darkMode ? 'text-light' : ''}`}>
                <thead>
                  <tr className={darkMode ? 'bg-space-cadet' : ''}>
                    {TABLE_HEADER.map(key => (
                      <th key={key}> {key} </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={darkMode ? 'dark-mode' : ''}>
                  <TableFilter
                    emailFilter={emailFilter}
                    statusFilter={statusFilter}
                    sortByCreationDateDesc={sortByCreationDateDesc}
                    sortByExpiredDateDesc={sortByExpiredDateDesc}
                    setEmailFilter={setEmailFilter}
                    setStatusFilter={setStatusFilter}
                    setSortByCreationDateDesc={setSortByCreationDateDesc}
                    setSortByExpiredDateDesc={setSortByExpiredDateDesc}
                    darkMode={darkMode}
                  />
                  {filteredSetupInvitationData.map((record, index) => {
                    return (
                      <tr key={record.id || record.email || index}>
                        <td>{record.email}</td>
                        <td>{record.weeklyCommittedHours}</td>
                        <td>{formatDate(record.createdDate)}</td>
                        <td>{formatDate(record.expiration)}</td>
                        {/* <td>{new Date(record.expiration) > Date.now() && !record.isCancelled ? INV_STATUS.ACITVE :
                              record.isCancelled ? INV_STATUS.CANCELLED :
                              new Date(record.expiration) < Date.now() ? INV_STATUS.EXPIRED : null}</td> */}
                        <td>
                          {(() => {
                            if (new Date(record.expiration) > Date.now() && !record.isCancelled) {
                              return INV_STATUS.ACITVE;
                            }
                            if (record.isCancelled) {
                              return INV_STATUS.CANCELLED;
                            }
                            if (new Date(record.expiration) < Date.now()) {
                              return INV_STATUS.EXPIRED;
                            }
                            return null;
                          })()}
                        </td>
                        <td>
                          <Button
                            key={record}
                            color="primary"
                            disabled={isButtonDisabled}
                            onClick={e => onClickRefresh(e, index)}
                          >
                            Refresh
                          </Button>
                        </td>
                        <td>
                          <Button
                            key={record}
                            color="danger"
                            onClick={e => onClickCancel(e, index)}
                          >
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <UserTableFooter
                datacount={filteredUserDataCount}
                selectedPage={selectedPage}
                onPageSelect={onPageSelect}
                onSelectPageSize={onSelectPageSize}
                pageSize={pageSize}
                darkMode={darkMode}
              />
            </>
          )}
          {/* : (
          <div>{noDataMsg}</div>
            )} */}
          {!loading && (!setupInvitationData || setupInvitationData.length === 0) && (
            <div>{noDataMsg}</div>
          )}
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default SetupHistoryPopup;
