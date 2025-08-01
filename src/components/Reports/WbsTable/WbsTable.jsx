import './WbsTable.css';
import Stub from '../../common/Stub/Stub';
import CopyToClipboard from '../../common/Clipboard/CopyToClipboard';

export function WbsTable({ wbs, skip, take, match, canViewWBS, darkMode }) {
  let WbsList = [];
  const projectId = match?.params?.projectId;

  if (wbs.fetched && wbs.WBSItems.length > 0) {
    WbsList = wbs.WBSItems.slice(skip, skip + take).map((item, index) => (
      <div
        className="wbs-table-row"
        data-testid="wbs-table-row"
        id={`tr_${item._id}`}
        key={item._id}
      >
        <div>{skip + index + 1}</div>
        <div>
          {canViewWBS ? (
            <a
              href={`/wbs/tasks/${item._id}/${projectId}/${item.wbsName}`}
              className={`wbs-table-name-column ${darkMode ? 'text-light' : ''}`}
            >
              {item.wbsName}
            </a>
          ) : (
            <div>{item.wbsName}</div>
          )}
        </div>
        <div className="projects__active--input">
          {item.isActive ? (
            <div className="isActive" data-testid="wbs-active-icon">
              <i className="fa fa-circle" aria-hidden="true" />
            </div>
          ) : (
            <div className="isNotActive" data-testid="wbs-inactive-icon">
              <i className="fa fa-circle-o" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="wbs-table-id-column">
          <CopyToClipboard writeText={item._id} message={`Copied "${item._id}".`} />
          {item._id}
        </div>
      </div>
    ));
  }

  return (
    <div className={`wbs-table ${darkMode ? 'text-light' : ''}`}>
      <h5 style={{ marginBottom: '2.125rem' }} className="wbs-table-title">
        WBS
      </h5>
      <div className={`reports-table-head-wbs ${darkMode ? 'bg-space-cadet' : ''}`}>
        <div className="wbs-table-cell">#</div>
        <div className="wbs-table-cell">Name</div>
        <div className="wbs-table-cell wbs-table-active-column">Active</div>
        <div className="wbs-table-cell">ID</div>
      </div>
      <div>{WbsList.length > 0 ? WbsList : <Stub color={darkMode ? 'white' : ''} />}</div>
    </div>
  );
}
