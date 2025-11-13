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

const Tag = ({ children, color }) => (
  <span className={`${icons.tag} ${icons[color]}`}>{children}</span>
);

export { IconByRole, Tag };
