import { useState } from 'react';
import './Announcements.css'; // Import the CSS file

function Announcements() {
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [testEmail, setTestEmail] = useState('');

  const handleEmailListChange = e => {
    const emails = e.target.value.split(',');
    setEmailList(emails);
  };

  const handleEmailContentChange = e => {
    setEmailContent(e.target.value);
  };

  const handleTestEmailChange = e => {
    setTestEmail(e.target.value);
  };

  const handleSendTestEmail = () => {
    // Implement the logic to send a test email to the provided address (testEmail).
  };

  const handleSendEmails = () => {
    // Implement the logic to send emails to the entire emailList using the emailContent.
  };

  const CLIENT_EMAIL = process.env;

  console.log(CLIENT_EMAIL);

  return (
    <div className="email-update-container">
      <h2>Send Weekly Updates</h2>
      <label>
        Email List (comma-separated):
        <input type="text" onChange={handleEmailListChange} />
      </label>
      <br />
      <label>
        Email Content:
        <textarea rows="10" cols="50" onChange={handleEmailContentChange} />
      </label>
      <br />
      <button className="send-button" onClick={handleSendEmails}>
        Send Weekly Updates
      </button>
      <br />
      <hr />
      <h3>Test Email</h3>
      <label>
        Test Email:
        <input type="text" onChange={handleTestEmailChange} />
      </label>
      <br />
      <button className="send-button" onClick={handleSendTestEmail}>
        Send Test Email
      </button>
    </div>
  );
}

export default Announcements;
