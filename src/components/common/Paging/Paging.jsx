import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import classnames from 'classnames';
import styles from './Paging.module.css';

// eslint-disable-next-line react/function-component-definition
const Paging = ({ maxElemPerPage = 6, totalElementsCount, children, darkMode }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const pageIndexButton = darkMode ? styles.pageIndexButtonDark : styles.pageIndexButton;

  const paginationButtons = darkMode ? styles.paginationButtonsDark : styles.paginationButtons;

  const pagesCount = Math.ceil(totalElementsCount / maxElemPerPage);

  const renderPageNumberButton = pageNumber => (
    <div
      role="button"
      tabIndex="0"
      onClick={() => setCurrentPage(pageNumber)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          setCurrentPage(pageNumber);
        }
      }}
      className={classnames(pageIndexButton, {
        [styles.activeButton]: !darkMode && pageNumber === currentPage,
        [styles.activeButtonDark]: darkMode && pageNumber === currentPage,
      })}
      key={pageNumber}
    >
      {pageNumber}
    </div>
  );

  const renderPageIndexes = () => {
    const indexesButtons = [];

    if (pagesCount <= 6) {
      for (let i = 1; i <= pagesCount; i += 1) {
        indexesButtons.push(renderPageNumberButton(i));
      }
      return <div className={paginationButtons}>{indexesButtons}</div>;
    }

    if (currentPage <= 5) {
      for (let i = 1; i <= 5; i += 1) {
        indexesButtons.push(renderPageNumberButton(i));
      }
      return (
        <div className={paginationButtons}>
          {indexesButtons}…{renderPageNumberButton(pagesCount)}
        </div>
      );
    }

    if (currentPage > pagesCount - 5) {
      for (let i = pagesCount - 4; i <= pagesCount; i += 1) {
        indexesButtons.push(renderPageNumberButton(i));
      }
      return (
        <div className={paginationButtons}>
          {renderPageNumberButton(1)}…{indexesButtons}
        </div>
      );
    }

    for (let i = currentPage - 1; i <= currentPage + 2; i += 1) {
      indexesButtons.push(renderPageNumberButton(i));
    }

    return (
      <div className={paginationButtons}>
        {renderPageNumberButton(1)}…{indexesButtons}…{renderPageNumberButton(pagesCount)}
      </div>
    );
  };

  return (
    <div className={styles.pagingWrapper}>
      {React.cloneElement(children, {
        skip: maxElemPerPage * (currentPage - 1),
        take: maxElemPerPage,
      })}

      {totalElementsCount > maxElemPerPage && (
        <div className={styles.paginationButtonsWrapper}>
          <FiChevronLeft
            role="button"
            tabIndex="0"
            aria-label="Previous Page"
            className={classnames(pageIndexButton, {
              [styles.disabled]: currentPage === 1,
            })}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          />

          {renderPageIndexes()}

          <FiChevronRight
            role="button"
            tabIndex="0"
            aria-label="Next Page"
            className={classnames(pageIndexButton, {
              [styles.disabled]: currentPage === pagesCount,
            })}
            onClick={() => currentPage < pagesCount && setCurrentPage(currentPage + 1)}
          />
        </div>
      )}
    </div>
  );
};

export default Paging;
