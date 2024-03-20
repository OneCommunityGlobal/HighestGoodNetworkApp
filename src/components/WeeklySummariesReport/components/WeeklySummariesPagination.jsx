function WeeklySummariesPagination() {
  return (
    <div>
      <ul className="pagination pagination-md justify-content-end">
        <li className="page-item">
          <span className="page-link">&laquo;</span>
        </li>
        <li className="page-item">
          <span className="page-link">&lsaquo;</span>
        </li>
        <li className="page-item">
          <span className="page-link"> 1</span>
        </li>
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
