import "./ReportPage.css";

export const ReportPage = ({ children, renderProfile }) => (
  <section className='report-page-wrapper'>
    <div className='report-page-profile'>{renderProfile()}</div>
    <div className='report-page-content'>{children}</div>
  </section>
);
