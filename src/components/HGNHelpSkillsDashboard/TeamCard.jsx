import React from "react";
import { Mail } from "lucide-react";

// CSS styles as a JavaScript object
const styles = {
  teamCardContainer: {
    width: "580px",
    height: "449",
    display: "flex",
    flexDirection: "column",
    borderRadius: "20px",
    border: "1px solid #000",
    overflow: "hidden",
    padding: "20px",
  },
  teamCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px",
  },
  teamCardTitle: {
    display: "flex",

    color: "#6E6E6E",
    fontFamily: "Inter",
    fontSize: "24px",
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "150%" /* 36px */,
  },
  teamCardRatingLabel: {
    fontSize: "24px",
    fontWeight: 600,
    fontFamily: "Inter, sans-serif",
    lineHeight: "150%",
    color: "#6E6E6E",
  },
  teamMemberRow: {
    padding: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamMemberInfo: {
    display: "flex",
    alignItems: "center",
  },
  teamMemberName: {
    fontSize: "32px",
    fontWeight: 600,
    fontFamily: "Inter, sans-serif",
    lineHeight: "150%",
    color: "#000",
    width: "250px",
  },
  teamMemberIcons: {
    display: "flex",
    alignItems: "center",
    marginLeft: "58px",
  },
  icon: {
    width: "26px",
    height: "26px",
    flexShrink: 0,
    margin: "0 20px",
    color: "#6E6E6E",
  },
  scoreBase: {
    fontSize: "28px",
    fontWeight: 600,
    fontFamily: "Inter, sans-serif",
    lineHeight: "150%",
  },
  scoreGreen: {
    color: "#008000",
  },
  scoreRed: {
    color: "#FF0000",
  },
  showMoreLink: {
    marginTop: "8px",
  },
  showMoreText: {
    fontSize: "32px",
    fontWeight: 600,
    fontFamily: "Inter, sans-serif",
    lineHeight: "150%",
    color: "#000",
    textDecorationLine: "underline",
    cursor: "pointer",
    textAlign: "center",
  },
};

export default function TeamCard() {

  const teamMembers = [
    { name: "Shreya Laheri", score: "9/10" },
    { name: "Shreya Vithala", score: "7/10" },
    { name: "Jae Sabol", score: "5/10" },
    { name: "Sara Sabol", score: "2/10" },
  ];


  const getScoreStyle = (score) => {
    const scoreNum = parseInt(score);
    return scoreNum >= 5
      ? { ...styles.scoreBase, ...styles.scoreGreen }
      : { ...styles.scoreBase, ...styles.scoreRed };
  };

  // Colorful Slack icon component
  const SlackIcon = ({ size = 16, style = {} }) => (
    <svg
      width={size}
      height={size}
      style={{ ...styles.icon, ...style }}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.194 14.644c0 1.16-.943 2.107-2.103 2.107-1.16 0-2.103-.947-2.103-2.107 0-1.16.943-2.106 2.103-2.106h2.103v2.106zm1.061 0c0-1.16.943-2.106 2.104-2.106 1.16 0 2.103.946 2.103 2.106v5.274c0 1.16-.943 2.107-2.103 2.107-1.161 0-2.104-.947-2.104-2.107v-5.274z"
        fill="#E01E5A"
      />
      <path
        d="M9.359 6.169c-1.161 0-2.104-.946-2.104-2.106 0-1.16.943-2.107 2.104-2.107 1.16 0 2.103.947 2.103 2.107v2.106H9.36zm0 1.068c1.16 0 2.103.946 2.103 2.106 0 1.16-.943 2.107-2.103 2.107H4.09c-1.16 0-2.103-.947-2.103-2.107 0-1.16.943-2.106 2.103-2.106h5.27z"
        fill="#36C5F0"
      />
      <path
        d="M17.81 9.343c0-1.16.943-2.107 2.103-2.107 1.161 0 2.104.947 2.104 2.107 0 1.16-.943 2.106-2.104 2.106h-2.103V9.343zm-1.06 0c0 1.16-.944 2.106-2.104 2.106-1.16 0-2.103-.946-2.103-2.106V4.063c0-1.16.943-2.107 2.103-2.107 1.16 0 2.104.947 2.104 2.107v5.28z"
        fill="#2EB67D"
      />
      <path
        d="M14.646 17.818c1.16 0 2.104.947 2.104 2.107 0 1.16-.944 2.107-2.104 2.107-1.16 0-2.103-.947-2.103-2.107v-2.107h2.103zm0-1.068c-1.16 0-2.103-.947-2.103-2.106 0-1.16.943-2.107 2.103-2.107h5.27c1.16 0 2.103.946 2.103 2.107 0 1.16-.943 2.106-2.104 2.106h-5.27z"
        fill="#ECB22E"
      />
    </svg>
  );

  return (
    <>
      <div style={styles.teamCardContainer}>
        <div style={styles.teamCardHeader}>
          <h2 style={styles.teamCardTitle}>
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="42"
                viewBox="0 0 40 42"
                fill="none"
              >
                <path
                  d="M10 15.5234L20 25.8742L30 15.5234"
                  stroke="#828282"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>{" "}
            Your Team_______ rating
          </h2>
        </div>
        <div>
          {teamMembers.map((member, index) => (
            <div key={index} style={styles.teamMemberRow}>
              <div style={styles.teamMemberInfo}>
                <span style={styles.teamMemberName}>{member.name}</span>
                <div style={styles.teamMemberIcons}>
                  <Mail size={16} style={styles.icon} />
                  <SlackIcon size={16} />
                </div>
              </div>
              <span style={getScoreStyle(member.score.split("/")[0])}>
                {member.score}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.showMoreLink}>
        <span style={styles.showMoreText}>Show your team member &gt;</span>
      </div>
    </>
  );
}
