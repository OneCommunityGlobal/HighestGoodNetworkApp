import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

import { v4 as uuid } from 'uuid';
import { ENDPOINTS } from '../../../utils/URL';

function TotalorgSummaryEmail() {
  // State for managing email recipients
  const [recipients, setRecipients] = useState('');
  const [recipientList, setRecipientList] = useState([]);

  const [emailStatus, setEmailStatus] = useState('');

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

  // Handle removing a recipient
  const handleRemoveRecipient = email => {
    const updatedList = recipientList.filter(recipient => recipient !== email);
    setRecipientList(updatedList);
  };

  // Handle sending the email
  const handleSendEmail = async () => {
    try {
      setEmailStatus('Sending...');

      const emailData = {
        recipients: recipientList,
      };

      const response = await axios.post(ENDPOINTS.SEND_EMAIL_REPORT(), emailData);

      if (response.status === 200) {
        setEmailStatus('Email sent successfully!');
      } else {
        setEmailStatus('Failed to send email.');
      }
    } catch (error) {
      setEmailStatus('Failed to send email.');
    }
  };

  // Darkmode
  const darkMode = useSelector(state => state.theme.darkMode);
  useEffect(() => {
    const rootDiv = document.getElementById('root');
    if (darkMode) {
      rootDiv.classList.add('bg-dark', 'text-light');
    } else {
      rootDiv.classList.remove('bg-dark', 'text-light');
    }
  }, [darkMode]);

  return (
    <div>
      <h1 className={`h1 ${darkMode ? 'text-light' : ''}`}>Total Org Summary Email</h1>
      {/* Recipient Management */}
      <div className={`container ${darkMode ? 'bg-dark text-light' : ''}`}>
        <h2>Recipients</h2>
        <div className={`container-fluid ${darkMode ? 'bg-dark text-light' : ''}`}>
          {recipientList.map((email, index) => (
            <div
              key={uuid() + String(index)}
              className={`row ${darkMode ? 'bg-dark text-light' : ''}`}
            >
              <span className="col">{email}</span>
              <span className="col">
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(email)}
                  className="btn btn-danger"
                >
                  Remove
                </button>
              </span>
            </div>
          ))}
        </div>
        <div className={`row ${darkMode ? 'bg-dark text-light' : ''}`}>
          <span className="col">
            <input
              type="email"
              placeholder="Enter email address"
              value={recipients}
              className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
              onChange={e => setRecipients(e.target.value)}
            />
          </span>
          <span className="col">
            <button type="button" onClick={handleAddRecipient} className="btn btn-primary">
              Add Recipient
            </button>
          </span>
        </div>

        {/* Send Email Button */}
        <div>
          <button type="button" onClick={handleSendEmail} className="btn btn-success">
            Send Email
          </button>
          {emailStatus && <p>{emailStatus}</p>}
        </div>
      </div>
    </div>
  );
}

export default TotalorgSummaryEmail;
