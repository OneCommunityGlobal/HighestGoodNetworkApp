// import React, { useState } from "react";

// const TestEventRegistration = () => {
//   // State to store the event name and error message
//   const [formValues, setFormValues] = useState({
//     eventName: "",

//   });
//   const [errors, setErrors] = useState({});
//   const [message, setMessage] = useState("");
//   const [events, setEvents] = useState([]);

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       const response = await fetch("/EventRegistration");
//       if (response.ok) {
//         const data = await response.json();
//         setEvents(data);
//       } else {
//         console.error('Failed to fetch events');
//       }
//     } catch (error) {
//       console.error('Error fetching events:', error);
//     }
//   };

//   // Handle changes in the input field
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormValues((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     setErrors((prev) => ({
//       ...prev,
//       [name]: "",
//     })); // Clear error when user starts typing
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = {};
//     if (!formValues.eventName.trim()) {
//       newErrors.eventName = "Event Name is required.";
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//     } else {
//         try {
//             const response = await fetch("/EventRegistration", {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify({ eventName: formValues.eventName }),
//             });

//             const data = await response.json();

//             if (response.ok) {
//               setMessage(data.message);
//               setFormValues({ eventName: "" });
//               fetchEvents(); // Refresh the events list
//             } else {
//               setErrors({ eventName: data.error });
//             }
//           } catch (error) {
//             setErrors({ eventName: "An error occurred. Please try again." });
//           }
//     }
//   };

//   // Handle cancel button
//   const handleCancel = () => {
//     setFormValues({
//         eventName: "",
//     });
//     setErrors({});
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
//       <div style={{ marginBottom: "1rem" }}>
//         <label htmlFor="eventName" style={{ display: "block", marginBottom: "0.5rem" }}>
//           Event Name: <span style={{ color: "red" }}>*</span>
//         </label>
//         <input
//           type="text"
//           id="eventName"
//           name="eventName"
//           value={formValues.eventName}
//           onChange={handleChange}
//           style={{
//             width: "100%",
//             padding: "0.5rem",
//             border: "1px solid #ccc",
//             borderRadius: "4px",
//           }}
//         />
//         {errors.eventName && (
//           <span style={{ color: "red", fontSize: "0.875rem" }}>{errors.eventName}</span>
//         )}
//       </div>
//       <div style={{ display: "flex", justifyContent: "space-between" }}>
//         <button
//           type="button"
//           onClick={handleCancel}
//           style={{
//             padding: "0.5rem 1rem",
//             backgroundColor: "#f44336",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor: "pointer",
//           }}
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           style={{
//             padding: "0.5rem 1rem",
//             backgroundColor: "#4CAF50",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor: "pointer",
//           }}
//         >
//           Submit
//         </button>
//       </div>
//     </form>
//   );
// };

// export default TestEventRegistration;

import React, { useState, useEffect } from 'react';
import { ApiEndpoint, ENDPOINTS } from '../../utils/URL';
import axios from 'axios';
//import httpService from '../../services/httpService';

const EventRegistration = () => {
  const [formValues, setFormValues] = useState({
    eventName: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
        const token = localStorage.getItem("token"); // Replace with actual key
        if (!token) {
            console.error("No token found. Please log in.");
            return;
        }
        const APIEndpoint =
        process.env.REACT_APP_APIENDPOINT || 'https://hgn-rest-beta.azurewebsites.net/api';
        console.log("api endpoint: ",ApiEndpoint)
        try {
            const response = await fetch(
                `${APIEndpoint}/EventRegistration`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add Authorization header
                    },
                }
            );
    
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            } else {
                console.error("Failed to fetch events");
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!formValues.eventName.trim()) {
      newErrors.eventName = 'Event Name is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
        // const token = localStorage.getItem("token");
        // console.log("token: ",token)
        // if (!token) {
        //     console.error("No token found. Please log in.");
        //     return;
        // }
        const APIEndpoint =
        process.env.REACT_APP_APIENDPOINT || 'https://hgn-rest-beta.azurewebsites.net/api';      
        console.log("api endpoint: ",ApiEndpoint)
        try {
            const response = await fetch(
                `${APIEndpoint}/EventRegistration`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // Add Authorization header
                    },
                    body: JSON.stringify(formValues), // Convert formValues to JSON
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Event registered successfully:", data);
            setMessage("Event registered successfully!");
            setFormValues({ eventName: "" });
        } catch (error) {
            console.error("Error registering event:", error);
        }
    //   console.log(formValues.eventName);
    //   const token = localStorage.getItem('tokenKey');
    //   fetch('https://hgn-rest-beta.azurewebsites.net/api/EventRegistration', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization:
    //         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2NzM2YTc3MjJjNzYwMTIxMjRiZDhiNTgiLCJyb2xlIjoiT3duZXIiLCJwZXJtaXNzaW9ucyI6eyJmcm9udFBlcm1pc3Npb25zIjpbXSwiYmFja1Blcm1pc3Npb25zIjpbXX0sImFjY2VzcyI6eyJjYW5BY2Nlc3NCTVBvcnRhbCI6ZmFsc2V9LCJlbWFpbCI6InByYXR5dXNocHNhaHUyQGdtYWlsLmNvbSIsImV4cGlyeVRpbWVzdGFtcCI6IjIwMjUtMDEtMDdUMDk6MTA6NTcuODQzWiIsImlhdCI6MTczNTM3NzA1N30.ys7M4U9Zr4MZFo2XUE5gmmsKUzUZDvlxiy9FJI0cY1Q',
    //     },
    //     body: JSON.stringify(formValues), // Convert formValues to JSON
    //   })
    //     .then(response => {
    //       if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //       }
    //       return response.json();
    //     })
    //     .then(data => {
    //       console.log('Event registered successfully:', data);
    //     })
    //     .catch(error => {
    //       console.error('Error registering event:', error);
    //     });
    }
  };

  const handleCancel = () => {
    setFormValues({ eventName: '' });
    setErrors({});
    setMessage('');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Event Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="eventName" className="block text-gray-700 text-sm font-bold mb-2">
            Event Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formValues.eventName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.eventName && <p className="text-red-500 text-xs italic">{errors.eventName}</p>}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
      {message && <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">{message}</div>}
    </div>
  );
};

export default EventRegistration;
