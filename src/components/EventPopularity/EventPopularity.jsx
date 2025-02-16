"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Sample data
const eventTypeData = [
  { name: "Event Type 1", registered: 75 },
  { name: "Event Type 2", registered: 60 },
  { name: "Event Type 3", registered: 55 },
  { name: "Event Type 4", registered: 50 },
  { name: "Event Type 5", registered: 45 },
  { name: "Event Type 6", registered: 40 },
]

const timeData = [
  { time: "9:00", registered: 8, total: 12 },
  { time: "11:00", registered: 15, total: 18 },
  { time: "13:00", registered: 20, total: 25 },
  { time: "15:00", registered: 25, total: 30 },
  { time: "17:00", registered: 18, total: 20 },
  { time: "19:00", registered: 10, total: 15 },
  { time: "21:00", registered: 5, total: 8 },
]

const participationCards = [
  {
    title: "5+",
    subtitle: "Repeated participation",
    trend: "-10%",
    trendType: "negative",
    participants: 3,
  },
  {
    title: "2+",
    subtitle: "Repeated participation",
    trend: "+25%",
    trendType: "positive",
    participants: 3,
  },
  {
    title: "<1",
    subtitle: "Repeated participation",
    trend: "-5%",
    trendType: "negative",
    participants: 3,
  },
  {
    title: "420",
    subtitle: "Total Members",
    trend: "+20%",
    trendType: "positive",
  },
]

export default function EventDashboard() {
  const [viewType, setViewType] = useState("week")
  const [eventType, setEventType] = useState("online")
  const [timePeriod, setTimePeriod] = useState("this-week")

  // Custom Select Component
  const Select = ({ value, onChange, options, className }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select} className={className}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  return (
    <div style={styles.container}>
      <div style={styles.dashboard}>
        {/* Event Registration Trend (Type) */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Event Registration Trend (Type)</h2>
          <div style={styles.cardHeader}>
            <div style={styles.selectGroup}>
              <Select
                value={eventType}
                onChange={setEventType}
                options={[
                  { value: "online", label: "Online" },
                  { value: "offline", label: "Offline" },
                ]}
              />
              <Select
                value={timePeriod}
                onChange={setTimePeriod}
                options={[
                  { value: "this-week", label: "This Week" },
                  { value: "last-week", label: "Last Week" },
                ]}
              />
            </div>
            <button style={styles.iconButton}>
              <span style={styles.icon}>&#9660;</span>
            </button>
          </div>

          <div style={styles.eventList}>
            <div style={styles.eventListHeader}>
              <span>Event Name</span>
              <span>Registered Members</span>
            </div>
            {eventTypeData.map((event) => (
              <div key={event.name} style={styles.eventItem}>
                <span style={styles.eventLabel}>{event.name}</span>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progress,
                      width: `${(event.registered / 75) * 100}%`,
                    }}
                  ></div>
                </div>
                <span style={styles.eventCount}>{event.registered}</span>
              </div>
            ))}
          </div>

          <div style={styles.summaryCards}>
            {[
              { title: "325", subtitle: "Total Registered Members", isPrimary: true },
              { title: "Event Type 1", subtitle: "Most Popular Event Type" },
              { title: "Event Type 6", subtitle: "Least Popular Event Type" },
            ].map((card, index) => (
              <div key={index} style={styles.summaryCard}>
                <h3 style={card.isPrimary ? styles.primaryText : {}}>{card.title}</h3>
                <p style={styles.summaryCardSubtitle}>{card.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Event Registration Trend (Time) */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Event Registration Trend (Time)</h2>
          <div style={styles.cardHeader}>
            <div style={styles.selectGroup}>
              <Select
                value={eventType}
                onChange={setEventType}
                options={[
                  { value: "online", label: "Online" },
                  { value: "offline", label: "Offline" },
                ]}
              />
              <Select
                value={timePeriod}
                onChange={setTimePeriod}
                options={[
                  { value: "this-week", label: "This Week" },
                  { value: "last-week", label: "Last Week" },
                ]}
              />
            </div>
            <div style={styles.toggleGroup}>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(viewType === "week" ? styles.activeToggle : {}),
                }}
                onClick={() => setViewType("week")}
              >
                Week
              </button>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(viewType === "hour" ? styles.activeToggle : {}),
                }}
                onClick={() => setViewType("hour")}
              >
                Hour
              </button>
            </div>
          </div>

          <div style={styles.chart}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Bar dataKey="registered" stackId="a" fill="#4A90E2" />
                <Bar dataKey="total" stackId="a" fill="#82B7FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.participationCards}>
            {participationCards.map((card, index) => (
              <div key={index} style={styles.participationCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.participationCardTitle}>{card.title}</h3>
                  <button style={styles.iconButton}>
                    <span style={styles.icon}>&#9654;</span>
                  </button>
                </div>
                <p style={styles.participationCardSubtitle}>{card.subtitle}</p>
                {card.participants && (
                  <div style={styles.participants}>
                    <span style={styles.icon}>&#128101;</span> +{card.participants}
                  </div>
                )}
                <p
                  style={{
                    ...styles.trend,
                    color: card.trendType === "positive" ? "green" : "red",
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
          .dashboard {
            grid-template-columns: 1fr !important;
          }
          .participation-cards {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  dashboard: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  card: {
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    marginBottom: "15px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  selectGroup: {
    display: "flex",
    gap: "10px",
  },
  select: {
    padding: "5px 10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  icon: {
    fontSize: "16px",
  },
  eventList: {
    marginBottom: "20px",
  },
  eventListHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#666",
    marginBottom: "10px",
  },
  eventItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  progressBar: {
    flexGrow: 1,
    height: "8px",
    background: "#e0e0e0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    background: "#4A90E2",
  },
  eventCount: {
    marginLeft: "10px",
    fontSize: "14px",
    color: "#666",
  },
  summaryCards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  summaryCard: {
    background: "#f5f5f5",
    borderRadius: "4px",
    padding: "10px",
    textAlign: "center",
  },
  primaryText: {
    color: "#4A90E2",
  },
  summaryCardSubtitle: {
    fontSize: "12px",
    color: "#666",
  },
  toggleGroup: {
    display: "flex",
    border: "1px solid #ccc",
    borderRadius: "4px",
    overflow: "hidden",
  },
  toggleButton: {
    padding: "5px 10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },
  activeToggle: {
    background: "#4A90E2",
    color: "white",
  },
  chart: {
    marginBottom: "20px",
  },
  participationCards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
  },
  participationCard: {
    background: "#f5f5f5",
    borderRadius: "4px",
    padding: "10px",
  },
  participationCardTitle: {
    fontSize: "18px",
    margin: 0,
  },
  participationCardSubtitle: {
    fontSize: "12px",
    color: "#666",
    margin: "5px 0",
  },
  participants: {
    fontSize: "12px",
    marginTop: "5px",
  },
  trend: {
    fontSize: "12px",
    fontWeight: "bold",
  },
  eventLabel: {
    width: "100px",
    marginRight: "10px",
    fontSize: "14px",
    color: "#666",
  },
}

