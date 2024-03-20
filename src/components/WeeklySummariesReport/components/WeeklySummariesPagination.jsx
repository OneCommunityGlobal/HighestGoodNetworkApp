import PaginationRange from './util';

function WeeklySummariesPagination({ totalPages, page, limit, siblings }) {
  const array = PaginationRange(totalPages, page, limit, siblings);
  return (
    <div>
      <ul className="pagination pagination-md justify-content-end">
        <li className="page-item">
          <span className="page-link">&laquo;</span>
        </li>
        <li className="page-item">
          <span className="page-link">&lsaquo;</span>
        </li>
        {array.map(value => (
          <li key={value} className="page-item">
            <span className="page-link">{value}</span>
          </li>
        ))}
        <li className="page-item">
          <span className="page-link">&rsaquo;</span>
        </li>
        <li className="page-item">
          <span className="page-link">&raquo;</span>
        </li>
      </ul>
    </div>
  );
}

export default WeeklySummariesPagination;
