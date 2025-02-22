// 'use client';

// import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// // Sample data
// const eventTypeData = [
//   { name: 'Event Type 1', registered: 75 },
//   { name: 'Event Type 2', registered: 60 },
//   { name: 'Event Type 3', registered: 55 },
//   { name: 'Event Type 4', registered: 50 },
//   { name: 'Event Type 5', registered: 45 },
//   { name: 'Event Type 6', registered: 40 },
// ];

// const timeData = [
//   { time: '9:00', registered: 8, total: 12 },
//   { time: '11:00', registered: 15, total: 18 },
//   { time: '13:00', registered: 20, total: 25 },
//   { time: '15:00', registered: 25, total: 30 },
//   { time: '17:00', registered: 18, total: 20 },
//   { time: '19:00', registered: 10, total: 15 },
//   { time: '21:00', registered: 5, total: 8 },
// ];

// const participationCards = [
//   {
//     title: '5+',
//     subtitle: 'Repeated participation',
//     trend: '-10%',
//     trendType: 'negative',
//     participants: 3,
//   },
//   {
//     title: '2+',
//     subtitle: 'Repeated participation',
//     trend: '+25%',
//     trendType: 'positive',
//     participants: 3,
//   },
//   {
//     title: '<1',
//     subtitle: 'Repeated participation',
//     trend: '-5%',
//     trendType: 'negative',
//     participants: 3,
//   },
//   {
//     title: '420',
//     subtitle: 'Total Members',
//     trend: '+20%',
//     trendType: 'positive',
//   },
// ];

// export default function EventDashboard() {
//   return (
//     <div
//       style={{
//         maxWidth: '1200px',
//         margin: '0 auto',
//         padding: '20px',
//         fontFamily: 'Arial, sans-serif',
//       }}
//     >
//       <h1
//         style={{
//           fontSize: '24px',
//           fontWeight: 'bold',
//           marginBottom: '20px',
//           textAlign: 'center',
//         }}
//       >
//         Event Attendance Trend
//       </h1>
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: '20px',
//         }}
//       >
//         {/* Event Registration Trend (Type) */}
//         <div
//           style={{
//             background: 'white',
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//             padding: '20px',
//           }}
//         >
//           <h2
//             style={{
//               fontSize: '18px',
//               marginBottom: '15px',
//             }}
//           >
//             Event Registration Trend (Type)
//           </h2>
//           <div
//             style={{
//               marginBottom: '20px',
//             }}
//           >
//             <div
//               style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 fontSize: '14px',
//                 color: '#666',
//                 marginBottom: '10px',
//               }}
//             >
//               <span>Event Name</span>
//               <span>Registered Members</span>
//             </div>
//             {eventTypeData.map(event => (
//               <div
//                 key={event.name}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   marginBottom: '10px',
//                 }}
//               >
//                 <span
//                   style={{
//                     width: '100px',
//                     marginRight: '10px',
//                     fontSize: '14px',
//                     color: '#666',
//                   }}
//                 >
//                   {event.name}
//                 </span>
//                 <div
//                   style={{
//                     flexGrow: 1,
//                     height: '8px',
//                     background: '#e0e0e0',
//                     borderRadius: '4px',
//                     overflow: 'hidden',
//                   }}
//                 >
//                   <div
//                     style={{
//                       height: '100%',
//                       background: '#4A90E2',
//                       width: `${(event.registered / 75) * 100}%`,
//                     }}
//                   />
//                 </div>
//                 <span
//                   style={{
//                     marginLeft: '10px',
//                     fontSize: '14px',
//                     color: '#666',
//                   }}
//                 >
//                   {event.registered}
//                 </span>
//               </div>
//             ))}
//           </div>

//           <div
//             style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(3, 1fr)',
//               gap: '10px',
//             }}
//           >
//             {[
//               { title: '325', subtitle: 'Total Registered Members', isPrimary: true },
//               { title: 'Event Type 1', subtitle: 'Most Popular Event Type' },
//               { title: 'Event Type 6', subtitle: 'Least Popular Event Type' },
//             ].map(card => (
//               <div
//                 key={card}
//                 style={{
//                   background: '#f5f5f5',
//                   borderRadius: '4px',
//                   padding: '10px',
//                   textAlign: 'center',
//                 }}
//               >
//                 <h3 style={card.isPrimary ? { color: '#4A90E2' } : {}}>{card.title}</h3>
//                 <p
//                   style={{
//                     fontSize: '12px',
//                     color: '#666',
//                   }}
//                 >
//                   {card.subtitle}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Event Registration Trend (Time) */}
//         <div
//           style={{
//             background: 'white',
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//             padding: '20px',
//           }}
//         >
//           <h2
//             style={{
//               fontSize: '18px',
//               marginBottom: '15px',
//             }}
//           >
//             Event Attendance Trend (Time)
//           </h2>
//           <div
//             style={{
//               marginBottom: '20px',
//             }}
//           >
//             <ResponsiveContainer width="100%" height={200}>
//               <BarChart data={timeData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="time" />
//                 <YAxis />
//                 <Bar dataKey="registered" stackId="a" fill="#4A90E2" />
//                 <Bar dataKey="total" stackId="a" fill="#82B7FF" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           <div
//             style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(4, 1fr)',
//               gap: '10px',
//             }}
//           >
//             {participationCards.map(card => (
//               <div
//                 key={card}
//                 style={{
//                   background: '#f5f5f5',
//                   borderRadius: '4px',
//                   padding: '10px',
//                 }}
//               >
//                 <div
//                   style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     marginBottom: '5px',
//                   }}
//                 >
//                   <h3
//                     style={{
//                       fontSize: '18px',
//                       margin: 0,
//                     }}
//                   >
//                     {card.title}
//                   </h3>
//                   <button
//                     type="button"
//                     style={{
//                       background: 'none',
//                       border: 'none',
//                       cursor: 'pointer',
//                       fontSize: '16px',
//                     }}
//                   >
//                     <span style={{ fontSize: '16px' }}>&#9654;</span>
//                   </button>
//                 </div>
//                 <p
//                   style={{
//                     fontSize: '12px',
//                     color: '#666',
//                     margin: '5px 0',
//                   }}
//                 >
//                   {card.subtitle}
//                 </p>
//                 {card.participants && (
//                   <div
//                     style={{
//                       fontSize: '12px',
//                       marginTop: '5px',
//                     }}
//                   >
//                     <span style={{ fontSize: '16px' }}>&#128101;</span> +{card.participants}
//                   </div>
//                 )}
//                 <p
//                   style={{
//                     fontSize: '12px',
//                     fontWeight: 'bold',
//                     color: card.trendType === 'positive' ? 'green' : 'red',
//                   }}
//                 >
//                   {card.trend} Monthly
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//       <style jsx>{`
//         @media (max-width: 768px) {
//           div {
//             grid-template-columns: 1fr !important;
//           }
//           div > div:last-child > div:last-child {
//             grid-template-columns: repeat(2, 1fr) !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

