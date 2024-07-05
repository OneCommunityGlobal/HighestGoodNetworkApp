import { ReportHeader } from './components/ReportHeader';
import { ReportBlock } from './components/ReportBlock';
import { ReportCard } from './components/ReportCard';
import './ReportPage.css';
import { boxStyle, boxStyleDark } from 'styles';

export function ReportPage({ children, renderProfile, contentClassName, darkMode, projectName}) {
  return (
    <section className={`report-page-wrapper ${darkMode ? 'bg-oxford-blue' : ''}`}>
      <div className={`project-header ${darkMode ? 'bg-yinmn-blue text-light' : ''}`} style={darkMode ? boxStyleDark : boxStyle}>{projectName}</div> 
      <div className={`${darkMode ? "report-page-profile-dark" : "report-page-profile"}`}>{renderProfile()}</div>
      <div className={`report-page-content ${contentClassName}`}>{children}</div>
    </section>
  );
}

ReportPage.ReportHeader = ReportHeader;
ReportPage.ReportBlock = ReportBlock;
ReportPage.ReportCard = ReportCard;
