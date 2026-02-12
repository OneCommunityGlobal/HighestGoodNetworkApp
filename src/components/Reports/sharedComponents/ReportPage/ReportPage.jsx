import { ReportHeader } from './components/ReportHeader';
import { ReportBlock } from './components/ReportBlock';
import { ReportCard } from './components/ReportCard';
import styles from './ReportPage.module.css';

export function ReportPage({ children, renderProfile, contentClassName, darkMode }) {
  return (
    <section className={`${styles["report-page-wrapper"]} ${darkMode ? 'bg-oxford-blue' : ''}`}>
      {renderProfile && (
        <div className={darkMode ? styles["report-page-profile-dark"] : styles["report-page-profile"]}>
          {renderProfile()}
        </div>
      )}
        <div className={`${styles["report-page-content"]} ${contentClassName}`} data-testid="report-content">
          {children}
      </div>
    </section>
  );
}

ReportPage.ReportHeader = ReportHeader;
ReportPage.ReportBlock = ReportBlock;
ReportPage.ReportCard = ReportCard;
