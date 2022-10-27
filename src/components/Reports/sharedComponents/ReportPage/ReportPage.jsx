import { ReportHeader } from "./components/ReportHeader";
import { ReportBlock } from "./components/ReportBlock";
import "./ReportPage.css";

export const ReportPage = ({ children, renderProfile, contentClassName }) => (
  <section className='report-page-wrapper'>
    <div className='report-page-profile'>{renderProfile()}</div>
    <div className={`report-page-content ${contentClassName}`}>{children}</div>
  </section>
);

ReportPage.ReportHeader = ReportHeader;
ReportPage.ReportBlock = ReportBlock;
