import PaginationRange from './util';

function WeeklySummariesPagination({ totalPages, page, limit, siblings, handlePageChange }) {
  const array = PaginationRange(totalPages, page, limit, siblings);
  return (
    <div>
      <ul className="pagination pagination-md justify-content-end">
        <li className="page-item">
          <button type="button" onClick={() => handlePageChange('&laquo;')} className="page-link">
            &laquo;
          </button>
        </li>
        <li className="page-item">
          <button type="button" onClick={() => handlePageChange('&lsaquo;')} className="page-link">
            &lsaquo;
          </button>
        </li>
        {array.map((value, idx) => {
          // Remove identical key error
          const key = value + idx;
          if (value === page) {
            return (
              <li key={key} value={value} className="page-item active">
                <button type="button" className="page-link" onClick={() => handlePageChange(value)}>
                  {value}
                </button>
              </li>
            );
          }
          return (
            <li key={key} value={value} className="page-item">
              <button type="button" className="page-link" onClick={() => handlePageChange(value)}>
                {value}
              </button>
            </li>
          );
        })}
        <li className="page-item">
          <button type="button" className="page-link" onClick={() => handlePageChange('&rsaquo;')}>
            &rsaquo;
          </button>
        </li>
        <li className="page-item">
          <button type="button" className="page-link" onClick={() => handlePageChange('&raquo;')}>
            &raquo;
          </button>
        </li>
      </ul>
    </div>
  );
}

export default WeeklySummariesPagination;
