import classnames from 'classnames';
import './ReportHeader.css';

export const ReportHeader = ({ children, isActive, src}) => {
  return (
    <section className='wrapper'>
      <header className='header'>
        <div className='details'>
          <div className="profile-pic-wrapper">
            <img src={src || '/pfp-default.png'} alt="Report profile picture" className="profile-pic" />
            <div className={classnames('activity', {active: isActive})} />
          </div>
          {children}
        </div>
      </header>
    </section>
)}