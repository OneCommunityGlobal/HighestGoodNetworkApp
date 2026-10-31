import PropTypes from 'prop-types';
import icons from './styles/icons.module.css';
import { Briefcase, GraduationCap, User } from 'lucide-react';

const IconByRole = ({ role, className = icons.icon }) => {
  switch (role) {
    case 'Educator':
      return <Briefcase className={className} />;
    case 'Student':
      return <GraduationCap className={className} />;
    case 'Support':
      return <User className={className} />;
    default:
      return <User className={className} />;
  }
};

IconByRole.propTypes = {
  role: PropTypes.string.isRequired,
  className: PropTypes.string,
};

const Tag = ({ children, color, darkMode }) => {
  const darkColor = darkMode ? `${color}Dark` : undefined;
  return (
    <span
      className={`${icons.tag} ${icons[color]} ${darkMode && darkColor ? icons[darkColor] : ''}`}
    >
      {children}
    </span>
  );
};

Tag.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  darkMode: PropTypes.bool,
};

export { IconByRole, Tag };
