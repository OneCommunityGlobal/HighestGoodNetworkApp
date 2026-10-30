/* Version 1.0.1 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

import { v4 as uuid } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './TotalOrgSummaryEmail.module.css';

function TotalOrgSummaryEmail() {
  // State for managing email recipients
  const [recipients, setRecipients] = useState('');
  const [recipientList, setRecipientList] = useState([]);
  const [emailSubject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Fetch admin list from the backend
  useEffect(() => {
    const fetchAdminList = async () => {
      try {
        // console.log('Endpoint:', ENDPOINTS.ADMIN_LIST()); // Log the endpoint for debugging
        const response = await axios.get(ENDPOINTS.ADMIN_LIST());

        // Extract the emailList from the response
        setRecipientList(response.data.emailList); // Use response.data.emailList
      } catch (error) {
        // console.error('Error fetching admin list:', error);
      }
    };
    fetchAdminList();
  }, []);

  // Handle adding new recipients
  const handleAddRecipient = () => {
    if (recipients.trim() !== '') {
      setRecipientList([...recipientList, recipients.trim()]);
      setRecipients('');
    }
  };

  const handlRemoveAllRecipients = () => {
    setRecipientList([]);
  };

  // Handle removing a recipient
  const handleRemoveRecipient = email => {
    const updatedList = recipientList.filter(recipient => recipient !== email);
    setRecipientList(updatedList);
  };
  function notify(type) {
    switch (type) {
      case 'info':
        toast.info('Sending email...');
        break;
      case 'error':
        toast.error('Failed to send email.');
        break;
      case 'success':
        toast.success('Email sent successfully!');
        break;
      default:
        break;
    }
  }
  // Handle sending the email
  const handleSendEmail = async () => {
    try {
      notify('info');

      const emailData = {
        recipients: recipientList,
        subject: emailSubject,
        message: body,
      };

      const response = await axios.post(ENDPOINTS.SEND_EMAIL_REPORT(), emailData);

      if (response.status === 200) {
        notify('success');
      } else {
        notify('error');
      }
    } catch (error) {
      notify('error');
    }
  };

  // Darkmode
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <div className={`${styles.page} ${darkMode ? 'bg-dark text-light' : ''}`}>
      <h1 className={`h1 ${darkMode ? 'text-light' : ''}`}>Total Org Summary Email</h1>
      {/* Recipient Management */}
      <div>
        <h2 className={`h2 ${darkMode ? 'text-light' : ''}`}>Recipients</h2>
        <ul className="list-unstyled mb-3">
          {recipientList.map((email, index) => (
            <li
              key={uuid() + String(index)}
              className="d-flex align-items-center justify-content-between mb-2"
            >
              <span className={styles.address}>{email}</span>
              <button
                type="button"
                onClick={() => handleRemoveRecipient(email)}
                className="btn btn-danger ml-3 flex-shrink-0"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="mb-3">
          <input
            type="email"
            placeholder="Enter email address"
            value={recipients}
            className={`form-control mb-2 ${darkMode ? 'bg-dark text-light' : ''}`}
            onChange={e => setRecipients(e.target.value)}
          />
          <div className="d-flex flex-wrap">
            <button
              type="button"
              onClick={handleAddRecipient}
              className="btn btn-primary mr-2 mb-2"
            >
              Add Recipient
            </button>
            <button
              type="button"
              onClick={handlRemoveAllRecipients}
              className="btn btn-danger mb-2"
            >
              Remove all
            </button>
          </div>
        </div>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Enter Subject"
            value={emailSubject}
            className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
            onChange={e => setSubject(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <textarea
            rows={5}
            placeholder="Enter Body"
            value={body}
            className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
            onChange={e => setBody(e.target.value)}
          />
        </div>
        <div>
          <button type="button" onClick={handleSendEmail} className="btn btn-success">
            Send Email
          </button>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default TotalOrgSummaryEmail;
