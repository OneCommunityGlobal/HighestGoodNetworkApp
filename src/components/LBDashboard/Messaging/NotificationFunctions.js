import { toast } from 'react-toastify';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

const BrowserNotification = (title, options) => {
    try {
      if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
        const notification = new Notification(title, options);
        notification.onclick = () => {
          const targetUrl = notification.data?.url || '/';
          window.open(targetUrl, '_blank');
        };
      }
    } catch (error) {
      throw new Error('Browser Notification Error: ', error);
    }
  };

export const sendINAppNotification = async (data,userPreferences,senderUser) => {
    if(userPreferences.notifyInApp === false) return;
    // const senderId = data.payload.sender?.toString();
    // const senderUser = users.userProfilesBasicInfo.filter(e => e._id.toString() === senderId);
    const senderName = `${senderUser[0].firstName} ${senderUser[0].lastName}`;

    if (document.visibilityState === 'hidden') {
        BrowserNotification(`New message from ${senderName}`, {
            body: data.payload.content,
            icon: `${window.location.origin}/pfp-default-header.png`,
            // image: `/pfp-default-header.png`,
            tag: '/new-message',
            requireInteraction: true,
            data: { url: `/lbdashboard/messaging?chat=${data.payload.sender}` },
        });
        } else {
        toast(`📩 New message from ${senderName}:  ${data.payload.content}`, {
            position: 'top-right',
            autoClose: 5000,
            className: 'lb-messaging-toast',
            closeOnClick: true, // needed for click-to-open to work
            onClick: () => {
            window.location.href = `/lbdashboard/messaging?chat=${data.payload.sender}`;
            },
        });
    }
}

export const sendEmailNotification = async (data,users, userPreferences,senderUser) => {
    try {
        if(userPreferences.notifyEmail === false) return;
        const senderName = `${senderUser[0].firstName} ${senderUser[0].lastName}`;
        const receiverUser = users.userProfilesBasicInfo.filter(e => e._id.toString() === data.payload.receiver);
        axios.post(ENDPOINTS.LB_SEND_EMAIL,{email: receiverUser[0].email, 
            content: data.payload.content, senderName: senderName})
            .then((response) => {
                console.log('Email sent successfully:', response.data);
            })
    } catch (error) {
        toast.error('Error sending email notification:');
        console.error('Error sending email notification:', error);      
    }
}

export const sendSMSNotification = async (data,users, userPreferences,senderUser) => {
    // receivernumber,receiverName, content, 
    const receiverUser = users.userProfilesBasicInfo.filter(e => e._id.toString() === data.payload.receiver);
    console.log("receiverUser",receiverUser);
}