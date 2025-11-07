import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './StudentProgressChart.module.css';
import MoleculeTooltip from './MoleculeTooltip';

/**
 * StudentProgressChart Component
 * Displays a circular progress chart showing molecules (atoms) earned by a student
 * - Gold dots: Completed molecules
 * - Green dots: In-progress molecules
 * - Grey dots: Not started/unearned molecules
 */
const StudentProgressChart = ({ subject, completedAtoms, inProgressAtoms, notStartedAtoms }) => {
  const [hoveredMolecule, setHoveredMolecule] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Combine all atoms for rendering
  const allAtoms = [
    ...completedAtoms.map(atom => ({ ...atom, status: 'completed' })),
    ...inProgressAtoms.map(atom => ({ ...atom, status: 'in_progress' })),
    ...notStartedAtoms.map(atom => ({ ...atom, status: 'not_started' })),
  ];

  // Add demo atoms if dataset is too small for good visualization
  const minAtomsForDemo = 15;
  const demoAtoms = [];

  if (allAtoms.length < minAtomsForDemo) {
    const neededAtoms = minAtomsForDemo - allAtoms.length;
    const difficulties = ['easy', 'medium', 'hard'];
    const statuses = ['completed', 'in_progress', 'not_started'];

    for (let i = 0; i < neededAtoms; i++) {
      demoAtoms.push({
        atomId: `demo-${subject}-${i}`,
        name: `${subject} Atom ${i + allAtoms.length + 1}`,
        description: `Learning objective for ${subject}`,
        difficulty: difficulties[i % difficulties.length],
        status: statuses[i % statuses.length],
        subject: subject,
        isDemo: true,
      });
    }
  }

  const displayAtoms = [...allAtoms, ...demoAtoms];

  // Calculate positions for molecules in a spiral pattern
  const getMoleculePositions = totalMolecules => {
    const positions = [];
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;
    const minRadius = 30;

    if (totalMolecules === 0) return positions;

    // For small numbers, use concentric circles
    if (totalMolecules <= 8) {
      const angles = [];
      for (let i = 0; i < totalMolecules; i++) {
        angles.push((i / totalMolecules) * 2 * Math.PI);
      }

      angles.forEach((angle, i) => {
        const radius =
          totalMolecules === 1 ? 0 : totalMolecules <= 4 ? 60 : minRadius + (i % 2) * 40;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions.push({ x, y });
      });
    } else {
      // Use spiral for larger numbers
      const spiralTurns = Math.max(2, Math.min(4, totalMolecules / 8));

      for (let i = 0; i < totalMolecules; i++) {
        const progress = i / (totalMolecules - 1);
        const angle = progress * spiralTurns * 2 * Math.PI;
        const radius = minRadius + progress * (maxRadius - minRadius);

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        positions.push({ x, y });
      }
    }

    return positions;
  };

  const positions = getMoleculePositions(displayAtoms.length);

  const handleMoleculeHover = (atom, event, index) => {
    setHoveredMolecule({ ...atom, index });
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMoleculeLeave = () => {
    setHoveredMolecule(null);
  };

  // Get color based on status
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return '#FFD700'; // Gold
      case 'in_progress':
        return '#4CAF50'; // Green
      case 'not_started':
      default:
        return '#BDBDBD'; // Grey
    }
  };

  // Get circle size based on difficulty
  const getCircleSize = difficulty => {
    switch (difficulty) {
      case 'easy':
        return 8;
      case 'medium':
        return 10;
      case 'hard':
        return 12;
      default:
        return 10;
    }
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.subjectTitle}>{subject}</h3>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendCircle} style={{ backgroundColor: '#FFD700' }} />
            <span>{displayAtoms.filter(a => a.status === 'completed').length} completed</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendCircle} style={{ backgroundColor: '#4CAF50' }} />
            <span>{displayAtoms.filter(a => a.status === 'in_progress').length} in progress</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendCircle} style={{ backgroundColor: '#BDBDBD' }} />
            <span>{displayAtoms.filter(a => a.status === 'not_started').length} remaining</span>
          </div>
        </div>
      </div>

      <svg
        className={styles.chartSvg}
        viewBox="0 0 300 300"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background gradient circles */}
        <defs>
          <radialGradient id={`gradient-${subject}`}>
            <stop offset="0%" stopColor="#E8F5E9" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#C8E6C9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#A5D6A7" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Gradient background */}
        <circle
          cx="150"
          cy="150"
          r="140"
          fill={`url(#gradient-${subject})`}
          className={styles.backgroundCircle}
        />

        {/* Molecules */}
        {displayAtoms.map((atom, index) => {
          const position = positions[index];
          const size = getCircleSize(atom.difficulty);
          const color = getStatusColor(atom.status);

          return (
            <g key={`${atom.atomId}-${index}`}>
              <circle
                cx={position.x}
                cy={position.y}
                r={size}
                fill={color}
                className={styles.molecule}
                onMouseEnter={e => handleMoleculeHover(atom, e, index)}
                onMouseLeave={handleMoleculeLeave}
                style={{
                  cursor: 'pointer',
                  filter: hoveredMolecule?.index === index ? 'brightness(1.2)' : 'none',
                  transition: 'all 0.2s ease',
                  opacity: atom.isDemo ? 0.7 : 1,
                }}
              />
              {/* Outer ring for in-progress items */}
              {atom.status === 'in_progress' && (
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={size + 3}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  className={styles.progressRing}
                  style={{ opacity: atom.isDemo ? 0.7 : 1 }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredMolecule && <MoleculeTooltip molecule={hoveredMolecule} position={tooltipPosition} />}
    </div>
  );
};

StudentProgressChart.propTypes = {
  subject: PropTypes.string.isRequired,
  completedAtoms: PropTypes.arrayOf(
    PropTypes.shape({
      atomId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']),
      grade: PropTypes.string,
      timestamp: PropTypes.string,
      sourceTask: PropTypes.object,
    }),
  ).isRequired,
  inProgressAtoms: PropTypes.arrayOf(
    PropTypes.shape({
      atomId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']),
    }),
  ).isRequired,
  notStartedAtoms: PropTypes.arrayOf(
    PropTypes.shape({
      atomId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']),
    }),
  ).isRequired,
};

export default StudentProgressChart;