// Sample data
const eventTypeData = [
  { name: 'Event Type 1', registered: 75 },
  { name: 'Event Type 2', registered: 60 },
  { name: 'Event Type 3', registered: 55 },
  { name: 'Event Type 4', registered: 50 },
  { name: 'Event Type 5', registered: 45 },
  { name: 'Event Type 6', registered: 40 },
];

const timeData = [
  { time: '9:00', registered: 8, attended: 12 },
  { time: '11:00', registered: 15, attended: 18 },
  { time: '13:00', registered: 20, attended: 25 },
  { time: '15:00', registered: 25, attended: 30 },
  { time: '17:00', registered: 18, attended: 20 },
  { time: '19:00', registered: 10, attended: 15 },
  { time: '21:00', registered: 5, attended: 8 },
];

const participationCards = [
  {
    title: '5+',
    subtitle: 'Repeated participation',
    trend: '-10%',
    trendType: 'negative',
    participants: 3,
  },
  {
    title: '2+',
    subtitle: 'Repeated participation',
    trend: '+25%',
    trendType: 'positive',
    participants: 3,
  },
  {
    title: '<1',
    subtitle: 'Repeated participation',
    trend: '-5%',
    trendType: 'negative',
    participants: 3,
  },
  {
    title: '420',
    subtitle: 'Total Members',
    trend: '+20%',
    trendType: 'positive',
  },
];

export default function EventDashboard() {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        Event Attendance Trend
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}
      >
        {/* Event Registration Trend (Type) */}
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              marginBottom: '15px',
            }}
          >
            Event Registration Trend (Type)
          </h2>
          <div
            style={{
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                color: '#666',
                marginBottom: '10px',
              }}
            >
              <span>Event Name</span>
              <span>Registered Members</span>
            </div>
            {eventTypeData.map(event => (
              <div
                key={event.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    width: '100px',
                    marginRight: '10px',
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  {event.name}
                </span>
                <div
                  style={{
                    flexGrow: 1,
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: '#4A90E2',
                      width: `${(event.registered / 75) * 100}%`,
                    }}
                  ></div>
                </div>
                <span
                  style={{
                    marginLeft: '10px',
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  {event.registered}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
            }}
          >
            {[
              { title: '325', subtitle: 'Total Registered Members', isPrimary: true },
              { title: 'Event Type 1', subtitle: 'Most Popular Event Type' },
              { title: 'Event Type 6', subtitle: 'Least Popular Event Type' },
            ].map(card => (
              <div
                key={card}
                style={{
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <h3 style={card.isPrimary ? { color: '#4A90E2' } : {}}>{card.title}</h3>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#666',
                  }}
                >
                  {card.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Event Registration Trend (Time) */}
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              marginBottom: '15px',
            }}
          >
            Event Registration Trend (Time)
          </h2>
          <div
            style={{
              marginBottom: '20px',
            }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="registered" name="Registered Users" fill="#4A90E2" />
                <Bar dataKey="attended" name="Attended Users" fill="#82B7FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
            }}
          >
            {participationCards.map(card => (
              <div
                key={card}
                style={{
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  padding: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '5px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '18px',
                      margin: 0,
                    }}
                  >
                    {card.title}
                  </h3>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>&#9654;</span>
                  </button>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    margin: '5px 0',
                  }}
                >
                  {card.subtitle}
                </p>
                {card.participants && (
                  <div
                    style={{
                      fontSize: '12px',
                      marginTop: '5px',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>&#128101;</span> +{card.participants}
                  </div>
                )}
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: card.trendType === 'positive' ? 'green' : 'red',
                  }}
                >
                  {card.trend} Monthly
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          div {
            grid-template-columns: 1fr !important;
          }
          div > div:last-child > div:last-child {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
