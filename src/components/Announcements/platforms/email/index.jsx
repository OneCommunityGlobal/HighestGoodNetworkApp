import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { sendEmail, broadcastEmailsToAll } from '../../../../actions/sendEmails.jsx';
import NewsletterTemplateEditor from '../../NewsletterTemplateEditor.jsx';

export default function EmailPanel({ title, initialEmail }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const [emailContent, setEmailContent] = useState('');

  const handleContentChange = htmlContent => {
    setEmailContent(htmlContent);
  };

  const handleSendEmails = (emailList, emailMetadata = {}) => {
    if (!emailContent || emailContent.trim() === '') {
      toast.error('Error: Email content cannot be empty.');
      return;
    }

    const subject = emailMetadata.subject || (title ? 'Anniversary congrats' : 'Weekly Update');
    const fromName = emailMetadata.fromName || 'One Community';
    const fromEmail = emailMetadata.fromEmail || 'updates@onecommunityglobal.org';
    const htmlContent = emailMetadata.htmlContent || emailContent;

    dispatch(sendEmail(emailList, subject, htmlContent, fromName, fromEmail));
  };

  const handleBroadcastEmails = (emailMetadata = {}) => {
    if (!emailContent || emailContent.trim() === '') {
      toast.error('Error: Email content cannot be empty.');
      return;
    }

    const subject = emailMetadata.subject || 'Weekly Update';
    const fromName = emailMetadata.fromName || 'One Community';
    const fromEmail = emailMetadata.fromEmail || 'updates@onecommunityglobal.org';
    const htmlContent = emailMetadata.htmlContent || emailContent;
    const wrappedContent = `<div style="max-width:900px;width:100%;margin:auto;">${htmlContent}</div>`;

    dispatch(broadcastEmailsToAll(subject, wrappedContent, fromName, fromEmail));
  };

  return (
    <div className="email-update-container">
      <NewsletterTemplateEditor
        onContentChange={handleContentChange}
        onSendEmails={handleSendEmails}
        onBroadcastEmails={handleBroadcastEmails}
      />
    </div>
  );
}
