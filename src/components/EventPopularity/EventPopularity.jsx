'use client';

import { useState } from 'react';
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
import styles from './EventPopularity.module.css';

// Sample data
const eventTypeData = [
  { name: 'Community Volunteer Day', registered: 75 },
  { name: 'Skill Development Workshop', registered: 60 },
  { name: 'Networking Mixer', registered: 55 },
  { name: 'Environmental Cleanup', registered: 50 },
  { name: 'Youth Membership Program', registered: 45 },
  { name: 'Cultural Exchange Event', registered: 40 },
];

const timeData = [
  { time: '9:00 AM', registered: 8, attended: 12 },
  { time: '11:00 AM', registered: 15, attended: 18 },
  { time: '1:00 PM', registered: 20, attended: 25 },
  { time: '3:00 PM', registered: 25, attended: 30 },
  { time: '5:00 PM', registered: 18, attended: 20 },
  { time: '7:00 PM', registered: 10, attended: 15 },
  { time: '9:00 PM', registered: 5, attended: 8 },
];

const participationCards = [
  {
    title: '5+ Events',
    subtitle: 'Highly Engaged Members',
    description: 'Users who attended 5 or more events',
    trend: '-10%',
    trendType: 'negative',
    participants: 3,
  },
  {
    title: '2-4 Events',
    subtitle: 'Regular Participants',
    description: 'Users who attended 2 to 4 events',
    trend: '+25%',
    trendType: 'positive',
    participants: 3,
  },
  {
    title: '1 Event',
    subtitle: 'New/One-Time Attendees',
    description: 'First-time or one-time participants',
    trend: '-5%',
    trendType: 'negative',
    participants: 3,
  },
  {
    title: '420 Users',
    subtitle: 'Total Active Members',
    description: 'Total users with at least one event attendance',
    trend: '+20%',
    trendType: 'positive',
  },
];

const InfoTooltip = ({ text, children }) => {
  const [showToolTip, setShowTooltip] = useState(false);

  return (
    <div
      className={styles.infotooltipHover}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showToolTip && (
        <div className={styles.infotooltipheading}>
          {text}
          <div className={styles.infotooltiptext}></div>
        </div>
      )}
    </div>
  );
};

export default function EventDashboard() {
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dateRangeLabel = `${thirtyDaysAgo.toLocaleDateString()} - ${currentDate.toLocaleDateString()}`;

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          marginBottom: '30px',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '10px',
            textAlign: 'center',
          }}
        >
          Event Attendance Dashboard
        </h1>
        <div
          style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#666',
            marginBottom: '5px',
          }}
        >
          <strong>Time Period:</strong> Last 30 days ({dateRangeLabel})
        </div>
        <div
          style={{
            textAlign: 'center',
            fontSize: '13px',
            color: '#999',
          }}
        >
          All metrics below reflect data from the selected time period
        </div>
      </div>

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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: 0,
                marginRight: '8px',
              }}
            >
              Event Registration by Type
            </h2>
            <InfoTooltip text="Total users who registered (signed up) for each event type">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  height: '18px',
                  background: '#4A90E2',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'help',
                }}
              >
                ?
              </span>
            </InfoTooltip>
          </div>

          <div
            style={{
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#999',
                marginBottom: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              <span>Event Name</span>
              <span>Registered Users</span>
            </div>
            {eventTypeData.map(event => (
              <div
                key={event.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <span
                  style={{
                    width: '140px',
                    marginRight: '10px',
                    fontSize: '13px',
                    color: '#333',
                    fontWeight: '500',
                  }}
                >
                  {event.name}
                </span>
                <div
                  style={{
                    flexGrow: 1,
                    height: '10px',
                    background: '#e8e8e8',
                    borderRadius: '5px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: '#4A90E2',
                      width: `${(event.registered / 75) * 100}%`,
                    }}
                  />
                </div>
                <span
                  style={{
                    marginLeft: '12px',
                    fontSize: '13px',
                    color: '#333',
                    fontWeight: '600',
                    minWidth: '35px',
                    textAlign: 'right',
                  }}
                >
                  {event.registered} users
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
              {
                title: '325 Users',
                subtitle: 'Total Registrations',
                isPrimary: true,
                description: 'Total users who registered across all event types',
              },
              {
                title: 'Community Volunteer Day',
                subtitle: 'Most Popular',
                description: 'Event type with highest registrations',
              },
              {
                title: 'Cultural Exchange Event',
                subtitle: 'Least Popular',
                description: 'Event type with lowest registrations',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f9f9f9',
                  borderRadius: '6px',
                  padding: '12px',
                  textAlign: 'center',
                  border: '1px solid #f0f0f0',
                }}
              >
                <h3
                  style={{
                    fontSize: card.isPrimary ? '16px' : '14px',
                    fontWeight: card.isPrimary ? '700' : '600',
                    color: card.isPrimary ? '#4A90E2' : '#333',
                    margin: '0 0 4px 0',
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#999',
                    margin: '4px 0',
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: 0,
                marginRight: '8px',
              }}
            >
              Event Attendance by Time Slot
            </h2>
            <InfoTooltip text="Registered = sign-ups | Attended = actual participants who showed up">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  height: '18px',
                  background: '#4A90E2',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'help',
                }}
              >
                ?
              </span>
            </InfoTooltip>
          </div>

          <div
            style={{
              marginBottom: '20px',
            }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" interval={0} angle={-35} textAnchor="end" height={60} />
                <YAxis label={{ value: 'Number of Users', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={value => `${value} users`}
                  contentStyle={{
                    background: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />
                <Bar dataKey="registered" name="Registered Users (Sign-ups)" fill="#4A90E2" />
                <Bar dataKey="attended" name="Attended Users (Show-ups)" fill="#82B7FF" />
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
            {participationCards.map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f9f9f9',
                  borderRadius: '6px',
                  padding: '12px',
                  border: '1px solid #f0f0f0',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '6px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      margin: 0,
                      color: '#333',
                    }}
                  >
                    {card.title}
                  </h3>
                  <InfoTooltip text={card.description}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        background: '#ddd',
                        color: '#666',
                        borderRadius: '50%',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'help',
                        flexShrink: 0,
                      }}
                    >
                      ?
                    </span>
                  </InfoTooltip>
                </div>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#999',
                    margin: '0 0 6px 0',
                    fontWeight: '500',
                  }}
                >
                  {card.subtitle}
                </p>
                {card.participants && (
                  <div
                    style={{
                      fontSize: '12px',
                      marginTop: '6px',
                      color: '#666',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>👥</span> {card.participants} users
                  </div>
                )}
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: card.trendType === 'positive' ? '#27ae60' : '#e74c3c',
                    margin: '6px 0 0 0',
                  }}
                >
                  {card.trend} vs last month
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div {
            grid-template-columns: 1fr !important;
          }
          div > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
