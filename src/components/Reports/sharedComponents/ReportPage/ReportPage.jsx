import { ReportHeader } from './components/ReportHeader';
import { ReportBlock } from './components/ReportBlock';
import { ReportCard } from './components/ReportCard';
import './ReportPage.css';

export function ReportPage({ children, renderProfile, contentClassName }) {
  return (
    <section className="report-page-wrapper">
      <div className="report-page-profile">{renderProfile()}</div>
      <div className={`report-page-content ${contentClassName}`}>{children}</div>
    </section>
  );
}

ReportPage.ReportHeader = ReportHeader;
ReportPage.ReportBlock = ReportBlock;
ReportPage.ReportCard = ReportCard;