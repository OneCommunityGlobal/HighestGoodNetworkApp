import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

function WeeklySummariesPagination({ handlePageClick, currentPage, pagesCount }) {
  const steps = 5;
  return (
    <div>
      <Pagination>
        <PaginationItem>
          <PaginationLink
            href="#"
            previous
            disabled={currentPage <= 0}
            onClick={e => handlePageClick(e, currentPage - 1)}
          />
        </PaginationItem>
        {[...Array(pagesCount)].slice(0, 5).map((_, i) => (
          <PaginationItem active={i === currentPage} key={_}>
            <PaginationLink onClick={e => handlePageClick(e, i)} href="#">
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationLink href="#">...</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">{currentPage + 1}</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">...</PaginationLink>
        </PaginationItem>
        {[...Array(pagesCount)].slice(-steps).map((_, i) => (
          <PaginationItem active={pagesCount - (steps - i) + 1 === currentPage} key={_}>
            <PaginationLink
              onClick={e => handlePageClick(e, pagesCount - (steps - i) + 1)}
              href="#"
            >
              {pagesCount - (steps - i) + 2}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationLink
            href="#"
            next
            disabled={currentPage >= pagesCount}
            onClick={e => handlePageClick(e, currentPage + 1)}
          />
        </PaginationItem>
      </Pagination>
    </div>
  );
}

export default WeeklySummariesPagination;
