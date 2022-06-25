import './ReportHeader.css';

export const ReportHeader = ({ children }) => {
  return (
    <section className='wrapper'>
      <header className='header'>
        <div className='details'>
          {children}
        </div>
      </header>
    </section>
)}